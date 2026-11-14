"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  onAuthStateChanged,
} from "firebase/auth";
import { EmailAuthProvider, linkWithCredential, sendPasswordResetEmail } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2, X } from "lucide-react";
import {
  migrateLikes,
  type AnonymousLikesSnapshot,
} from "@/utils/firebaseUtils";
import { getUserLikedPoems } from "@/lib/likes";
import {
  reportAuthError,
  SHOW_AUTH_ERROR_CODE,
  type AuthErrorInfo,
} from "@/lib/authErrors";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

const MIGRATION_NOTICE =
  "Signed in, but we couldn't carry over your earlier likes.";

type FieldErrors = {
  email?: string;
  password?: string;
};

type Mode = "login" | "signup" | "reset";

const RESET_CONFIRMATION =
  "If that address has a home here, the letter is on its way.";
const RESET_COOLDOWN_SECONDS = 60;

// The Google flow leaves the page entirely, so the anonymous snapshot is
// parked in sessionStorage until the redirect comes back.
const PENDING_LIKES_KEY = "pendingAnonLikes";

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
    // Storage can be unavailable in private/locked-down browsing modes.
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
    // Ignore — the sign-in still works, only the likes migration is skipped.
  }
}

// Cancellations map to no message, so they clear the error region instead of
// showing anything.
function toShownAuthError(error: unknown): AuthErrorInfo | null {
  const info = reportAuthError(error);
  return info.message ? info : null;
}

// useSearchParams needs a Suspense boundary so the page can still be
// prerendered at build time.
export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-slate-50">
          <div className="text-center space-y-4">
            <Loader2 className="w-8 h-8 text-gray-400 animate-spin mx-auto" />
            <p className="text-sm text-gray-500 italic">
              checking authentication...
            </p>
          </div>
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}

function LoginPageContent() {
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<Mode>(() =>
    searchParams.get("mode") === "reset" ? "reset" : "login"
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AuthErrorInfo | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [migrationNotice, setMigrationNotice] = useState<string | null>(null);
  const [authFlowInProgress, setAuthFlowInProgress] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [redirectResolved, setRedirectResolved] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const router = useRouter();
  const isLogin = mode === "login";
  const isReset = mode === "reset";

  // Started on the first auth callback (page mount), long before any sign-in
  // call, because the old rows stop being readable once the uid changes.
  const migrationSourceRef = useRef<AnonymousLikesSnapshot | null>(null);
  const migrationSourcePromiseRef = useRef<
    Promise<AnonymousLikesSnapshot | null> | null
  >(null);
  const captureStartedRef = useRef(false);

  // Finish a Google sign-in that came back from a redirect.
  //
  // signInWithRedirect replaces the page, so the anonymous uid is recovered
  // from sessionStorage here rather than from a variable. This must complete
  // before the observer below is allowed to navigate, otherwise the likes
  // migration could be interrupted mid-flight.
  useEffect(() => {
    let cancelled = false;
    setAuthFlowInProgress(true);

    (async () => {
      try {
        const result = await getRedirectResult(auth);

        if (result?.user) {
          const snapshot = readPendingLikes();

          if (snapshot && snapshot.uid !== result.user.uid) {
            try {
              await migrateLikes(snapshot, result.user.uid, db);
              writePendingLikes(null);
              console.log("✅ Likes migrated from anonymous session");
            } catch (migrationError) {
              console.error("❌ Likes migration error:", migrationError);
              if (!cancelled) setMigrationNotice(MIGRATION_NOTICE);
              return;
            }
          } else {
            writePendingLikes(null);
          }

          if (!cancelled) {
            console.log("✅ Signed in with Google");
            router.push("/liked-poem");
          }
        }
      } catch (error: unknown) {
        writePendingLikes(null);
        if (!cancelled) {
          setError(toShownAuthError(error));
        }
      } finally {
        if (!cancelled) {
          setRedirectResolved(true);
          setAuthFlowInProgress(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  // Check if user is already logged in (not anonymous)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // Capture the anonymous session on the first callback, before any
      // sign-in can replace it. The promise lets the email handler wait for
      // the read instead of racing it.
      if (!captureStartedRef.current) {
        captureStartedRef.current = true;
        migrationSourcePromiseRef.current = (async () => {
          if (!user?.isAnonymous) return null;

          try {
            const poemIds = await getUserLikedPoems(user.uid);
            const snapshot = { uid: user.uid, poemIds };
            migrationSourceRef.current = snapshot;
            writePendingLikes(snapshot);
            return snapshot;
          } catch (error) {
            console.error("❌ Could not capture anonymous likes:", error);
            return null;
          }
        })();
      }

      setAuthInitialized(true);

      // If user is authenticated (not anonymous), redirect to liked poems.
      // Hold off while a sign-in is still running or a migration notice needs
      // to be read, so anonymous likes are carried over before we leave.
      if (
        redirectResolved &&
        user &&
        !user.isAnonymous &&
        !authFlowInProgress &&
        !migrationNotice
      ) {
        router.push("/liked-poem");
      }
    });

    return () => unsubscribe();
  }, [router, redirectResolved, authFlowInProgress, migrationNotice]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    const nextFieldErrors: FieldErrors = {};
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      nextFieldErrors.email = "Enter your email address.";
    } else if (!EMAIL_RE.test(trimmedEmail)) {
      nextFieldErrors.email =
        "That doesn't look like an email address. Check for a typo.";
    }

    if (!password) {
      nextFieldErrors.password = "Enter your password.";
    } else if (mode === "signup" && password.length < MIN_PASSWORD_LENGTH) {
      nextFieldErrors.password = `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
    }

    setFieldErrors(nextFieldErrors);
    if (Object.keys(nextFieldErrors).length > 0) {
      return;
    }

    setLoading(true);
    setError(null);
    setMigrationNotice(null);
    setAuthFlowInProgress(true);

    // Wait for the mount-time capture to finish so the old likes are read
    // while the anonymous session still owns them.
    const likesSnapshot =
      (await migrationSourcePromiseRef.current) ?? migrationSourceRef.current;

    let newUid: string | null = null;

    try {
      const currentUser = auth.currentUser;

      if (mode === "signup") {
        // Sign Up
        if (currentUser && currentUser.isAnonymous) {
          // Link anonymous account with email/password
          const credential = EmailAuthProvider.credential(trimmedEmail, password);
          const result = await linkWithCredential(currentUser, credential);

          newUid = result.user.uid;
          console.log("✅ Anonymous account linked with email");
        } else {
          // Create new account
          const result = await createUserWithEmailAndPassword(
            auth,
            trimmedEmail,
            password
          );
          newUid = result.user.uid;
          console.log("✅ New account created");
        }
      } else {
        // Sign In
        const result = await signInWithEmailAndPassword(auth, trimmedEmail, password);
        newUid = result.user.uid;
        console.log("✅ Signed in successfully");
      }
    } catch (error: unknown) {
      setError(toShownAuthError(error));
      setAuthFlowInProgress(false);
      setLoading(false);
      return;
    }

    setLoading(false);

    // Authentication is finished. Carrying likes over is best-effort and must
    // never turn a successful sign-in into a login error.
    if (likesSnapshot && newUid && likesSnapshot.uid !== newUid) {
      try {
        await migrateLikes(likesSnapshot, newUid, db);
        writePendingLikes(null);
        console.log("✅ Likes migrated from anonymous session");
      } catch (migrationError) {
        console.error("❌ Likes migration error:", migrationError);
        setMigrationNotice(MIGRATION_NOTICE);
        setAuthFlowInProgress(false);
        return;
      }
    }

    setAuthFlowInProgress(false);
    router.push("/liked-poem");
  };

  // Reset emails deliberately give the same answer whether or not the account
  // exists, so this page cannot be used to enumerate addresses.
  const handleResetAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedEmail = email.trim();
    const nextFieldErrors: FieldErrors = {};

    if (!trimmedEmail) {
      nextFieldErrors.email = "Enter your email address.";
    } else if (!EMAIL_RE.test(trimmedEmail)) {
      nextFieldErrors.email =
        "That doesn't look like an email address. Check for a typo.";
    }

    setFieldErrors(nextFieldErrors);
    if (Object.keys(nextFieldErrors).length > 0) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await sendPasswordResetEmail(auth, trimmedEmail);
    } catch (error: unknown) {
      const info = reportAuthError(error);
      if (info.code !== "auth/user-not-found") {
        setError(info.message ? info : null);
        setLoading(false);
        return;
      }
    }

    setResetSent(true);
    setCooldown(RESET_COOLDOWN_SECONDS);
    setLoading(false);
  };

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((seconds) => seconds - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const switchMode = (next: Mode) => {
    setMode(next);
    setError(null);
    setFieldErrors({});
    setResetSent(false);
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);

    try {
      const provider = new GoogleAuthProvider();

      // Force account selection and prevent auto-select
      provider.setCustomParameters({
        prompt: "select_account",
      });

      // The anonymous snapshot was read on mount, before this click. Persist
      // that already-captured copy so the redirect return can migrate it; this
      // handler must never read Firestore itself.
      if (migrationSourceRef.current) {
        writePendingLikes(migrationSourceRef.current);
      }

      // Use a full-page redirect rather than signInWithPopup().
      //
      // Popups are blocked or silently dropped in iOS Safari and in the
      // in-app browsers used by Instagram/Threads/etc., which is exactly where
      // a shared poem link tends to open. The redirect flow works in all of
      // them; getRedirectResult() above finishes the sign-in and the likes
      // migration when the page comes back.
      console.log("🔐 Redirecting to Google...");
      await signInWithRedirect(auth, provider);
      // On success the browser navigates away; nothing below runs.
    } catch (error: unknown) {
      writePendingLikes(null);
      setError(toShownAuthError(error));
      setLoading(false);
    }
  };

  // Show loading state while checking auth
  if (!authInitialized || !redirectResolved) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-slate-50">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 text-gray-400 animate-spin mx-auto" />
          <p className="text-sm text-gray-500 italic">checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-6 bg-gradient-to-br from-gray-50 via-white to-slate-50 relative overflow-hidden">
      {/* Subtle background decorations */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gray-100/20 via-transparent to-transparent pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-slate-100/20 via-transparent to-transparent pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Decorative elements above card */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-gray-300"></div>
          <div className="w-1 h-1 rounded-full bg-gray-400"></div>
          <div className="h-px w-12 bg-gradient-to-l from-transparent to-gray-300"></div>
        </div>

        <div className="bg-white border border-gray-200 shadow-xl rounded-3xl p-8 sm:p-10 space-y-6 animate-fade-in">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-serif text-gray-900 tracking-tight">
              i feel, therefore i write
            </h1>
            <p className="text-sm font-light italic text-gray-500">
              {mode === "login"
                ? "welcome back home"
                : mode === "signup"
                  ? "let's make you a home here"
                  : "a new key for your home"}
            </p>
          </div>

          {/* Error message. The wrapper stays mounted so screen readers
              announce updates from the live region. */}
          <div aria-live="polite" aria-atomic="true">
            {error?.message && (
              <div className="bg-red-50 text-red-600 border border-red-200 rounded-xl p-4 text-center text-sm italic animate-shake">
                <p>{error.message}</p>
                {SHOW_AUTH_ERROR_CODE && (
                  <p className="mt-1 font-mono text-xs not-italic text-red-400">
                    {error.code}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* A successful sign-in whose likes migration failed. Navigation is
              held until this is dismissed so the note is actually seen. */}
          {migrationNotice && (
            <div
              role="status"
              className="flex items-start gap-3 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl p-4 text-sm"
            >
              <p className="flex-1 italic">{migrationNotice}</p>
              <button
                type="button"
                onClick={() => {
                  setMigrationNotice(null);
                  router.push("/liked-poem");
                }}
                aria-label="Dismiss and continue"
                className="text-amber-500 hover:text-amber-800 transition-colors duration-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={isReset ? handleResetAuth : handleEmailAuth}
            noValidate
            className="space-y-5"
          >
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) {
                    setFieldErrors((prev) => ({ ...prev, email: undefined }));
                  }
                }}
                placeholder="your@email.com"
                required
                disabled={loading}
                aria-invalid={!!fieldErrors.email}
                aria-describedby={fieldErrors.email ? "email-error" : undefined}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent focus:bg-white transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              />
              {fieldErrors.email && (
                <p id="email-error" className="mt-1.5 text-xs text-red-600">
                  {fieldErrors.email}
                </p>
              )}
            </div>

            {!isReset && (
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) {
                      setFieldErrors((prev) => ({
                        ...prev,
                        password: undefined,
                      }));
                    }
                  }}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  aria-invalid={!!fieldErrors.password}
                  aria-describedby={
                    fieldErrors.password ? "password-error" : undefined
                  }
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent focus:bg-white transition-all duration-200 pr-12 disabled:opacity-60 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  tabIndex={-1}
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {fieldErrors.password && (
                <p id="password-error" className="mt-1.5 text-xs text-red-600">
                  {fieldErrors.password}
                </p>
              )}
            </div>
            )}

            {isLogin && (
              <div className="text-right -mt-3">
                <button
                  type="button"
                  onClick={() => switchMode("reset")}
                  className="text-sm italic text-gray-500 hover:text-gray-900 transition-colors duration-200 disabled:opacity-60"
                  disabled={loading}
                >
                  forgot your password?
                </button>
              </div>
            )}

            {isReset && resetSent && (
              <div
                role="status"
                className="bg-gray-50 text-gray-600 border border-gray-200 rounded-xl p-4 text-center text-sm italic"
              >
                {RESET_CONFIRMATION}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 bg-gray-900 text-white font-medium rounded-xl shadow-md hover:shadow-lg hover:bg-gray-800 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
              disabled={loading || (isReset && cooldown > 0)}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isReset ? "Sending..." : "Opening doors..."}</span>
                </>
              ) : isReset ? (
                cooldown > 0
                  ? `send again in ${cooldown}s`
                  : resetSent
                    ? "Send another letter"
                    : "Send the reset letter"
              ) : isLogin ? (
                "Enter Your Home"
              ) : (
                "Create Your Home"
              )}
            </button>
          </form>

          {/* Divider */}
          {!isReset && (
          <div className="relative text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <span className="relative bg-white px-4 text-sm italic text-gray-400">
              or
            </span>
          </div>
          )}

          {/* Google Sign In */}
          {!isReset && (
          <button
            onClick={handleGoogleSignIn}
            className="w-full py-3.5 bg-white text-gray-700 border border-gray-300 rounded-xl shadow-sm hover:shadow-md hover:bg-gray-50 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-3 font-medium disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            <span>Continue with Google</span>
          </button>
          )}

          {/* Toggle login/signup, or the way back from reset */}
          <div className="text-center pt-2">
            {isReset ? (
              <button
                type="button"
                onClick={() => switchMode("login")}
                className="text-gray-500 hover:text-gray-900 italic text-sm transition-colors duration-200 disabled:opacity-60"
                disabled={loading}
              >
                back to sign in
              </button>
            ) : (
              <button
                type="button"
                onClick={() => switchMode(isLogin ? "signup" : "login")}
                className="text-gray-500 hover:text-gray-900 italic text-sm transition-colors duration-200 disabled:opacity-60"
                disabled={loading}
              >
                {isLogin ? "need an account?" : "already have an account?"}
              </button>
            )}
          </div>

          {/* Footer quote */}
          <div className="text-center text-xs italic text-gray-400 border-t border-gray-100 pt-6 mt-6">
            {mode === "login"
              ? '"words have no single fixed meaning"'
              : mode === "signup"
                ? '"every poet was first a reader"'
                : '"a key, remembered in a quieter place"'}
          </div>
        </div>

        {/* Decorative elements below card */}
        <div className="flex items-center justify-center gap-3 mt-8">
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-gray-300"></div>
          <div className="w-1 h-1 rounded-full bg-gray-400"></div>
          <div className="h-px w-12 bg-gradient-to-l from-transparent to-gray-300"></div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        .animate-shake {
          animation: shake 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}