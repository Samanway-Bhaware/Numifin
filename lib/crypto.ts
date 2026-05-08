// ============================================================
// Symmetric encryption for secrets at rest
// Uses AES-256-GCM via the Web Crypto API (Node.js 20+)
// ============================================================

const ALGORITHM = "AES-GCM";
const KEY_LENGTH = 256;
const IV_LENGTH = 12; // bytes

function getEncryptionKey(): string {
  const key = process.env.ENCRYPTION_KEY;
  if (!key || key.length < 32) {
    // In development fall back to a deterministic key (never use in production)
    return process.env.NODE_ENV === "production"
      ? (() => { throw new Error("ENCRYPTION_KEY env var is required in production"); })()
      : "numifin-dev-key-32-chars-padding!";
  }
  return key;
}

async function deriveKey(rawKey: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(rawKey.slice(0, 32).padEnd(32, "0")),
    { name: ALGORITHM },
    false,
    ["encrypt", "decrypt"]
  );
  return keyMaterial;
}

export async function encrypt(plaintext: string): Promise<string> {
  const key = await deriveKey(getEncryptionKey());
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const enc = new TextEncoder();

  const ciphertext = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    enc.encode(plaintext)
  );

  // Combine iv + ciphertext and base64-encode
  const combined = new Uint8Array(IV_LENGTH + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), IV_LENGTH);

  return Buffer.from(combined).toString("base64");
}

export async function decrypt(encoded: string): Promise<string> {
  const key = await deriveKey(getEncryptionKey());
  const combined = Buffer.from(encoded, "base64");

  const iv = combined.subarray(0, IV_LENGTH);
  const ciphertext = combined.subarray(IV_LENGTH);

  const plaintext = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv },
    key,
    ciphertext
  );

  return new TextDecoder().decode(plaintext);
}
