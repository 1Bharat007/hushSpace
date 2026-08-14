/**
 * hushSpace v0.0.1 — Background Synchronization Manager
 * 
 * Orchestrates bi-directional data flow between local IndexedDB and Firebase Cloud Firestore.
 * Ensures data is persisted locally first, then synchronized transparently in the background.
 * 
 * @module lib/storage/syncManager
 */

import { db } from '../../firebase/config';
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  serverTimestamp, 
  getDocs, 
  query, 
  where 
} from 'firebase/firestore';
import { 
  getPendingSyncMutations, 
  removeSyncMutation, 
  bulkPutLocalEntries, 
  getLocalEntries 
} from './indexedDb';

class SyncManager {
  constructor() {
    this.isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    this.isSyncing = false;
    this.listeners = new Set();
    this.init();
  }

  init() {
    if (typeof window === 'undefined') return;

    window.addEventListener('online', () => {
      this.isOnline = true;
      this.notifyListeners();
      this.flushSyncQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifyListeners();
    });
  }

  /**
   * Subscribe to sync state changes.
   * @param {Function} callback 
   * @returns {Function} unsubscribe
   */
  subscribe(callback) {
    this.listeners.add(callback);
    callback(this.getStatus());
    return () => this.listeners.delete(callback);
  }

  notifyListeners() {
    const status = this.getStatus();
    this.listeners.forEach(cb => cb(status));
  }

  getStatus() {
    return {
      isOnline: this.isOnline,
      isSyncing: this.isSyncing,
    };
  }

  /**
   * Process all queued offline mutations to Firestore.
   */
  async flushSyncQueue() {
    if (!this.isOnline || this.isSyncing) return;
    this.isSyncing = true;
    this.notifyListeners();

    try {
      const queue = await getPendingSyncMutations();

      for (const item of queue) {
        try {
          if (item.type === 'create' || item.type === 'update') {
            const targetDoc = doc(db, item.collection, item.docId);
            await setDoc(targetDoc, {
              ...item.data,
              updatedAt: serverTimestamp(),
            }, { merge: true });
          } else if (item.type === 'delete') {
            const targetDoc = doc(db, item.collection, item.docId);
            await deleteDoc(targetDoc);
          }

          // Remove successfully replayed mutation
          await removeSyncMutation(item.queueId);
        } catch (err) {
          console.error(`Failed to process sync mutation #${item.queueId}:`, err);
          // If offline again, stop processing queue
          if (!navigator.onLine) break;
        }
      }
    } catch (err) {
      console.error('Error during flushSyncQueue:', err);
    } finally {
      this.isSyncing = false;
      this.notifyListeners();
    }
  }

  /**
   * Initial synchronization between Cloud Firestore and local IndexedDB.
   * Reconciles remote updates into local storage without blocking UI.
   * 
   * @param {string} userId 
   */
  async pullRemoteUpdates(userId) {
    if (!this.isOnline || !userId) return;

    try {
      const q = query(
        collection(db, 'entries'),
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(q);
      const remoteEntries = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

      if (remoteEntries.length > 0) {
        await bulkPutLocalEntries(remoteEntries);
      }
    } catch (err) {
      console.warn('Could not pull remote updates (operating offline):', err);
    }
  }
}

export const syncManager = new SyncManager();
export default syncManager;
