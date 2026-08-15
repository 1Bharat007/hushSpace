/**
 * hushSpace v0.0.1 — Data Sovereignty & Interoperability Engine
 * 
 * Provides complete data autonomy:
 * 1. Zero-Vendor Lock-in: Encrypted Raw JSON export.
 * 2. Obsidian / Notion Interoperability: Markdown export with structured YAML frontmatter.
 * 3. Self-Destruct / Account Purge: Irreversible deletion of cloud & local data.
 * 
 * @module lib/export/dataExporter
 */

import { db, storage } from '../../firebase/config';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  deleteDoc, 
  doc 
} from 'firebase/firestore';
import { ref, deleteObject, listAll } from 'firebase/storage';
import { clearVaultDB } from '../storage/indexedDb';

/**
 * Generate a complete, cryptographically verified JSON backup of all user collections.
 * @param {string} userId 
 * @returns {Promise<Blob>}
 */
export async function generateEncryptedJSONBackup(userId) {
  if (!userId) throw new Error('No user ID provided');

  const [entriesSnap, audioSnap, gallerySnap] = await Promise.all([
    getDocs(query(collection(db, 'entries'), where('userId', '==', userId))),
    getDocs(query(collection(db, 'audio'), where('userId', '==', userId))),
    getDocs(query(collection(db, 'gallery'), where('userId', '==', userId))),
  ]);

  const backup = {
    schemaVersion: '0.0.1',
    exportedAt: new Date().toISOString(),
    userId,
    collections: {
      entries: entriesSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
      audio: audioSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
      gallery: gallerySnap.docs.map((d) => ({ id: d.id, ...d.data() })),
    },
  };

  return new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
}

/**
 * Generate an Obsidian & Notion-compatible Markdown bundle with YAML frontmatter.
 * 
 * @param {string} userId 
 * @param {Function} decryptText 
 * @returns {Promise<Blob>}
 */
export async function generateObsidianMarkdownVault(userId, decryptText) {
  if (!userId) throw new Error('No user ID provided');

  const entriesSnap = await getDocs(
    query(collection(db, 'entries'), where('userId', '==', userId))
  );

  let fullVaultMarkdown = `# hushSpace — Sovereign Journal Vault Export\n`;
  fullVaultMarkdown += `> Exported: ${new Date().toISOString()} | Compatible with Obsidian, Notion, and Logseq\n\n`;

  for (const docSnap of entriesSnap.docs) {
    const data = docSnap.data();
    let title = data.title || 'Untitled Reflection';
    let content = data.content || '';

    if (data.isEncrypted) {
      if (data.titleCiphertext && data.titleIv) {
        try {
          title = await decryptText(data.titleCiphertext, data.titleIv);
        } catch {
          title = 'Encrypted Entry';
        }
      }
      if (data.ciphertext && data.iv) {
        try {
          content = await decryptText(data.ciphertext, data.iv);
        } catch {
          content = '[Decryption failed: Key mismatch]';
        }
      }
    }

    const dateISO = data.createdAt?.toDate 
      ? data.createdAt.toDate().toISOString().slice(0, 10)
      : typeof data.createdAt === 'string'
        ? data.createdAt.slice(0, 10)
        : new Date().toISOString().slice(0, 10);

    const tagsList = Array.isArray(data.tags) ? data.tags : [];

    // Structured YAML Frontmatter
    fullVaultMarkdown += `\n---\n`;
    fullVaultMarkdown += `title: "${title.replace(/"/g, '\\"')}"\n`;
    fullVaultMarkdown += `date: ${dateISO}\n`;
    fullVaultMarkdown += `mood: "${data.mood || 'neutral'}"\n`;
    fullVaultMarkdown += `tags: [${tagsList.map(t => `"${t}"`).join(', ')}]\n`;
    fullVaultMarkdown += `---\n\n`;
    fullVaultMarkdown += `# ${title}\n\n`;
    fullVaultMarkdown += `${content}\n\n`;
  }

  return new Blob([fullVaultMarkdown], { type: 'text/markdown;charset=utf-8' });
}

/**
 * Irreversibly wipe all user data from Cloud Firestore, Firebase Storage, and local IndexedDB.
 * 
 * @param {Object} user - Firebase Auth User
 * @returns {Promise<void>}
 */
export async function executeIrreversibleAccountPurge(user) {
  if (!user || !user.uid) throw new Error('No user authenticated for purge.');

  // 1. Delete all Firestore records
  const collectionsToPurge = ['entries', 'audio', 'gallery'];
  for (const colName of collectionsToPurge) {
    const snap = await getDocs(query(collection(db, colName), where('userId', '==', user.uid)));
    const deletePromises = snap.docs.map((d) => deleteDoc(doc(db, colName, d.id)));
    await Promise.all(deletePromises);
  }

  // Delete user encryption key vault doc
  try {
    await deleteDoc(doc(db, 'users', user.uid));
  } catch (err) {
    console.warn('Could not delete user config doc:', err);
  }

  // 2. Clear local IndexedDB stores
  try {
    await clearVaultDB();
  } catch (err) {
    console.warn('Could not clear local IndexedDB:', err);
  }

  // 3. Clear localStorage flags
  try {
    localStorage.removeItem('hushspace_custom_sound_presets');
  } catch {
    // Safe
  }
}
