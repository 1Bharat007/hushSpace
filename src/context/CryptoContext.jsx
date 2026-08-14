import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import {
  deriveMasterKey,
  generateDEK,
  wrapDEK,
  unwrapDEK,
  encrypt,
  decrypt,
  generateSalt,
  bytesToHex,
  hexToBytes,
  sha256Hex,
  isWebCryptoAvailable,
  generateRecoveryPhrase,
} from '../lib/crypto';

const CryptoContext = createContext();

export const useCrypto = () => useContext(CryptoContext);

const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes auto-lock

export const CryptoProvider = ({ children }) => {
  const { user } = useAuth();
  
  // DEK lives strictly in transient JavaScript heap memory
  const [dek, setDek] = useState(null);
  const [isLocked, setIsLocked] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [recoveryPhrase, setRecoveryPhrase] = useState('');
  
  const inactivityTimerRef = useRef(null);

  // Inactivity auto-lock handler
  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    if (dek) {
      inactivityTimerRef.current = setTimeout(() => {
        setDek(null);
        setIsLocked(true);
      }, INACTIVITY_TIMEOUT_MS);
    }
  }, [dek]);

  useEffect(() => {
    const handleUserActivity = () => resetInactivityTimer();
    window.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('keydown', handleUserActivity);
    window.addEventListener('touchstart', handleUserActivity);

    return () => {
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      window.removeEventListener('touchstart', handleUserActivity);
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    };
  }, [resetInactivityTimer]);

  // Check if user has established encryption keys in Firestore
  useEffect(() => {
    if (!user) {
      setDek(null);
      setIsLocked(true);
      setNeedsSetup(false);
      setIsLoading(false);
      return;
    }

    const checkCryptoSetup = async () => {
      setIsLoading(true);
      try {
        const cryptoDoc = await getDoc(doc(db, 'users', user.uid));
        if (cryptoDoc.exists() && cryptoDoc.data().wrappedKey) {
          setNeedsSetup(false);
        } else {
          setNeedsSetup(true);
        }
      } catch (err) {
        console.error('Crypto check failed:', err);
        setNeedsSetup(true);
      } finally {
        setIsLoading(false);
      }
    };

    checkCryptoSetup();
  }, [user]);

  /**
   * Vault Setup: Derive Master Key, generate DEK, wrap and store in Firestore.
   */
  const setupEncryption = useCallback(async (passphrase) => {
    if (!user) throw new Error('No authenticated user found');
    setError('');

    try {
      const salt = generateSalt();
      const masterKey = await deriveMasterKey(passphrase, salt);
      const newDek = await generateDEK();
      const { wrappedKey, iv } = await wrapDEK(newDek, masterKey);
      const mnemonic = generateRecoveryPhrase();
      const recoveryHash = await sha256Hex(mnemonic);

      await setDoc(doc(db, 'users', user.uid), {
        wrappedKey,
        wrappedKeyIv: iv,
        salt: bytesToHex(salt),
        recoveryHash,
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      setDek(newDek);
      setIsLocked(false);
      setNeedsSetup(false);
      setRecoveryPhrase(mnemonic);
      resetInactivityTimer();

      return mnemonic;
    } catch (err) {
      console.error('Vault setup failed:', err);
      setError('Failed to configure encryption vault.');
      throw err;
    }
  }, [user, resetInactivityTimer]);

  /**
   * Unlock Vault: Derive Master Key and unwrap the DEK.
   */
  const unlockVault = useCallback(async (passphrase) => {
    if (!user) throw new Error('No authenticated user found');
    setError('');

    try {
      const cryptoDoc = await getDoc(doc(db, 'users', user.uid));
      if (!cryptoDoc.exists()) {
        throw new Error('Encryption vault not found.');
      }

      const data = cryptoDoc.data();
      const salt = hexToBytes(data.salt);
      const masterKey = await deriveMasterKey(passphrase, salt);
      const unwrappedDek = await unwrapDEK(data.wrappedKey, data.wrappedKeyIv, masterKey);

      setDek(unwrappedDek);
      setIsLocked(false);
      setError('');
      resetInactivityTimer();
    } catch (err) {
      console.error('Unlock failed:', err);
      setError('Incorrect passphrase or corrupted key data.');
      throw err;
    }
  }, [user, resetInactivityTimer]);

  /**
   * Manually lock vault and wipe session keys.
   */
  const lockVault = useCallback(() => {
    setDek(null);
    setIsLocked(true);
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
  }, []);

  /**
   * Encrypt text payload using the active session DEK.
   */
  const encryptText = useCallback(async (plaintext) => {
    if (!dek) throw new Error('Vault is locked. Unlock before encrypting.');
    if (!plaintext) return { ciphertext: '', iv: '' };
    return encrypt(plaintext, dek);
  }, [dek]);

  /**
   * Decrypt ciphertext payload using the active session DEK.
   */
  const decryptText = useCallback(async (ciphertext, iv) => {
    if (!dek) throw new Error('Vault is locked. Unlock before decrypting.');
    if (!ciphertext || !iv) return '';
    try {
      return await decrypt(ciphertext, iv, dek);
    } catch (err) {
      console.error('Decryption failed:', err);
      return '[Decryption failed — content may be altered or corrupted]';
    }
  }, [dek]);

  // Clean memory on tab close
  useEffect(() => {
    const handleBeforeUnload = () => {
      setDek(null);
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const value = {
    isLocked,
    needsSetup,
    isLoading,
    error,
    recoveryPhrase,
    isAvailable: isWebCryptoAvailable(),
    setupEncryption,
    unlockVault,
    lockVault,
    encryptText,
    decryptText,
    clearRecoveryPhrase: () => setRecoveryPhrase(''),
    clearError: () => setError(''),
  };

  return (
    <CryptoContext.Provider value={value}>
      {children}
    </CryptoContext.Provider>
  );
};
