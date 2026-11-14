import { afterEach, describe, expect, it, vi } from "vitest";
import {
  AUTH_FALLBACK_MESSAGE,
  getAuthError,
  reportAuthError,
} from "./authErrors";

// Every code the login page can surface. Cancellations are listed separately
// because they must stay silent instead of showing an error.
const EXPLAINED_CODES = [
  "auth/invalid-credential",
  "auth/invalid-login-credentials",
  "auth/wrong-password",
  "auth/user-not-found",
  "auth/user-disabled",
  "auth/missing-password",
  "auth/invalid-email",
  "auth/too-many-requests",
  "auth/email-already-in-use",
  "auth/weak-password",
  "auth/popup-blocked",
  "auth/account-exists-with-different-credential",
  "auth/credential-already-in-use",
  "auth/operation-not-allowed",
  "auth/unauthorized-domain",
  "auth/operation-not-supported-in-this-environment",
  "auth/web-storage-unsupported",
  "auth/requires-recent-login",
  "auth/internal-error",
  "auth/network-request-failed",
];

const SILENT_CODES = [
  "auth/popup-closed-by-user",
  "auth/cancelled-popup-request",
];

describe("getAuthError", () => {
  it.each(EXPLAINED_CODES)("explains %s instead of falling back", (code) => {
    const result = getAuthError(code);

    expect(result.code).toBe(code);
    expect(result.message).toBeTruthy();
    expect(result.message).not.toBe(AUTH_FALLBACK_MESSAGE);
  });

  it.each(SILENT_CODES)("stays silent for %s", (code) => {
    expect(getAuthError(code)).toEqual({ code, message: null });
  });

  it("returns a safe fallback for an unknown code", () => {
    expect(getAuthError("auth/some-new-code")).toEqual({
      code: "auth/some-new-code",
      message: AUTH_FALLBACK_MESSAGE,
    });
  });

  it("returns the fallback when no code is present", () => {
    expect(getAuthError(undefined).code).toBe("unknown");
    expect(getAuthError(null).message).toBe(AUTH_FALLBACK_MESSAGE);
  });
});

describe("reportAuthError", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("logs the raw code and error, then returns the mapped message", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const error = Object.assign(new Error("bad password"), {
      code: "auth/invalid-credential",
    });

    const result = reportAuthError(error);

    expect(spy).toHaveBeenCalledWith("auth/invalid-credential", error);
    expect(result.code).toBe("auth/invalid-credential");
    expect(result.message).toContain("Continue with Google");
  });

  it("handles errors without a code", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});

    expect(reportAuthError(new Error("plain"))).toEqual({
      code: "unknown",
      message: AUTH_FALLBACK_MESSAGE,
    });
  });
});
