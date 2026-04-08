// For this MVP, we use a deterministic key derived from a platform secret. 
// In a full zero-knowledge setup, this would use a user-derived Key Encryption Key (KEK).
if (typeof window !== 'undefined') {
  throw new Error("SECURITY FAULT: Crypto functions must NOT be executed on the client-side.");
}

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || process.env.NEXT_PUBLIC_ENCRYPTION_KEY || 'splitpayng-32-byte-secure-key-12';

// Browser-safe base64 encoding helpers (no Node.js Buffer dependency)
function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function getCryptoKey(): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32)),
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"]
  );
  return keyMaterial;
}

export async function encryptData(text: string): Promise<{ encryptedData: string, iv: string }> {
  const key = await getCryptoKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder();
  
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv },
    key,
    enc.encode(text)
  );

  return {
    encryptedData: uint8ArrayToBase64(new Uint8Array(encrypted)),
    iv: uint8ArrayToBase64(iv)
  };
}

export async function decryptData(encryptedBase64: string, ivBase64: string): Promise<string> {
  const key = await getCryptoKey();
  const iv = base64ToUint8Array(ivBase64);
  const encryptedData = base64ToUint8Array(encryptedBase64);

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: new Uint8Array(iv) },
    key,
    new Uint8Array(encryptedData)
  );

  const dec = new TextDecoder();
  return dec.decode(decrypted);
}