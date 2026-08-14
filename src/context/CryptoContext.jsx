import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import {
  deriveKey,
  generateDEK,
  wrapDEK,
  unwrapDEK,
  encrypt,
  decrypt,
  generateSalt,
  generateRecoveryKey,
  isCryptoAvailable,
} from '../lib/crypto';

const CryptoContext = createContext();

export const useCrypto = () => useContext(CryptoContext);

/**
 * CryptoProvider manages the full encryption lifecycle:
 * 
 * 1. On first login → shows setup modal → user creates passphrase
 *    → generates salt + DEK → wraps DEK with master key → stores wrapped DEK + salt in Firestore
 * 
 * 2. On subsequent logins → shows unlock modal → user enters passphrase
 *    → derives master key → unwraps DEK from Firestore → DEK held in memory
 * 
 * 3. On logout / tab close → DEK wiped from memory
 * 
 * The DEK is NEVER persisted to disk or cloud. Only the wrapped (encrypted) DEK is stored.
 */
export const CryptoProvider = ({ children }) => {
  const { user } = useAuth();
  
  // Core crypto state — DEK lives only in memory
  const [dek, setDek] = useState(null);
  const [isLocked, setIsLocked] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [recoveryKey, setRecoveryKey] = useState('');

  // Check if user has existing encryption keys in Firestore
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
        console.error('Failed to check crypto setup:', err);
        setNeedsSetup(true);
      } finally {
        setIsLoading(false);
      }
    };

    checkCryptoSetup();
  }, [user]);

  /**
   * First-time setup: create passphrase, generate DEK, wrap and store.
   */
  const setupEncryption = useCallback(async (passphrase) => {
    if (!user) throw new Error('No authenticated user');
    setError('');

    try {
      // Generate unique salt for this user
      const salt = generateSalt();
      
      // Derive master key from passphrase
      const masterKey = await deriveKey(passphrase, salt);
      
      // Generate random Data Encryption Key
      const newDek = await generateDEK();
      
      // Wrap DEK with master key for safe cloud storage
      const { wrappedKey, iv } = await wrapDEK(newDek, masterKey);
      
      // Generate recovery key for user to write down
      const recovery = generateRecoveryKey();

      // Store wrapped DEK + salt in Firestore (never the raw DEK or passphrase)
      await setDoc(doc(db, 'users', user.uid), {
        wrappedKey,
        wrappedKeyIv: iv,
        salt: Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join(''),
        recoveryKeyHash: await hashRecoveryKey(recovery),
        createdAt: new Date().toISOString(),
      }, { merge: true });

      // Hold DEK in memory — this is the only place the raw DEK exists
      setDek(newDek);
      setIsLocked(false);
      setNeedsSetup(false);
      setRecoveryKey(recovery);
      
      return recovery;
    } catch (err) {
      console.error('Encryption setup failed:', err);
      setError('Failed to set up encryption. Please try again.');
      throw err;
    }
  }, [user]);

  /**
   * Unlock: derive master key from passphrase, unwrap DEK.
   */
  const unlockVault = useCallback(async (passphrase) => {
    if (!user) throw new Error('No authenticated user');
    setError('');

    try {
      const cryptoDoc = await getDoc(doc(db, 'users', user.uid));
      if (!cryptoDoc.exists()) {
        throw new Error('No encryption keys found. Please set up encryption first.');
      }

      const data = cryptoDoc.data();
      
      // Reconstruct salt from hex string
      const saltHex = data.salt;
      const salt = new Uint8Array(
        saltHex.match(/.{2}/g).map(byte => parseInt(byte, 16))
      );

      // Derive master key from passphrase + stored salt
      const masterKey = await deriveKey(passphrase, salt);

      // Unwrap DEK — this will throw if passphrase is wrong (GCM auth failure)
      const unwrappedDek = await unwrapDEK(data.wrappedKey, data.wrappedKeyIv, masterKey);

      setDek(unwrappedDek);
      setIsLocked(false);
      setError('');
    } catch (err) {
      console.error('Unlock failed:', err);
      if (err.name === 'OperationError') {
        setError('Incorrect passphrase. Please try again.');
      } else {
        setError(err.message || 'Failed to unlock vault.');
      }
      throw err;
    }
  }, [user]);

  /**
   * Lock vault — clear DEK from memory.
   */
  const lockVault = useCallback(() => {
    setDek(null);
    setIsLocked(true);
  }, []);

  /**
   * Encrypt text content using the session DEK.
   */
  const encryptText = useCallback(async (plaintext) => {
    if (!dek) throw new Error('Vault is locked. Unlock first.');
    if (!plaintext) return { ciphertext: '', iv: '' };
    return encrypt(plaintext, dek);
  }, [dek]);

  /**
   * Decrypt text content using the session DEK.
   */
  const decryptText = useCallback(async (ciphertext, iv) => {
    if (!dek) throw new Error('Vault is locked. Unlock first.');
    if (!ciphertext || !iv) return '';
    try {
      return await decrypt(ciphertext, iv, dek);
    } catch (err) {
      console.error('Decryption failed:', err);
      return '[Decryption failed — data may be corrupted]';
    }
  }, [dek]);

  /**
   * Hash recovery key for verification (not reversible).
   */
  async function hashRecoveryKey(key) {
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(key));
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  // Clear DEK on logout
  useEffect(() => {
    if (!user) {
      setDek(null);
      setIsLocked(true);
    }
  }, [user]);

  // Clear DEK when tab is closing (defense in depth)
  useEffect(() => {
    const handleBeforeUnload = () => {
      setDek(null);
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const value = {
    // State
    isLocked,
    needsSetup,
    isLoading,
    error,
    recoveryKey,
    isAvailable: isCryptoAvailable(),
    
    // Actions
    setupEncryption,
    unlockVault,
    lockVault,
    encryptText,
    decryptText,
    clearRecoveryKey: () => setRecoveryKey(''),
    clearError: () => setError(''),
  };

  return (
    <CryptoContext.Provider value={value}>
      {children}
    </CryptoContext.Provider>
  );
};
