#!/usr/bin/env node
//
// Generates the TOTP secret used by the /qwzx confessional.
//
//   1. run:  node scripts/gen-totp.mjs
//   2. put the printed secret in .env.local AND your Cloudflare Pages env
//      as SYNC_TOTP_SECRET
//   3. paste the otpauth:// URI (or just the secret) into the one-time-password
//      field of your password manager
//
// Rotating the secret only affects the human-triggered POST /api/sync path.
// The daily cron keeps using the static SYNC_SECRET, so nothing breaks.

import { randomBytes } from "node:crypto";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

function base32Encode(buffer) {
  let bits = "";
  for (const byte of buffer) bits += byte.toString(2).padStart(8, "0");

  let out = "";
  for (let i = 0; i < bits.length; i += 5) {
    const chunk = bits.slice(i, i + 5).padEnd(5, "0");
    out += ALPHABET[parseInt(chunk, 2)];
  }
  return out;
}

const secret = base32Encode(randomBytes(20)); // 160 bits, RFC 4226 recommends
const issuer = "i feel, therefore i write";
const label = `${issuer}:sync`;

const uri =
  `otpauth://totp/${encodeURIComponent(label)}` +
  `?secret=${secret}` +
  `&issuer=${encodeURIComponent(issuer)}` +
  `&algorithm=SHA1&digits=6&period=30`;

console.log("");
console.log("  SYNC_TOTP_SECRET=" + secret);
console.log("");
console.log("  add this to your password manager (one-time password field):");
console.log("");
console.log("  " + uri);
console.log("");
console.log("  codes rotate every 30 seconds. type the 6 digits at /qwzx.");
console.log("");
