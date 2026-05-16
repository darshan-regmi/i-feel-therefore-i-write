// Server-only Firestore REST client that runs on Cloudflare Workers / edge.
// Mints a Google OAuth2 access token from the service-account private key using
// Web Crypto, then talks to Firestore over REST with Bearer auth — bypassing
// security rules just like the firebase-admin SDK would, without pulling in
// any Node-only dependencies.

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const TOKEN_SCOPE = "https://www.googleapis.com/auth/datastore";
const TOKEN_LIFETIME_SECONDS = 3600; // Google's max
const TOKEN_REFRESH_BUFFER_SECONDS = 60; // refresh slightly early

type TokenCache = { token: string; expiresAtMs: number };
let cachedToken: TokenCache | null = null;

const base64UrlEncode = (data: ArrayBuffer | Uint8Array | string): string => {
  let bytes: Uint8Array;
  if (typeof data === "string") {
    bytes = new TextEncoder().encode(data);
  } else if (data instanceof ArrayBuffer) {
    bytes = new Uint8Array(data);
  } else {
    bytes = data;
  }
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

const pemToCryptoKey = async (pem: string): Promise<CryptoKey> => {
  const pemContents = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\s+/g, "");
  const binaryDer = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0));
  return crypto.subtle.importKey(
    "pkcs8",
    binaryDer.buffer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );
};

const getServiceAccount = () => {
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const rawKey = process.env.FIREBASE_PRIVATE_KEY;
  if (!clientEmail || !projectId || !rawKey) {
    throw new Error(
      "Missing FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY"
    );
  }
  // Vercel / Cloudflare often store the key with literal \n; normalise.
  const privateKey = rawKey.replaceAll("\\n", "\n");
  return { clientEmail, projectId, privateKey };
};

const mintAccessToken = async (): Promise<TokenCache> => {
  const { clientEmail, privateKey } = getServiceAccount();
  const now = Math.floor(Date.now() / 1000);

  const header = { alg: "RS256", typ: "JWT" };
  const claims = {
    iss: clientEmail,
    sub: clientEmail,
    aud: TOKEN_URL,
    scope: TOKEN_SCOPE,
    iat: now,
    exp: now + TOKEN_LIFETIME_SECONDS,
  };

  const signingInput = `${base64UrlEncode(JSON.stringify(header))}.${base64UrlEncode(JSON.stringify(claims))}`;
  const key = await pemToCryptoKey(privateKey);
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(signingInput)
  );
  const jwt = `${signingInput}.${base64UrlEncode(signature)}`;

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`OAuth token exchange failed: ${res.status} ${body}`);
  }

  const data = (await res.json()) as { access_token: string; expires_in: number };
  return {
    token: data.access_token,
    expiresAtMs: Date.now() + (data.expires_in - TOKEN_REFRESH_BUFFER_SECONDS) * 1000,
  };
};

export const getAccessToken = async (): Promise<string> => {
  if (cachedToken && Date.now() < cachedToken.expiresAtMs) {
    return cachedToken.token;
  }
  cachedToken = await mintAccessToken();
  return cachedToken.token;
};

const firestoreBase = () => {
  const { projectId } = getServiceAccount();
  return `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;
};

// Firestore REST value encoding helpers — we only need a tiny subset.
type FirestoreValue =
  | { stringValue: string }
  | { integerValue: string }
  | { booleanValue: boolean }
  | { timestampValue: string }
  | { nullValue: null };

const encodeValue = (v: string | number | boolean | Date | null): FirestoreValue => {
  if (v === null) return { nullValue: null };
  if (typeof v === "string") return { stringValue: v };
  if (typeof v === "boolean") return { booleanValue: v };
  if (typeof v === "number") return { integerValue: String(Math.trunc(v)) };
  if (v instanceof Date) return { timestampValue: v.toISOString() };
  throw new Error(`Unsupported Firestore value type: ${typeof v}`);
};

const decodeValue = (raw: FirestoreValue | undefined): unknown => {
  if (!raw) return undefined;
  if ("stringValue" in raw) return raw.stringValue;
  if ("integerValue" in raw) return Number(raw.integerValue);
  if ("booleanValue" in raw) return raw.booleanValue;
  if ("timestampValue" in raw) return raw.timestampValue;
  if ("nullValue" in raw) return null;
  return undefined;
};

const encodeFields = (data: Record<string, string | number | boolean | Date | null>) => {
  const fields: Record<string, FirestoreValue> = {};
  for (const [k, v] of Object.entries(data)) fields[k] = encodeValue(v);
  return fields;
};

type FirestoreDoc = { name: string; fields?: Record<string, FirestoreValue> };

export type PoemDoc = {
  id: string;
  title?: string;
  content?: string;
  likes?: number;
  createdAt?: string;
};

export const listAllPoems = async (): Promise<Map<string, PoemDoc>> => {
  const token = await getAccessToken();
  const out = new Map<string, PoemDoc>();
  let pageToken: string | undefined;

  do {
    const url = new URL(`${firestoreBase()}/poems`);
    url.searchParams.set("pageSize", "300");
    if (pageToken) url.searchParams.set("pageToken", pageToken);

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`Firestore list failed: ${res.status} ${body}`);
    }
    const data = (await res.json()) as {
      documents?: FirestoreDoc[];
      nextPageToken?: string;
    };
    for (const doc of data.documents ?? []) {
      const id = doc.name.split("/").pop();
      if (!id) continue;
      out.set(id, {
        id,
        title: decodeValue(doc.fields?.title) as string | undefined,
        content: decodeValue(doc.fields?.content) as string | undefined,
        likes: decodeValue(doc.fields?.likes) as number | undefined,
        createdAt: decodeValue(doc.fields?.createdAt) as string | undefined,
      });
    }
    pageToken = data.nextPageToken;
  } while (pageToken);

  return out;
};

type Write =
  | {
      update: { name: string; fields: Record<string, FirestoreValue> };
      // When omitted Firestore overwrites the whole doc.
      updateMask?: { fieldPaths: string[] };
      currentDocument?: { exists?: boolean };
    };

// Firestore caps writes per commit at 500.
const COMMIT_LIMIT = 500;

export const commitPoems = async (
  writes: Array<{
    id: string;
    fields: Record<string, string | number | boolean | Date | null>;
    /** When true, only the listed fields are updated. Otherwise we overwrite the doc. */
    mask?: string[];
    /** When true, the write only applies if the doc does NOT already exist. */
    createOnly?: boolean;
  }>
): Promise<void> => {
  if (writes.length === 0) return;
  const token = await getAccessToken();
  const { projectId } = getServiceAccount();
  const docPrefix = `projects/${projectId}/databases/(default)/documents/poems`;

  for (let i = 0; i < writes.length; i += COMMIT_LIMIT) {
    const chunk = writes.slice(i, i + COMMIT_LIMIT);
    const body: { writes: Write[] } = {
      writes: chunk.map((w) => {
        const write: Write = {
          update: {
            name: `${docPrefix}/${w.id}`,
            fields: encodeFields(w.fields),
          },
        };
        if (w.mask && w.mask.length > 0) {
          write.updateMask = { fieldPaths: w.mask };
        }
        if (w.createOnly) {
          write.currentDocument = { exists: false };
        }
        return write;
      }),
    };

    const res = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:commit`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const errBody = await res.text().catch(() => "");
      throw new Error(`Firestore commit failed: ${res.status} ${errBody}`);
    }
  }
};
