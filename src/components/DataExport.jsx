import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, 
  FileText, 
  Trash2, 
  ShieldAlert, 
  X, 
  Check, 
  AlertTriangle, 
  Database,
  Lock,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCrypto } from '../context/CryptoContext';
import { 
  generateEncryptedJSONBackup, 
  generateObsidianMarkdownVault, 
  executeIrreversibleAccountPurge 
} from '../lib/export/dataExporter';

const DataExport = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const { decryptText, isLocked } = useCrypto();

  const [exportingJson, setExportingJson] = useState(false);
  const [exportingMd, setExportingMd] = useState(false);
  const [wiping, setWiping] = useState(false);
  const [showWipeConfirm, setShowWipeConfirm] = useState(false);
  const [wipeInput, setWipeInput] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  /**
   * Export raw encrypted backup (JSON).
   */
  const handleExportEncryptedJson = async () => {
    if (!user) return;
    setExportingJson(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const blob = await generateEncryptedJSONBackup(user.uid);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hushSpace-encrypted-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setSuccessMsg('Encrypted JSON backup downloaded.');
    } catch (err) {
      console.error('Export failed:', err);
      setErrorMsg('Failed to generate encrypted backup.');
    } finally {
      setExportingJson(false);
    }
  };

  /**
   * Export Obsidian/Notion Markdown Notebook.
   */
  const handleExportDecryptedMarkdown = async () => {
    if (!user) return;
    if (isLocked) {
      setErrorMsg('Please unlock your encryption vault first.');
      return;
    }

    setExportingMd(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const blob = await generateObsidianMarkdownVault(user.uid, decryptText);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hushSpace-obsidian-vault-${new Date().toISOString().slice(0, 10)}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setSuccessMsg('Obsidian & Notion markdown notebook downloaded.');
    } catch (err) {
      console.error('Markdown export failed:', err);
      setErrorMsg('Failed to export markdown notebook.');
    } finally {
      setExportingMd(false);
    }
  };

  /**
   * Complete Irreversible Account Purge.
   */
  const handleAccountPurge = async () => {
    if (wipeInput !== 'DELETE MY DATA') {
      setErrorMsg('Please type "DELETE MY DATA" exactly to confirm.');
      return;
    }

    setWiping(true);
    setErrorMsg('');

    try {
      await executeIrreversibleAccountPurge(user);
      await logout();
      window.location.href = '/';
    } catch (err) {
      console.error('Purge error:', err);
      setErrorMsg('Failed to complete purge. Please try again.');
      setWiping(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl glass-card p-6 sm:p-8 rounded-3xl shadow-2xl ring-1 ring-white/10 max-h-[90vh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-accent/10 flex items-center justify-center text-brand-accent">
                <Database size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Data Sovereignty & Account Privacy</h2>
                <p className="text-xs text-text-dim">
                  Your data belongs to you alone. Export anytime, zero lock-in, zero residue.
                </p>
              </div>
            </div>

            <button onClick={onClose} className="p-2 text-text-dim hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto py-5 space-y-6 pr-1">
            {/* Feedback Alerts */}
            {successMsg && (
              <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 rounded-2xl text-xs font-bold">
                <Check size={16} />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-2xl text-xs font-bold">
                <AlertTriangle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Export Section */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-text-dim uppercase tracking-wider font-mono">
                1. Portable Vault Exports
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Encrypted JSON Dump */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center gap-2 text-brand-accent font-bold text-sm mb-1">
                      <Download size={16} />
                      <span>Encrypted JSON Backup</span>
                    </div>
                    <p className="text-xs text-text-dim leading-relaxed">
                      Complete machine-readable JSON backup containing all reflections, audio metadata, and photo links.
                    </p>
                  </div>

                  <button
                    onClick={handleExportEncryptedJson}
                    disabled={exportingJson}
                    className="w-full bg-white/5 hover:bg-white/10 text-white font-bold py-2.5 rounded-xl border border-white/5 transition-all text-xs flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {exportingJson ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Download size={14} />
                        <span>Download JSON</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Obsidian / Notion Markdown Notebook */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center gap-2 text-purple-400 font-bold text-sm mb-1">
                      <FileText size={16} />
                      <span>Obsidian / Notion Markdown</span>
                    </div>
                    <p className="text-xs text-text-dim leading-relaxed">
                      Human-readable Markdown notebook with structured YAML frontmatter for seamless import into Obsidian or Notion.
                    </p>
                  </div>

                  <button
                    onClick={handleExportDecryptedMarkdown}
                    disabled={exportingMd || isLocked}
                    className="w-full bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 font-bold py-2.5 rounded-xl border border-purple-500/30 transition-all text-xs flex items-center justify-center gap-2 disabled:opacity-40"
                  >
                    {exportingMd ? (
                      <div className="w-4 h-4 border-2 border-purple-300/30 border-t-purple-300 rounded-full animate-spin" />
                    ) : (
                      <>
                        <FileText size={14} />
                        <span>{isLocked ? "Unlock Vault to Export" : "Download Markdown"}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Self-Destruct / Account Purge Section */}
            <div className="pt-4 border-t border-white/10 space-y-4">
              <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <ShieldAlert size={14} />
                <span>2. Irreversible Cloud & Local Purge</span>
              </h3>

              <div className="p-5 rounded-2xl bg-red-500/5 border border-red-500/20 space-y-4">
                <p className="text-xs text-red-300 leading-relaxed">
                  Permanently deletes all encrypted diary reflections, audio memos, photo vault files, IndexedDB caches, and encryption keys. This operation cannot be undone.
                </p>

                {!showWipeConfirm ? (
                  <button
                    onClick={() => setShowWipeConfirm(true)}
                    className="bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold px-4 py-2.5 rounded-xl border border-red-500/30 transition-all text-xs flex items-center gap-2"
                  >
                    <Trash2 size={14} />
                    <span>Initiate Account Self-Destruct</span>
                  </button>
                ) : (
                  <div className="space-y-3 pt-2">
                    <p className="text-xs font-mono text-text-dim">
                      Type <strong className="text-red-400">DELETE MY DATA</strong> below to confirm irreversible deletion:
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={wipeInput}
                        onChange={(e) => setWipeInput(e.target.value)}
                        placeholder="DELETE MY DATA"
                        className="flex-1 bg-black/40 border border-red-500/30 rounded-xl px-3 py-2 text-xs text-white placeholder:text-white/20 font-mono outline-none focus:border-red-500"
                        autoFocus
                      />
                      <button
                        onClick={handleAccountPurge}
                        disabled={wipeInput !== 'DELETE MY DATA' || wiping}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-lg shadow-red-600/20"
                      >
                        {wiping ? 'Purging...' : 'Confirm Purge'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default DataExport;
