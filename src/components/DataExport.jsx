import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, FileText, Trash2, ShieldAlert, X, Check, AlertTriangle, Database } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCrypto } from '../context/CryptoContext';
import { db, storage } from '../firebase/config';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';

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
    try {
      // Fetch all user collections
      const entriesSnap = await getDocs(query(collection(db, 'entries'), where('userId', '==', user.uid)));
      const audioSnap = await getDocs(query(collection(db, 'audio'), where('userId', '==', user.uid)));
      const gallerySnap = await getDocs(query(collection(db, 'gallery'), where('userId', '==', user.uid)));

      const backup = {
        version: '2.0.0',
        exportedAt: new Date().toISOString(),
        userId: user.uid,
        entries: entriesSnap.docs.map(d => ({ id: d.id, ...d.data() })),
        audio: audioSnap.docs.map(d => ({ id: d.id, ...d.data() })),
        gallery: gallerySnap.docs.map(d => ({ id: d.id, ...d.data() })),
      };

      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hushSpace-encrypted-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);

      setSuccessMsg('Encrypted backup successfully exported.');
    } catch (err) {
      console.error('Export failed:', err);
      setErrorMsg('Failed to export encrypted backup.');
    } finally {
      setExportingJson(false);
    }
  };

  /**
   * Export decrypted Markdown journal.
   */
  const handleExportDecryptedMarkdown = async () => {
    if (!user || isLocked) {
      setErrorMsg('Please unlock your encryption vault first.');
      return;
    }
    setExportingMd(true);
    setErrorMsg('');

    try {
      const entriesSnap = await getDocs(query(collection(db, 'entries'), where('userId', '==', user.uid)));
      
      let markdownContent = `# hushSpace Personal Journal Export\n`;
      markdownContent += `Exported on: ${new Date().toLocaleString()}\n\n---\n\n`;

      for (const docSnap of entriesSnap.docs) {
        const data = docSnap.data();
        let decryptedTitle = data.title || 'Untitled Entry';
        let decryptedContent = data.content || '';

        // If entry is encrypted
        if (data.isEncrypted && data.ciphertext) {
          decryptedContent = await decryptText(data.ciphertext, data.iv);
          if (data.titleCiphertext) {
            decryptedTitle = await decryptText(data.titleCiphertext, data.titleIv);
          }
        }

        const dateStr = data.createdAt?.toDate ? data.createdAt.toDate().toLocaleDateString() : 'Unknown Date';
        const moodEmoji = data.mood || '';

        markdownContent += `## ${decryptedTitle} ${moodEmoji}\n`;
        markdownContent += `*Date: ${dateStr}*\n\n`;
        if (data.tags && data.tags.length > 0) {
          markdownContent += `*Tags: ${data.tags.map(t => `#${t}`).join(' ')}*\n\n`;
        }
        markdownContent += `${decryptedContent}\n\n---\n\n`;
      }

      const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hushSpace-journal-${new Date().toISOString().slice(0, 10)}.md`;
      a.click();
      URL.revokeObjectURL(url);

      setSuccessMsg('Decrypted Markdown journal exported.');
    } catch (err) {
      console.error('Markdown export failed:', err);
      setErrorMsg('Failed to export decrypted markdown.');
    } finally {
      setExportingMd(false);
    }
  };

  /**
   * Complete account and data wipe (Data Sovereignty).
   */
  const handleWipeAccount = async () => {
    if (wipeInput !== 'DELETE ALL MY DATA') {
      setErrorMsg('Please type the exact phrase to confirm deletion.');
      return;
    }

    setWiping(true);
    setErrorMsg('');
    try {
      // 1. Delete all entries
      const entriesSnap = await getDocs(query(collection(db, 'entries'), where('userId', '==', user.uid)));
      for (const d of entriesSnap.docs) {
        await deleteDoc(doc(db, 'entries', d.id));
      }

      // 2. Delete audio metadata
      const audioSnap = await getDocs(query(collection(db, 'audio'), where('userId', '==', user.uid)));
      for (const d of audioSnap.docs) {
        await deleteDoc(doc(db, 'audio', d.id));
      }

      // 3. Delete gallery metadata
      const gallerySnap = await getDocs(query(collection(db, 'gallery'), where('userId', '==', user.uid)));
      for (const d of gallerySnap.docs) {
        await deleteDoc(doc(db, 'gallery', d.id));
      }

      // 4. Delete user encryption metadata
      await deleteDoc(doc(db, 'users', user.uid));

      // 5. Sign out
      await logout();
      onClose();
    } catch (err) {
      console.error('Data wipe failed:', err);
      setErrorMsg('Failed to wipe data completely.');
      setWiping(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[160] flex items-center justify-center p-4">
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
          className="relative w-full max-w-lg glass-card p-6 sm:p-8 rounded-3xl shadow-2xl ring-1 ring-white/10"
        >
          <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                <Database size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Data Sovereignty</h2>
                <p className="text-xs text-text-dim">You own 100% of your data. Export or erase anytime.</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-text-dim hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>

          {successMsg && (
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 p-3 rounded-xl text-xs font-medium mb-4">
              <Check size={16} className="shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-300 p-3 rounded-xl text-xs font-medium mb-4">
              <AlertTriangle size={16} className="shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="space-y-4">
            {/* Option 1: Encrypted JSON Backup */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Download size={16} className="text-brand-accent" />
                  Encrypted JSON Backup
                </h4>
                <p className="text-xs text-text-dim mt-0.5">
                  Full raw snapshot for offline preservation and future restore.
                </p>
              </div>
              <button
                onClick={handleExportEncryptedJson}
                disabled={exportingJson}
                className="bg-brand-accent hover:bg-brand-accent-hover text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-brand-accent/20 shrink-0 disabled:opacity-50"
              >
                {exportingJson ? 'Exporting...' : 'Export JSON'}
              </button>
            </div>

            {/* Option 2: Decrypted Markdown */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileText size={16} className="text-purple-400" />
                  Markdown Diary (.md)
                </h4>
                <p className="text-xs text-text-dim mt-0.5">
                  Readable plaintext journal format. Compatible with Obsidian & Notion.
                </p>
              </div>
              <button
                onClick={handleExportDecryptedMarkdown}
                disabled={exportingMd || isLocked}
                className="bg-purple-500 hover:bg-purple-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-purple-500/20 shrink-0 disabled:opacity-50"
              >
                {exportingMd ? 'Exporting...' : 'Export .md'}
              </button>
            </div>

            {/* Option 3: Account / Data Wipe */}
            <div className="p-4 rounded-2xl bg-red-500/[0.03] border border-red-500/20">
              <div className="flex items-center justify-between gap-4 mb-2">
                <h4 className="text-sm font-bold text-red-400 flex items-center gap-2">
                  <ShieldAlert size={16} />
                  Purge & Wipe Sanctuary
                </h4>
                {!showWipeConfirm && (
                  <button
                    onClick={() => setShowWipeConfirm(true)}
                    className="text-xs font-bold text-red-400 hover:text-red-300 bg-red-500/10 px-4 py-2 rounded-xl transition-colors"
                  >
                    Wipe Data
                  </button>
                )}
              </div>
              <p className="text-xs text-text-dim">
                Permanently deletes all entries, gallery metadata, audio files, and encryption keys from Cloud servers.
              </p>

              {showWipeConfirm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 pt-4 border-t border-red-500/20 space-y-3"
                >
                  <p className="text-xs text-red-300">
                    Type <strong className="text-white font-mono">DELETE ALL MY DATA</strong> below to confirm:
                  </p>
                  <input
                    type="text"
                    value={wipeInput}
                    onChange={(e) => setWipeInput(e.target.value)}
                    placeholder="DELETE ALL MY DATA"
                    className="w-full bg-black/40 border border-red-500/30 rounded-xl p-2.5 text-xs text-white placeholder:text-white/20 font-mono outline-none focus:border-red-500"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleWipeAccount}
                      disabled={wiping || wipeInput !== 'DELETE ALL MY DATA'}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2.5 rounded-xl transition-colors disabled:opacity-40"
                    >
                      {wiping ? 'Purging...' : 'Permanently Delete Everything'}
                    </button>
                    <button
                      onClick={() => {
                        setShowWipeConfirm(false);
                        setWipeInput('');
                      }}
                      className="px-4 bg-white/5 hover:bg-white/10 text-xs text-text-dim hover:text-white font-bold rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default DataExport;
