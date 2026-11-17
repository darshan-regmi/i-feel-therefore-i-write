// Every auth surface translates Firebase error codes here so the copy stays
// specific, lowercase, and identical across login, signup, reset and profile.

export type AuthErrorInfo = {
  /** Raw Firebase code, or "unknown" when the error carried none. */
  code: string;
  /** User-facing message, or null when the action was a deliberate cancel. */
  message: string | null;
};

export const AUTH_FALLBACK_MESSAGE = "couldn’t sign in. try again.";

const MISMATCH_MESSAGE =
  "that email and password don’t match. try again, or reset your password.";

const MESSAGES: Record<string, string | null> = {
  // Sign-in
  "auth/invalid-credential": MISMATCH_MESSAGE,
  "auth/invalid-login-credentials": MISMATCH_MESSAGE,
  "auth/wrong-password": MISMATCH_MESSAGE,
  "auth/user-not-found": MISMATCH_MESSAGE,
  "auth/user-disabled": "this account has been disabled.",
  "auth/missing-password": "enter your password to continue.",
  "auth/invalid-email": "that doesn’t look like an email address.",
  "auth/too-many-requests":
    "too many attempts. wait a few minutes, or reset your password.",
  "auth/network-request-failed":
    "couldn’t reach the server. check your connection and try again.",

  // Sign-up
  "auth/email-already-in-use":
    "that email already has an account. sign in instead.",
  "auth/weak-password": "use at least 6 characters.",

  // Google / provider setup
  "auth/popup-blocked":
    "your browser blocked the google window. allow popups and try again.",
  "auth/popup-closed-by-user": null,
  "auth/cancelled-popup-request": null,
  "auth/account-exists-with-different-credential":
    "that email is registered with a different sign-in method. use that one instead.",
  "auth/credential-already-in-use":
    "that sign-in method is already linked to another account. sign in with the method you used before.",
  "auth/operation-not-allowed":
    "this sign-in method is turned off. the site owner needs to enable it.",
  "auth/unauthorized-domain":
    "this domain isn’t authorized for sign-in. the site owner needs to add it.",
  "auth/operation-not-supported-in-this-environment":
    "this browser can’t complete google sign-in. open the site in safari or chrome.",
  "auth/web-storage-unsupported":
    "your browser is blocking the storage needed to sign in. allow cookies and site data.",

  // Session / account
  "auth/requires-recent-login":
    "for security, sign in again before making this change.",
  "auth/internal-error": "something went wrong on the server. wait a moment and try again.",
};

export function getAuthError(code?: string | null): AuthErrorInfo {
  if (!code) {
    return { code: "unknown", message: AUTH_FALLBACK_MESSAGE };
  }

  if (Object.prototype.hasOwnProperty.call(MESSAGES, code)) {
    return { code, message: MESSAGES[code] };
  }

  return { code, message: AUTH_FALLBACK_MESSAGE };
}

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

/** Only the fallback needs the raw code spelled out beneath it. */
export function shouldShowCode(info: AuthErrorInfo): boolean {
  return info.message === AUTH_FALLBACK_MESSAGE;
}
