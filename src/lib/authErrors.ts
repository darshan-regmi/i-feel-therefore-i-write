// Maps Firebase Auth error codes to a message that tells the reader what went
// wrong and what to do next. Keep this the only place auth surfaces translate
// error codes so a new code cannot silently fall back to "something went wrong"
// on one page while another page explains it properly.

export type AuthErrorInfo = {
  /** Raw Firebase code, or "unknown" when the error carried none. */
  code: string;
  /** User-facing message, or null when the action was a deliberate cancel. */
  message: string | null;
};

export const AUTH_FALLBACK_MESSAGE =
  "Sign-in couldn't be completed. Check your connection, or open the site in Safari or Chrome if this keeps happening.";

const MESSAGES: Record<string, string | null> = {
  // Sign-in
  "auth/invalid-credential":
    "That email and password don't match. If you signed up with Google, use Continue with Google.",
  "auth/invalid-login-credentials":
    "That email and password don't match. Check both, or reset your password if you've forgotten it.",
  "auth/wrong-password":
    "That password is incorrect. Reset it with “Forgot your password?”, or use Continue with Google if that's how you signed up.",
  "auth/user-not-found":
    "No account uses that email. Check the address, or create an account.",
  "auth/user-disabled":
    "This account has been disabled. Contact the site owner if you think that's a mistake.",
  "auth/missing-password": "Enter your password to continue.",
  "auth/invalid-email":
    "That doesn't look like an email address. Check for a missing @ or a typo in the domain.",
  "auth/too-many-requests":
    "Too many attempts in a short time. Wait a few minutes, then try again.",

  // Sign-up
  "auth/email-already-in-use":
    "An account already exists for this email. Sign in instead, or reset the password if you've forgotten it.",
  "auth/weak-password":
    "Use at least 8 characters. A longer phrase is easier to remember and harder to guess.",

  // Google / provider setup
  "auth/popup-blocked":
    "Your browser blocked the sign-in window. Allow popups for this site, then choose Continue with Google again.",
  "auth/popup-closed-by-user": null,
  "auth/cancelled-popup-request": null,
  "auth/account-exists-with-different-credential":
    "This email is already registered with a different sign-in method. Sign in with email and password instead.",
  "auth/credential-already-in-use":
    "That sign-in method is already linked to another account. Sign in with the method you used before.",
  "auth/operation-not-allowed":
    "This sign-in method is turned off for this project. The site owner needs to enable it in Firebase Authentication → Sign-in method.",
  "auth/unauthorized-domain":
    "This domain isn't authorized for sign-in. The site owner needs to add it in Firebase Authentication → Settings → Authorized domains.",
  "auth/operation-not-supported-in-this-environment":
    "This browser can't complete Google sign-in. Open the site in Safari or Chrome to sign in.",
  "auth/web-storage-unsupported":
    "Your browser is blocking the storage Firebase needs to sign you in. Allow cookies and site data for this site, or open it in Safari or Chrome.",

  // Session / network
  "auth/requires-recent-login":
    "For security, sign in again before making this change.",
  "auth/internal-error":
    "Firebase hit an internal error. Wait a moment, then try again.",
  "auth/network-request-failed":
    "We couldn't reach Firebase. Check your connection, then try again.",
};

/**
 * Translate a Firebase Auth error code into a code and an actionable message.
 * Known cancellations return `message: null` so callers can stay silent.
 */
export function getAuthError(code?: string | null): AuthErrorInfo {
  if (!code) {
    return { code: "unknown", message: AUTH_FALLBACK_MESSAGE };
  }

  if (Object.prototype.hasOwnProperty.call(MESSAGES, code)) {
    return { code, message: MESSAGES[code] };
  }

  return { code, message: AUTH_FALLBACK_MESSAGE };
}

/**
 * Pull the Firebase code off an unknown error, log the full error, and return
 * the mapped message. Every auth surface should call this in its catch block.
 */
export function reportAuthError(error: unknown): AuthErrorInfo {
  const code =
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as { code?: unknown }).code === "string"
      ? (error as { code: string }).code
      : "unknown";

  console.error(code, error);
  return getAuthError(code);
}

/** The raw code is useful while developing and noise for everyone else. */
export const SHOW_AUTH_ERROR_CODE = process.env.NODE_ENV !== "production";
