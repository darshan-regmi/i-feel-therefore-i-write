"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  EmailAuthProvider,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  getRedirectResult,
  linkWithCredential,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  type User,
} from "firebase/auth";
import { getFirebaseAuth, getFirebaseDb } from "@/lib/firebase";
import { getLikedPoemIds } from "@/lib/likes";
import { migrateLikes, type AnonymousLikesSnapshot } from "@/utils/firebaseUtils";
import { isInAppBrowser } from "@/lib/inAppBrowser";
import {
  reportAuthError,
  shouldShowCode,
  type AuthErrorInfo,
} from "@/lib/authErrors";
import { safeNextPath } from "@/lib/safeNext";
import FormField from "./FormField";
import TextButton from "./TextButton";

type Mode = "login" | "signup" | "reset";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;
const MAX_STARTUP_WAIT_MS = 5000;
const RESET_COOLDOWN_SECONDS = 60;

const PENDING_LIKES_KEY = "pendingAnonLikes";
const GOOGLE_REDIRECT_MARKER_KEY = "googleRedirectPending";

const GOOGLE_REDIRECT_FALLBACK_CODES = new Set([
  "auth/popup-blocked",
  "auth/operation-not-supported-in-this-environment",
]);

const GOOGLE_INCOMPLETE_NOTICE =
  "google sign-in didn’t complete. email and password still work.";

const MIGRATION_NOTICE =
  "you’re signed in, but your earlier likes couldn’t be carried over.";

const RESET_CONFIRMATION =
  "if that address has a home here, the letter is on its way.";

type FieldErrors = { email?: string; password?: string };

function readRedirectMarker(): boolean {
  try {
    const pending = sessionStorage.getItem(GOOGLE_REDIRECT_MARKER_KEY) === "1";
    sessionStorage.removeItem(GOOGLE_REDIRECT_MARKER_KEY);
    return pending;
  } catch {
    return false;
  }
}

function writeRedirectMarker() {
  try {
    sessionStorage.setItem(GOOGLE_REDIRECT_MARKER_KEY, "1");
  } catch {
    // Only the "didn't complete" notice is lost.
  }
}

function clearRedirectMarker() {
  try {
    sessionStorage.removeItem(GOOGLE_REDIRECT_MARKER_KEY);
  } catch {
    // Ignore.
  }
}

function readPendingLikes(): AnonymousLikesSnapshot | null {
  try {
    const raw = sessionStorage.getItem(PENDING_LIKES_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<AnonymousLikesSnapshot>;
    if (
      typeof parsed.uid !== "string" ||
      !Array.isArray(parsed.poemIds) ||
      !parsed.poemIds.every((id) => typeof id === "string")
    ) {
      return null;
    }
    return { uid: parsed.uid, poemIds: parsed.poemIds };
  } catch {
    return null;
  }
}

function writePendingLikes(snapshot: AnonymousLikesSnapshot | null) {
  try {
    if (snapshot) {
      sessionStorage.setItem(PENDING_LIKES_KEY, JSON.stringify(snapshot));
    } else {
      sessionStorage.removeItem(PENDING_LIKES_KEY);
    }
  } catch {
    // Sign-in still works; only the likes hand-off is skipped.
  }
}

function toShownError(error: unknown): AuthErrorInfo | null {
  const info = reportAuthError(error);
  return info.message ? info : null;
}

function authErrorCode(error: unknown): string | null {
  return typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as { code?: unknown }).code === "string"
    ? (error as { code: string }).code
    : null;
}

async function migrateSnapshot(
  snapshot: AnonymousLikesSnapshot | null,
  uid: string
): Promise<void> {
  if (!snapshot || snapshot.uid === uid) return;
  await migrateLikes(snapshot, uid, getFirebaseDb());
}

export default function AuthForm({ mode }: { mode: Mode }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const next = safeNextPath(searchParams.get("next"));
  const rawNext = searchParams.get("next");
  const samePageQuery = rawNext ? `?next=${encodeURIComponent(rawNext)}` : "";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<AuthErrorInfo | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [redirectChecked, setRedirectChecked] = useState(mode === "reset");
  const [user, setUser] = useState<User | null>(null);
  const [captureSettled, setCaptureSettled] = useState(false);
  const [migrationBlocked, setMigrationBlocked] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [isInApp, setIsInApp] = useState(false);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "manual">(
    "idle"
  );
  const [shareUrl, setShareUrl] = useState("");

  const submittingRef = useRef(false);
  const holdRedirectRef = useRef(false);
  const redirectMarkerRef = useRef<boolean | null>(null);
  const anonSnapshotRef = useRef<AnonymousLikesSnapshot | null>(null);
  const capturePromiseRef = useRef<Promise<AnonymousLikesSnapshot | null> | null>(
    null
  );

  // Never leave the form behind a spinner if Firebase never reports back.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setReady(true);
      setRedirectChecked(true);
      setCaptureSettled(true);
    }, MAX_STARTUP_WAIT_MS);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    setIsInApp(isInAppBrowser(navigator.userAgent));
  }, []);

  // Read the anonymous session's likes once, before any sign-in replaces it.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), (current) => {
      setUser(current);
      setReady(true);

      if (current?.isAnonymous) {
        if (!capturePromiseRef.current) {
          capturePromiseRef.current = getLikedPoemIds(current.uid)
            .then((poemIds) => {
              const snapshot = { uid: current.uid, poemIds };
              anonSnapshotRef.current = snapshot;
              return snapshot;
            })
            .catch((captureError) => {
              console.error("could not read anonymous likes", captureError);
              return null;
            })
            .finally(() => setCaptureSettled(true));
        }
        return;
      }

      setCaptureSettled(true);
    });

    return () => unsubscribe();
  }, []);

  // Finish a Google redirect and migrate the anonymous likes it carried.
  useEffect(() => {
    if (mode === "reset") return;

    let cancelled = false;
    setLoading(true);

    if (redirectMarkerRef.current === null) {
      redirectMarkerRef.current = readRedirectMarker();
    }
    const hadMarker = redirectMarkerRef.current;

    (async () => {
      try {
        const result = await getRedirectResult(getFirebaseAuth());

        if (result?.user) {
          const snapshot = readPendingLikes();
          writePendingLikes(null);

          try {
            await migrateSnapshot(snapshot, result.user.uid);
          } catch (migrationError) {
            console.error("could not migrate likes", migrationError);
            if (!cancelled) {
              holdRedirectRef.current = true;
              setMigrationBlocked(true);
              setNotice(MIGRATION_NOTICE);
              return;
            }
          }

          if (!cancelled) router.replace(next);
        } else if (hadMarker) {
          const current = getFirebaseAuth().currentUser;
          if (!(current && !current.isAnonymous)) {
            setNotice(GOOGLE_INCOMPLETE_NOTICE);
          }
        }
      } catch (redirectError) {
        writePendingLikes(null);
        if (!cancelled) setError(toShownError(redirectError));
      } finally {
        if (!cancelled) {
          setRedirectChecked(true);
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [mode, next, router]);

  // A visitor who is already signed in never needs this form.
  useEffect(() => {
    if (!ready || !redirectChecked || !user || user.isAnonymous) return;
    if (submittingRef.current || holdRedirectRef.current) return;
    router.replace(next);
  }, [ready, redirectChecked, user, next, router]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  const finish = () => {
    writePendingLikes(null);
    clearRedirectMarker();
    router.replace(next);
  };

  const continueAfterMigration = () => {
    holdRedirectRef.current = false;
    finish();
  };

  const handleEmailAuth = async (event: React.FormEvent) => {
    event.preventDefault();

    const trimmedEmail = email.trim();
    const nextErrors: FieldErrors = {};

    if (!trimmedEmail) {
      nextErrors.email = "enter your email address.";
    } else if (!EMAIL_RE.test(trimmedEmail)) {
      nextErrors.email = "that doesn’t look like an email address.";
    }

    if (mode !== "reset") {
      if (!password) {
        nextErrors.password = "enter your password.";
      } else if (mode === "signup" && password.length < MIN_PASSWORD_LENGTH) {
        nextErrors.password = `use at least ${MIN_PASSWORD_LENGTH} characters.`;
      }
    }

    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const auth = getFirebaseAuth();
    setError(null);
    setNotice(null);

    if (mode === "reset") {
      setLoading(true);
      try {
        await sendPasswordResetEmail(auth, trimmedEmail);
      } catch (resetError: unknown) {
        const info = reportAuthError(resetError);
        if (info.code !== "auth/user-not-found") {
          setError(info.message ? info : null);
          setLoading(false);
          return;
        }
      }
      setResetSent(true);
      setCooldown(RESET_COOLDOWN_SECONDS);
      setLoading(false);
      return;
    }

    setLoading(true);
    submittingRef.current = true;

    const snapshot =
      anonSnapshotRef.current ?? (await capturePromiseRef.current) ?? null;

    let newUid = "";

    try {
      const current = auth.currentUser;

      if (mode === "signup" && current?.isAnonymous) {
        // Linking keeps the same uid, so the anonymous likes stay attached.
        const credential = EmailAuthProvider.credential(trimmedEmail, password);
        const result = await linkWithCredential(current, credential);
        newUid = result.user.uid;
        sendEmailVerification(result.user).catch((verificationError) => {
          console.error("could not send verification email", verificationError);
        });
      } else if (mode === "signup") {
        const result = await createUserWithEmailAndPassword(
          auth,
          trimmedEmail,
          password
        );
        newUid = result.user.uid;
        sendEmailVerification(result.user).catch((verificationError) => {
          console.error("could not send verification email", verificationError);
        });
      } else {
        const result = await signInWithEmailAndPassword(
          auth,
          trimmedEmail,
          password
        );
        newUid = result.user.uid;
      }
    } catch (authError: unknown) {
      setError(toShownError(authError));
      setLoading(false);
      submittingRef.current = false;
      return;
    }

    // Carrying likes over is best-effort. A failure must not turn a successful
    // sign-in into a login error, but the visitor gets to keep reading the
    // notice instead of being navigated away from it.
    try {
      await migrateSnapshot(snapshot, newUid);
    } catch (migrationError) {
      console.error("could not migrate likes", migrationError);
      holdRedirectRef.current = true;
      setMigrationBlocked(true);
      setNotice(MIGRATION_NOTICE);
      setLoading(false);
      submittingRef.current = false;
      return;
    }

    submittingRef.current = false;
    finish();
  };

  const handleGoogleError = async (
    googleError: unknown,
    provider: GoogleAuthProvider
  ) => {
    const code = authErrorCode(googleError);

    if (
      code === "auth/popup-closed-by-user" ||
      code === "auth/cancelled-popup-request"
    ) {
      setLoading(false);
      submittingRef.current = false;
      return;
    }

    if (code && GOOGLE_REDIRECT_FALLBACK_CODES.has(code)) {
      writeRedirectMarker();
      if (anonSnapshotRef.current) {
        writePendingLikes(anonSnapshotRef.current);
      }

      try {
        await signInWithRedirect(getFirebaseAuth(), provider);
        // On success the browser navigates away.
      } catch (redirectError) {
        writePendingLikes(null);
        clearRedirectMarker();
        setError(toShownError(redirectError));
        setLoading(false);
        submittingRef.current = false;
      }
      return;
    }

    setError(toShownError(googleError));
    setLoading(false);
    submittingRef.current = false;
  };

  const handleGoogleSignIn = () => {
    if (loading || !captureSettled) return;

    setLoading(true);
    setError(null);
    setNotice(null);
    setMigrationBlocked(false);
    submittingRef.current = true;

    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });

    // Must stay synchronous: Safari refuses a popup opened after an await.
    signInWithPopup(getFirebaseAuth(), provider)
      .then(async (result) => {
        try {
          await migrateSnapshot(anonSnapshotRef.current, result.user.uid);
        } catch (migrationError) {
          console.error("could not migrate likes", migrationError);
          holdRedirectRef.current = true;
          setMigrationBlocked(true);
          setNotice(MIGRATION_NOTICE);
          setLoading(false);
          submittingRef.current = false;
          return;
        }

        submittingRef.current = false;
        finish();
      })
      .catch((googleError: unknown) => handleGoogleError(googleError, provider));
  };

  const handleCopyLink = async () => {
    const url = window.location.href;
    setShareUrl(url);

    try {
      if (!navigator.clipboard?.writeText) throw new Error("no clipboard");
      await navigator.clipboard.writeText(url);
      setCopyState("copied");
    } catch {
      setCopyState("manual");
    }
  };

  const showForm = ready && redirectChecked;

  if (!showForm) {
    return <p className="meta auth-status">checking…</p>;
  }

  const submitLabel =
    mode === "reset"
      ? cooldown > 0
        ? `send again in ${cooldown}s`
        : resetSent
          ? "send another letter"
          : "send the reset letter"
      : mode === "login"
        ? "log in"
        : "sign up";

  return (
    <>
      <form className="auth-form" onSubmit={handleEmailAuth} noValidate>
        <FormField
          id={`${mode}-email`}
          label="email"
          type="email"
          value={email}
          autoComplete="email"
          placeholder="you@example.com"
          required
          disabled={loading}
          error={fieldErrors.email}
          onChange={(event) => {
            setEmail(event.target.value);
            if (fieldErrors.email) {
              setFieldErrors((previous) => ({ ...previous, email: undefined }));
            }
          }}
        />

        {mode !== "reset" ? (
          <div className="form-field">
            <label htmlFor={`${mode}-password`} className="form-label meta">
              password
            </label>
            <div className="field-row">
              <input
                id={`${mode}-password`}
                type={showPassword ? "text" : "password"}
                value={password}
                autoComplete={
                  mode === "signup" ? "new-password" : "current-password"
                }
                placeholder={
                  mode === "signup"
                    ? `at least ${MIN_PASSWORD_LENGTH} characters`
                    : "your password"
                }
                required
                disabled={loading}
                aria-invalid={fieldErrors.password ? true : undefined}
                aria-describedby={
                  fieldErrors.password ? `${mode}-password-error` : undefined
                }
                className="field-input"
                onChange={(event) => {
                  setPassword(event.target.value);
                  if (fieldErrors.password) {
                    setFieldErrors((previous) => ({
                      ...previous,
                      password: undefined,
                    }));
                  }
                }}
              />
              <TextButton
                type="button"
                variant="plain"
                className="field-toggle meta"
                disabled={loading}
                onClick={() => setShowPassword((shown) => !shown)}
              >
                {showPassword ? "hide" : "show"}
              </TextButton>
            </div>
            {fieldErrors.password ? (
              <p
                id={`${mode}-password-error`}
                className="error-text"
                role="alert"
              >
                {fieldErrors.password}
              </p>
            ) : null}
          </div>
        ) : null}

        <div aria-live="polite" aria-atomic="true">
          {error?.message ? (
            <p className="error-text">
              {error.message}
              {shouldShowCode(error) ? (
                <span className="meta error-code"> ({error.code})</span>
              ) : null}
            </p>
          ) : null}

          {notice ? (
            <p className="auth-notice" role="status">
              {notice}
              {migrationBlocked ? (
                <>
                  {" "}
                  <TextButton
                    type="button"
                    variant="underline"
                    className="auth-notice-action"
                    onClick={continueAfterMigration}
                  >
                    continue
                  </TextButton>
                </>
              ) : null}
            </p>
          ) : null}

          {mode === "reset" && resetSent ? (
            <p className="auth-notice" role="status">
              {RESET_CONFIRMATION}
            </p>
          ) : null}
        </div>

        <TextButton
          type="submit"
          variant="filled"
          className="auth-submit"
          disabled={loading || (mode === "reset" && cooldown > 0)}
        >
          {loading && mode !== "reset" ? "one moment…" : submitLabel}
        </TextButton>
      </form>

      {mode !== "reset" ? (
        <>
          <div className="auth-separator" aria-hidden="true">
            <span className="meta">or</span>
          </div>

          <TextButton
            type="button"
            variant="underline"
            className="auth-google"
            disabled={loading || !captureSettled || isInApp}
            onClick={handleGoogleSignIn}
          >
            continue with google
          </TextButton>

          {isInApp ? (
            <div className="auth-note">
              <p>
                google sign-in doesn’t work inside this app’s browser. open this
                page in safari or chrome, or use your email and password above.
              </p>
              <div className="auth-note-actions">
                <TextButton
                  type="button"
                  variant="plain"
                  className="meta"
                  onClick={handleCopyLink}
                >
                  {copyState === "copied" ? "link copied" : "copy link"}
                </TextButton>
                {copyState === "manual" ? (
                  <input
                    readOnly
                    value={shareUrl}
                    onFocus={(event) => event.currentTarget.select()}
                    aria-label="link to open in safari or chrome"
                    className="field-input auth-share"
                  />
                ) : null}
              </div>
            </div>
          ) : null}
        </>
      ) : null}

      <div className="auth-footer">
        {mode === "login" ? (
          <>
            <Link href={`/forget-password${samePageQuery}`}>
              forget your password?
            </Link>
            <Link href={`/signup${samePageQuery}`}>need an account?</Link>
          </>
        ) : mode === "signup" ? (
          <Link href={`/login${samePageQuery}`}>already have an account?</Link>
        ) : (
          <Link href={`/login${samePageQuery}`}>back to log in</Link>
        )}
      </div>
    </>
  );
}
