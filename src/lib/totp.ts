// src/lib/totp.ts
//
// RFC 6238 TOTP verification built on Web Crypto so it runs unchanged on the
// edge runtime (no Node built-ins). Used by POST /api/sync for the /qwzx
// confessional; the daily cron keeps using the static SYNC_SECRET.
//
// Codes are 6 digits / 30 seconds / SHA-1 — what password managers and
// authenticator apps generate by default.

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

/** Decode an RFC 4648 base32 secret (spaces, padding and lowercase tolerated). */
export function base32Decode(input: string): Uint8Array<ArrayBuffer> {
  const clean = input.toUpperCase().replace(/[^A-Z2-7]/g, "");
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];

  for (const ch of clean) {
    const index = BASE32_ALPHABET.indexOf(ch);
    if (index === -1) continue;

    value = ((value << 5) | index) & 0xffff;
    bits += 5;

    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
      value &= (1 << bits) - 1;
    }
  }

  return new Uint8Array(bytes);
}

const HOTP_DIGITS = 6;

async function hotp(keyBytes: Uint8Array<ArrayBuffer>, counter: number): Promise<string> {
  const message = new Uint8Array(8);
  const view = new DataView(message.buffer);
  // TOTP counters won't exceed 2^32 for a very long time, but write both
  // words so the encoding stays correct regardless.
  view.setUint32(0, Math.floor(counter / 2 ** 32), false);
  view.setUint32(4, counter >>> 0, false);

  const key = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"]
  );
  const signature = new Uint8Array(
    await crypto.subtle.sign("HMAC", key, message)
  );

  // RFC 4226 §5.3 dynamic truncation.
  const offset = signature[signature.length - 1] & 0x0f;
  const binary =
    ((signature[offset] & 0x7f) << 24) |
    (signature[offset + 1] << 16) |
    (signature[offset + 2] << 8) |
    signature[offset + 3];

  return (binary % 10 ** HOTP_DIGITS).toString().padStart(HOTP_DIGITS, "0");
}

/** Constant-time string comparison so a wrong code leaks no timing information. */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export interface VerifyTotpOptions {
  digits?: number;
  period?: number;
  /** Accept the current step plus this many steps on either side (clock skew). */
  window?: number;
}

export async function verifyTotp(
  secret: string,
  token: string,
  { digits = 6, period = 30, window = 1 }: VerifyTotpOptions = {}
): Promise<boolean> {
  const code = token.trim();
  if (!/^\d+$/.test(code) || code.length !== digits) return false;

  const keyBytes = base32Decode(secret);
  if (keyBytes.length === 0) return false;

  const counter = Math.floor(Date.now() / 1000 / period);

  for (let step = -window; step <= window; step++) {
    const candidate = await hotp(keyBytes, counter + step);
    if (timingSafeEqual(candidate, code)) return true;
  }

  return false;
}
