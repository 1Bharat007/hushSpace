/**
 * hushSpace v0.0.1 — Hardened Cryptographic Engine
 * 
 * Implements client-side AES-GCM-256 envelope encryption with PBKDF2 key derivation.
 * Conforms strictly to W3C Web Cryptography API standards.
 * 
 * Threat Model Mitigations:
 * 1. Zero Cloud Plaintext: Data is encrypted/authenticated before leaving browser memory.
 * 2. Timing Attacks: Constant-time buffer comparisons for authentication checks.
 * 3. Memory Residue: Explicit memory zeroing for sensitive buffers after cryptographic operations.
 * 4. Brute Force Defense: PBKDF2 with 100,000 iterations of SHA-256.
 * 
 * @module lib/crypto/engine
 */

const PBKDF2_ITERATIONS = 100_000;
const SALT_BYTES = 16;
const IV_BYTES = 12;
const KEY_BITS = 256;

/**
 * Safely zero out a Uint8Array buffer in memory.
 * @param {Uint8Array} buffer 
 */
export function zeroBuffer(buffer) {
  if (buffer && buffer.fill) {
    buffer.fill(0);
  }
}

/**
 * Constant-time comparison between two Uint8Arrays to prevent timing attacks.
 * @param {Uint8Array} a 
 * @param {Uint8Array} b 
 * @returns {boolean}
 */
export function constantTimeEqual(a, b) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a[i] ^ b[i];
  }
  return result === 0;
}

/**
 * Generate a cryptographically secure random salt (16 bytes).
 * @returns {Uint8Array}
 */
export function generateSalt() {
  return crypto.getRandomValues(new Uint8Array(SALT_BYTES));
}

/**
 * Generate a random 12-byte Initialization Vector (IV) for AES-GCM.
 * @returns {Uint8Array}
 */
export function generateIV() {
  return crypto.getRandomValues(new Uint8Array(IV_BYTES));
}

/**
 * Convert ArrayBuffer to standard base64 string.
 * @param {ArrayBuffer} buffer
 * @returns {string}
 */
export function bufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Convert base64 string back to ArrayBuffer.
 * @param {string} base64
 * @returns {ArrayBuffer}
 */
export function base64ToBuffer(base64) {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Convert Uint8Array to Hex string.
 * @param {Uint8Array} bytes 
 * @returns {string}
 */
export function bytesToHex(bytes) {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Convert Hex string to Uint8Array.
 * @param {string} hex 
 * @returns {Uint8Array}
 */
export function hexToBytes(hex) {
  if (!hex || hex.length % 2 !== 0) return new Uint8Array(0);
  const matches = hex.match(/.{2}/g) || [];
  return new Uint8Array(matches.map((byte) => parseInt(byte, 16)));
}

/**
 * Derive an AES-GCM Master Key from user passphrase using PBKDF2 (100,000 iterations).
 * 
 * @param {string} passphrase - User passphrase
 * @param {Uint8Array} salt - 16-byte user-specific salt
 * @returns {Promise<CryptoKey>} Derived non-extractable CryptoKey
 */
export async function deriveMasterKey(passphrase, salt) {
  const encoder = new TextEncoder();
  const passphraseBytes = encoder.encode(passphrase);

  let keyMaterial = null;
  try {
    keyMaterial = await crypto.subtle.importKey(
      'raw',
      passphraseBytes,
      'PBKDF2',
      false,
      ['deriveKey']
    );

    const masterKey = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: PBKDF2_ITERATIONS,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: KEY_BITS },
      false, // non-extractable for security
      ['wrapKey', 'unwrapKey']
    );

    return masterKey;
  } finally {
    // Memory zeroing
    zeroBuffer(passphraseBytes);
  }
}

/**
 * Generate a cryptographically random 256-bit Data Encryption Key (DEK).
 * @returns {Promise<CryptoKey>}
 */
export async function generateDEK() {
  return crypto.subtle.generateKey(
    { name: 'AES-GCM', length: KEY_BITS },
    true, // extractable for envelope wrapping
    ['encrypt', 'decrypt']
  );
}

/**
 * Wrap (encrypt) the session DEK with the user's Master Key.
 * 
 * @param {CryptoKey} dek 
 * @param {CryptoKey} masterKey 
 * @returns {Promise<{wrappedKey: string, iv: string}>}
 */
export async function wrapDEK(dek, masterKey) {
  const iv = generateIV();
  const wrappedBuffer = await crypto.subtle.wrapKey(
    'raw',
    dek,
    masterKey,
    { name: 'AES-GCM', iv }
  );

  return {
    wrappedKey: bufferToBase64(wrappedBuffer),
    iv: bufferToBase64(iv),
  };
}

/**
 * Unwrap (decrypt) the stored DEK using the user's Master Key.
 * 
 * @param {string} wrappedKeyBase64 
 * @param {string} ivBase64 
 * @param {CryptoKey} masterKey 
 * @returns {Promise<CryptoKey>}
 */
export async function unwrapDEK(wrappedKeyBase64, ivBase64, masterKey) {
  const wrappedBuffer = base64ToBuffer(wrappedKeyBase64);
  const iv = new Uint8Array(base64ToBuffer(ivBase64));

  return crypto.subtle.unwrapKey(
    'raw',
    wrappedBuffer,
    masterKey,
    { name: 'AES-GCM', iv },
    { name: 'AES-GCM', length: KEY_BITS },
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt plaintext string using AES-GCM-256 with an authenticated tag.
 * 
 * @param {string} plaintext 
 * @param {CryptoKey} dek 
 * @returns {Promise<{ciphertext: string, iv: string}>}
 */
export async function encrypt(plaintext, dek) {
  const encoder = new TextEncoder();
  const plaintextBytes = encoder.encode(plaintext);
  const iv = generateIV();

  try {
    const ciphertextBuffer = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      dek,
      plaintextBytes
    );

    return {
      ciphertext: bufferToBase64(ciphertextBuffer),
      iv: bufferToBase64(iv),
    };
  } finally {
    zeroBuffer(plaintextBytes);
  }
}

/**
 * Decrypt AES-GCM-256 ciphertext. Throws DOMException on authentication failure.
 * 
 * @param {string} ciphertextBase64 
 * @param {string} ivBase64 
 * @param {CryptoKey} dek 
 * @returns {Promise<string>}
 */
export async function decrypt(ciphertextBase64, ivBase64, dek) {
  const ciphertextBuffer = base64ToBuffer(ciphertextBase64);
  const iv = new Uint8Array(base64ToBuffer(ivBase64));

  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    dek,
    ciphertextBuffer
  );

  const decoder = new TextDecoder();
  return decoder.decode(decryptedBuffer);
}

/**
 * Compute SHA-256 hash of a string in hex representation.
 * @param {string} text 
 * @returns {Promise<string>}
 */
export async function sha256Hex(text) {
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(text));
  return bytesToHex(new Uint8Array(hashBuffer));
}

/**
 * Check if Web Crypto API is fully supported in current runtime environment.
 * @returns {boolean}
 */
export function isWebCryptoAvailable() {
  return (
    typeof window !== 'undefined' &&
    typeof window.crypto !== 'undefined' &&
    typeof window.crypto.subtle !== 'undefined' &&
    typeof window.crypto.getRandomValues === 'function'
  );
}
