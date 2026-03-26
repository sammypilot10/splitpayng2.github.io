// __tests__/crypto.test.ts
import { test } from 'node:test'
import * as assert from 'node:assert'
import { encryptData, decryptData } from '../src/lib/crypto'

// Mocking crypto.subtle for Node environment using webcrypto
if (typeof globalThis.crypto === 'undefined') {
  const { webcrypto } = require('node:crypto')
  globalThis.crypto = webcrypto as any
}

test('Crypto: encrypt and decrypt perfectly reconstructs the original payload', async () => {
  // We need to set up the encryption key dynamically since it relies on env vars usually
  process.env.NEXT_PUBLIC_ENCRYPTION_KEY = '12345678901234567890123456789012' // 32 chars
  
  const originalPayload = JSON.stringify({ username: 'testuser', password: 'SuperSecretPassword123!' })
  
  // 1. Encrypt
  const { encryptedData, iv } = await encryptData(originalPayload)
  assert.ok(encryptedData, 'Encrypted data should exist')
  assert.ok(iv, 'IV should exist')
  assert.notEqual(encryptedData, originalPayload, 'Encrypted data must not match plaintext')

  // 2. Decrypt
  const decrypted = await decryptData(encryptedData, iv)
  assert.equal(decrypted, originalPayload, 'Decrypted data must exactly match original plaintext')
})
