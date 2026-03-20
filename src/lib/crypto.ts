// For this MVP, we use a deterministic key derived from a platform secret. 
// In a full zero-knowledge setup, this would use a user-derived Key Encryption Key (KEK).
const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || 'splitpayng-32-byte-secure-key-12';

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
    encryptedData: Buffer.from(encrypted).toString('base64'),
    iv: Buffer.from(iv).toString('base64')
  };
}

export async function decryptData(encryptedBase64: string, ivBase64: string): Promise<string> {
  const key = await getCryptoKey();
  const iv = Buffer.from(ivBase64, 'base64');
  const encryptedData = Buffer.from(encryptedBase64, 'base64');

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: new Uint8Array(iv) },
    key,
    new Uint8Array(encryptedData)
  );

  const dec = new TextDecoder();
  return dec.decode(decrypted);
}