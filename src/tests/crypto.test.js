import test from 'node:test';
import assert from 'node:assert/strict';
import {
  deriveMasterKey,
  generateDEK,
  wrapDEK,
  unwrapDEK,
  encrypt,
  decrypt,
  generateSalt,
  constantTimeEqual,
  zeroBuffer,
  sha256Hex,
} from '../lib/crypto/engine.js';
import {
  generateRecoveryPhrase,
  validateRecoveryPhrase,
} from '../lib/crypto/recovery.js';

test('Hardened Crypto Suite — Constant-time buffer equality', () => {
  const buf1 = new Uint8Array([1, 2, 3, 4, 5]);
  const buf2 = new Uint8Array([1, 2, 3, 4, 5]);
  const buf3 = new Uint8Array([1, 2, 3, 4, 6]);
  const buf4 = new Uint8Array([1, 2, 3]);

  assert.equal(constantTimeEqual(buf1, buf2), true);
  assert.equal(constantTimeEqual(buf1, buf3), false);
  assert.equal(constantTimeEqual(buf1, buf4), false);
});

test('Hardened Crypto Suite — Buffer zeroing', () => {
  const buf = new Uint8Array([10, 20, 30, 40]);
  zeroBuffer(buf);
  assert.deepEqual(Array.from(buf), [0, 0, 0, 0]);
});

test('Hardened Crypto Suite — 12-Word Mnemonic Recovery Phrase', () => {
  const phrase = generateRecoveryPhrase();
  assert.equal(typeof phrase, 'string');
  const words = phrase.split(' ');
  assert.equal(words.length, 12);
  assert.equal(validateRecoveryPhrase(phrase), true);
  assert.equal(validateRecoveryPhrase('invalid fake words here'), false);
});

test('Hardened Crypto Suite — SHA-256 Hex Hash', async () => {
  const hash = await sha256Hex('hushspace-sanctuary');
  assert.equal(typeof hash, 'string');
  assert.equal(hash.length, 64);
});

test('Hardened Crypto Suite — PBKDF2 (100k) & AES-GCM-256 Envelope Encryption', async () => {
  const passphrase = 'SuperSecretSanctuaryPassphrase!2026';
  const salt = generateSalt();
  assert.equal(salt.length, 16);

  // 1. Derive master key from passphrase
  const masterKey = await deriveMasterKey(passphrase, salt);
  assert.ok(masterKey);

  // 2. Generate Data Encryption Key (DEK)
  const dek = await generateDEK();
  assert.ok(dek);

  // 3. Wrap DEK with master key
  const { wrappedKey, iv: wrappedIv } = await wrapDEK(dek, masterKey);
  assert.ok(wrappedKey);
  assert.ok(wrappedIv);

  // 4. Unwrap DEK with master key
  const unwrappedDek = await unwrapDEK(wrappedKey, wrappedIv, masterKey);
  assert.ok(unwrappedDek);

  // 5. Encrypt sensitive journal entry
  const plaintext = 'Tonight my mind is at absolute peace. The anxiety has cleared completely.';
  const { ciphertext, iv } = await encrypt(plaintext, unwrappedDek);
  assert.ok(ciphertext);
  assert.ok(iv);
  assert.notEqual(ciphertext, plaintext);

  // 6. Decrypt ciphertext back to plaintext
  const decrypted = await decrypt(ciphertext, iv, unwrappedDek);
  assert.equal(decrypted, plaintext);
});
