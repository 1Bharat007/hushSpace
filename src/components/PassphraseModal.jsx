import React, { useState, useEffect } from 'react';
import { useCrypto } from '../context/CryptoContext';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, Eye, EyeOff, Copy, Check, AlertTriangle, KeyRound, Sparkles } from 'lucide-react';

/**
 * PassphraseModal handles both encryption setup (first time) and vault unlock (returning).
 */
const PassphraseModal = () => {
  const { user } = useAuth();
  const {
    isLocked,
    needsSetup,
    isLoading,
    error,
    recoveryPhrase,
    setupEncryption,
    unlockVault,
    clearRecoveryPhrase,
    clearError,
  } = useCrypto();

  const [passphrase, setPassphrase] = useState('');
  const [confirmPassphrase, setConfirmPassphrase] = useState('');
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');
  const [copied, setCopied] = useState(false);
  const [recoveryAcked, setRecoveryAcked] = useState(false);

  const isVisible = user && isLocked && !isLoading;

  useEffect(() => {
    if (isVisible) {
      setPassphrase('');
      setConfirmPassphrase('');
      setShowPassphrase(false);
      setLocalError('');
      setSubmitting(false);
      setCopied(false);
      setRecoveryAcked(false);
      clearError();
    }
  }, [isVisible, clearError]);

  if (!isVisible) return null;

  // Recovery phrase confirmation screen
  if (recoveryPhrase) {
    const words = recoveryPhrase.split(' ');

    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-black/70 backdrop-blur-md"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="relative w-full max-w-lg glass-card p-6 sm:p-10 rounded-3xl shadow-2xl ring-1 ring-white/10"
        >
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400 mx-auto mb-3">
              <KeyRound size={28} />
            </div>
            <h2 className="text-2xl font-black text-white mb-1.5">Save Your Recovery Phrase</h2>
            <p className="text-text-dim text-xs sm:text-sm">
              Write down these 12 words in order and keep them private.
            </p>
          </div>

          <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 sm:p-5 mb-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest font-mono">
                12-Word Mnemonic
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(recoveryPhrase);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 font-bold transition-colors"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copied!' : 'Copy Phrase'}
              </button>
            </div>

            {/* 12-Word Grid */}
            <div className="grid grid-cols-3 gap-2">
              {words.map((word, idx) => (
                <div
                  key={idx}
                  className="bg-black/30 border border-white/5 px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 font-mono text-xs text-white"
                >
                  <span className="text-white/30 text-[10px] w-4">{idx + 1}.</span>
                  <span className="font-medium text-amber-200">{word}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-start gap-3 bg-red-500/5 border border-red-500/20 rounded-xl p-3.5 mb-5">
            <AlertTriangle size={16} className="text-red-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-red-300 leading-relaxed">
              <strong>This phrase will never be displayed again.</strong> If you lose both your passphrase and recovery phrase, your encrypted data cannot be recovered.
            </p>
          </div>

          <label className="flex items-center gap-3 mb-6 cursor-pointer group">
            <input
              type="checkbox"
              checked={recoveryAcked}
              onChange={(e) => setRecoveryAcked(e.target.checked)}
              className="w-4 h-4 rounded accent-brand-accent cursor-pointer"
            />
            <span className="text-xs sm:text-sm text-text-dim group-hover:text-white transition-colors">
              I have stored my recovery phrase in a safe place
            </span>
          </label>

          <button
            onClick={() => {
              clearRecoveryPhrase();
            }}
            disabled={!recoveryAcked}
            className="w-full bg-brand-accent hover:bg-brand-accent-hover text-white font-bold py-3.5 rounded-xl shadow-xl shadow-brand-accent/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
          >
            <Sparkles size={16} />
            Enter My Sanctuary
          </button>
        </motion.div>
      </div>
    );
  }

  const getStrength = (pwd) => {
    if (pwd.length < 6) return { label: 'Too Short', color: 'bg-red-500', width: '20%' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[^a-zA-Z0-9]/.test(pwd)) score++;

    if (score <= 1) return { label: 'Weak', color: 'bg-red-500', width: '30%' };
    if (score <= 2) return { label: 'Fair', color: 'bg-amber-500', width: '50%' };
    if (score <= 3) return { label: 'Good', color: 'bg-blue-500', width: '70%' };
    return { label: 'Strong', color: 'bg-emerald-500', width: '100%' };
  };

  const strength = getStrength(passphrase);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    clearError();

    if (needsSetup) {
      if (passphrase.length < 8) {
        setLocalError('Passphrase must be at least 8 characters.');
        return;
      }
      if (passphrase !== confirmPassphrase) {
        setLocalError('Passphrases do not match.');
        return;
      }
    }

    setSubmitting(true);
    try {
      if (needsSetup) {
        await setupEncryption(passphrase);
      } else {
        await unlockVault(passphrase);
      }
    } catch {
      // Error handled by context
    } finally {
      setSubmitting(false);
    }
  };

  const displayError = localError || error;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/70 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md glass-card p-6 sm:p-10 rounded-3xl shadow-2xl ring-1 ring-white/10"
        >
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-brand-accent/10 flex items-center justify-center text-brand-accent mx-auto mb-3">
              {needsSetup ? <Shield size={28} /> : <Lock size={28} />}
            </div>
            <h2 className="text-2xl font-black text-white mb-1.5">
              {needsSetup ? 'Configure Encrypted Vault' : 'Unlock Sanctuary'}
            </h2>
            <p className="text-text-dim text-xs sm:text-sm">
              {needsSetup
                ? 'Set a passphrase for client-side AES-GCM-256 encryption. We never see your passphrase.'
                : 'Enter your passphrase to decrypt your sanctuary.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dim group-focus-within:text-brand-accent transition-colors" size={18} />
              <input
                type={showPassphrase ? 'text' : 'password'}
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                placeholder={needsSetup ? 'Create a passphrase (8+ chars)' : 'Enter your passphrase'}
                className="w-full bg-white/5 border border-white/5 text-white rounded-xl py-3.5 pl-12 pr-12 outline-none focus:border-brand-accent/50 focus:ring-1 focus:ring-brand-accent/20 transition-all text-sm font-medium"
                required
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassphrase(!showPassphrase)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-dim hover:text-white"
              >
                {showPassphrase ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Strength Indicator */}
            {needsSetup && passphrase.length > 0 && (
              <div className="space-y-1.5">
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${strength.color} rounded-full transition-all duration-500`}
                    style={{ width: strength.width }}
                  />
                </div>
                <p className={`text-[10px] font-bold uppercase tracking-widest ${strength.color.replace('bg-', 'text-')}`}>
                  {strength.label}
                </p>
              </div>
            )}

            {/* Confirm Passphrase */}
            {needsSetup && (
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dim group-focus-within:text-brand-accent transition-colors" size={18} />
                <input
                  type={showPassphrase ? 'text' : 'password'}
                  value={confirmPassphrase}
                  onChange={(e) => setConfirmPassphrase(e.target.value)}
                  placeholder="Confirm passphrase"
                  className="w-full bg-white/5 border border-white/5 text-white rounded-xl py-3.5 pl-12 pr-4 outline-none focus:border-brand-accent/50 focus:ring-1 focus:ring-brand-accent/20 transition-all text-sm font-medium"
                  required
                />
              </div>
            )}

            {displayError && (
              <div className="flex items-center gap-2 text-red-400 text-xs px-3 py-2.5 bg-red-500/10 rounded-xl font-bold">
                <AlertTriangle size={14} className="shrink-0" />
                {displayError}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-brand-accent hover:bg-brand-accent-hover text-white font-bold py-3.5 rounded-xl shadow-xl shadow-brand-accent/20 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2 text-sm"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : needsSetup ? (
                <>
                  <Shield size={16} />
                  Initialize Encrypted Vault
                </>
              ) : (
                <>
                  <Lock size={16} />
                  Unlock
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PassphraseModal;
