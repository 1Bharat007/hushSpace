/**
 * hushSpace — Zero-Knowledge Cryptographic Engine
 * 
 * Implements client-side AES-GCM-256 encryption with PBKDF2 key derivation.
 * All encryption/decryption happens exclusively in the browser.
 * The server never sees plaintext data or encryption keys.
 * 
 * Architecture:
 *   User Passphrase → PBKDF2(100k iterations) → Master Key
 *   Master Key wraps/unwraps a random Data Encryption Key (DEK)
 *   DEK encrypts/decrypts all user content via AES-GCM-256
 * 
 * @module lib/crypto
 */

const PBKDF2_ITERATIONS = 100_000;
const SALT_BYTES = 16;
const IV_BYTES = 12;
const DEK_BITS = 256;

/**
 * Generate a cryptographically random salt.
 * @returns {Uint8Array} 16-byte random salt
 */
export function generateSalt() {
  return crypto.getRandomValues(new Uint8Array(SALT_BYTES));
}

/**
 * Generate a random Initialization Vector for AES-GCM.
 * @returns {Uint8Array} 12-byte random IV
 */
function generateIV() {
  return crypto.getRandomValues(new Uint8Array(IV_BYTES));
}

/**
 * Convert ArrayBuffer to base64 string.
 * @param {ArrayBuffer} buffer
 * @returns {string}
 */
function bufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Convert base64 string to ArrayBuffer.
 * @param {string} base64
 * @returns {ArrayBuffer}
 */
function base64ToBuffer(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Derive an AES-GCM-256 master key from a passphrase using PBKDF2.
 * 
 * @param {string} passphrase - User's master passphrase
 * @param {Uint8Array} salt - Unique per-user salt
 * @returns {Promise<CryptoKey>} Derived AES-GCM key (non-extractable)
 */
export async function deriveKey(passphrase, salt) {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: DEK_BITS },
    false,
    ['wrapKey', 'unwrapKey']
  );
}

/**
 * Generate a random Data Encryption Key (DEK) for encrypting user content.
 * 
 * @returns {Promise<CryptoKey>} Random AES-GCM-256 key (extractable for wrapping)
 */
export async function generateDEK() {
  return crypto.subtle.generateKey(
    { name: 'AES-GCM', length: DEK_BITS },
    true, // extractable — needed for wrapKey
    ['encrypt', 'decrypt']
  );
}

/**
 * Wrap (encrypt) a DEK using the master key for safe storage.
 * 
 * @param {CryptoKey} dek - Data Encryption Key to wrap
 * @param {CryptoKey} masterKey - Master key derived from passphrase
 * @returns {Promise<{wrappedKey: string, iv: string}>} Base64-encoded wrapped key + IV
 */
export async function wrapDEK(dek, masterKey) {
  const iv = generateIV();
  const wrappedKeyBuffer = await crypto.subtle.wrapKey(
    'raw',
    dek,
    masterKey,
    { name: 'AES-GCM', iv }
  );

  return {
    wrappedKey: bufferToBase64(wrappedKeyBuffer),
    iv: bufferToBase64(iv),
  };
}

/**
 * Unwrap (decrypt) a DEK using the master key.
 * 
 * @param {string} wrappedKeyB64 - Base64-encoded wrapped key
 * @param {string} ivB64 - Base64-encoded IV used during wrapping
 * @param {CryptoKey} masterKey - Master key derived from passphrase
 * @returns {Promise<CryptoKey>} Unwrapped DEK ready for encrypt/decrypt
 * @throws {DOMException} If passphrase is wrong (integrity check fails)
 */
export async function unwrapDEK(wrappedKeyB64, ivB64, masterKey) {
  const wrappedKeyBuffer = base64ToBuffer(wrappedKeyB64);
  const iv = new Uint8Array(base64ToBuffer(ivB64));

  return crypto.subtle.unwrapKey(
    'raw',
    wrappedKeyBuffer,
    masterKey,
    { name: 'AES-GCM', iv },
    { name: 'AES-GCM', length: DEK_BITS },
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt plaintext content using AES-GCM-256.
 * 
 * @param {string} plaintext - Content to encrypt
 * @param {CryptoKey} dek - Data Encryption Key
 * @returns {Promise<{ciphertext: string, iv: string}>} Base64-encoded ciphertext + IV
 */
export async function encrypt(plaintext, dek) {
  const encoder = new TextEncoder();
  const iv = generateIV();

  const ciphertextBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    dek,
    encoder.encode(plaintext)
  );

  return {
    ciphertext: bufferToBase64(ciphertextBuffer),
    iv: bufferToBase64(iv),
  };
}

/**
 * Decrypt AES-GCM-256 ciphertext back to plaintext.
 * 
 * @param {string} ciphertextB64 - Base64-encoded ciphertext
 * @param {string} ivB64 - Base64-encoded IV
 * @param {CryptoKey} dek - Data Encryption Key
 * @returns {Promise<string>} Decrypted plaintext
 * @throws {DOMException} If data has been tampered with (GCM auth tag failure)
 */
export async function decrypt(ciphertextB64, ivB64, dek) {
  const ciphertextBuffer = base64ToBuffer(ciphertextB64);
  const iv = new Uint8Array(base64ToBuffer(ivB64));

  const plaintextBuffer = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    dek,
    ciphertextBuffer
  );

  const decoder = new TextDecoder();
  return decoder.decode(plaintextBuffer);
}

/**
 * Generate a human-readable recovery key (6 groups of 4 hex chars).
 * This is shown once during setup for the user to write down.
 * 
 * @returns {string} Recovery key like "a3f2-b8c1-d4e5-f6a7-b8c9-d0e1"
 */
export function generateRecoveryKey() {
  const bytes = crypto.getRandomValues(new Uint8Array(12));
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  
  // Split into 6 groups of 4
  return hex.match(/.{4}/g).join('-');
}

/**
 * Verify that the Web Crypto API is available in this environment.
 * @returns {boolean}
 */
export function isCryptoAvailable() {
  return (
    typeof crypto !== 'undefined' &&
    typeof crypto.subtle !== 'undefined' &&
    typeof crypto.getRandomValues === 'function'
  );
}
