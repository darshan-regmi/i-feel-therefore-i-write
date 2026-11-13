"use client";

import { useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  onAuthStateChanged,
} from "firebase/auth";
import { EmailAuthProvider, linkWithCredential } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, X } from "lucide-react";
import { migrateLikes } from "@/utils/firebaseUtils";
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

// The Google flow leaves the page entirely, so the uid whose likes still need
// migrating is parked in sessionStorage until the redirect comes back.
const PENDING_ANON_UID_KEY = "pendingAnonUid";

function readPendingAnonUid(): string | null {
  try {
    return sessionStorage.getItem(PENDING_ANON_UID_KEY);
  } catch {
    // Storage can be unavailable in private/locked-down browsing modes.
    return null;
  }
}

function writePendingAnonUid(uid: string | null) {
  try {
    if (uid) {
      sessionStorage.setItem(PENDING_ANON_UID_KEY, uid);
    } else {
      sessionStorage.removeItem(PENDING_ANON_UID_KEY);
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

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
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
  const router = useRouter();

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
          const anonUid = readPendingAnonUid();
          writePendingAnonUid(null);

          if (anonUid && anonUid !== result.user.uid) {
            try {
              await migrateLikes(anonUid, result.user.uid);
              console.log("✅ Likes migrated from anonymous session");
            } catch (migrationError) {
              console.error("❌ Likes migration error:", migrationError);
              if (!cancelled) setMigrationNotice(MIGRATION_NOTICE);
              return;
            }
          }

          if (!cancelled) {
            console.log("✅ Signed in with Google");
            router.push("/liked-poem");
          }
        }
      } catch (error: unknown) {
        writePendingAnonUid(null);
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
    } else if (!isLogin && password.length < MIN_PASSWORD_LENGTH) {
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

    let anonUid: string | null = null;
    let newUid: string | null = null;

    try {
      const currentUser = auth.currentUser;
      anonUid = currentUser?.isAnonymous ? currentUser.uid : null;

      if (!isLogin) {
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
    if (anonUid && newUid && anonUid !== newUid) {
      try {
        await migrateLikes(anonUid, newUid);
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

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);

    try {
      const provider = new GoogleAuthProvider();

      // Force account selection and prevent auto-select
      provider.setCustomParameters({
        prompt: "select_account",
      });

      const currentUser = auth.currentUser;

      // Liking a poem signs the visitor in anonymously, so by the time they
      // reach /login there is usually an anonymous currentUser. Park its uid
      // so the redirect handler can carry those likes onto the Google account
      // once we come back. This replaces the old linkWithPopup() approach,
      // which only worked when the Google account did not already exist.
      writePendingAnonUid(currentUser?.isAnonymous ? currentUser.uid : null);

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
      writePendingAnonUid(null);
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
              {isLogin ? "welcome back home" : "let's make you a home here"}
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
          <form onSubmit={handleEmailAuth} className="space-y-5">
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

            <button
              type="submit"
              className="w-full py-3.5 bg-gray-900 text-white font-medium rounded-xl shadow-md hover:shadow-lg hover:bg-gray-800 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Opening doors...</span>
                </>
              ) : isLogin ? (
                "Enter Your Home"
              ) : (
                "Create Your Home"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <span className="relative bg-white px-4 text-sm italic text-gray-400">
              or
            </span>
          </div>

          {/* Google Sign In */}
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

          {/* Toggle login/signup */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
                setFieldErrors({});
              }}
              className="text-gray-500 hover:text-gray-900 italic text-sm transition-colors duration-200 disabled:opacity-60"
              disabled={loading}
            >
              {isLogin ? "need an account?" : "already have an account?"}
            </button>
          </div>

          {/* Footer quote */}
          <div className="text-center text-xs italic text-gray-400 border-t border-gray-100 pt-6 mt-6">
            {isLogin
              ? '"words have no single fixed meaning"'
              : '"every poet was first a reader"'}
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