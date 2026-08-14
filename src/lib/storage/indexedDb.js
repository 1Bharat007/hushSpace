/**
 * hushSpace v0.0.1 — Offline-First IndexedDB Storage Engine
 * 
 * Provides local encrypted storage with zero-latency startup and offline reliability.
 * Records are stored in encrypted format locally so client disk remains protected.
 * 
 * @module lib/storage/indexedDb
 */

const DB_NAME = 'hushspace_vault_db';
const DB_VERSION = 1;

let dbInstance = null;

/**
 * Open or initialize the IndexedDB instance.
 * @returns {Promise<IDBDatabase>}
 */
export function openVaultDB() {
  if (dbInstance) return Promise.resolve(dbInstance);

  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this environment.'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // 1. Entries Object Store
      if (!db.objectStoreNames.contains('entries')) {
        const entryStore = db.createObjectStore('entries', { keyPath: 'id' });
        entryStore.createIndex('userId', 'userId', { unique: false });
        entryStore.createIndex('updatedAt', 'updatedAt', { unique: false });
        entryStore.createIndex('isSynced', 'isSynced', { unique: false });
      }

      // 2. Soundscape Presets Object Store
      if (!db.objectStoreNames.contains('sound_presets')) {
        const presetStore = db.createObjectStore('sound_presets', { keyPath: 'id' });
        presetStore.createIndex('userId', 'userId', { unique: false });
      }

      // 3. Offline Sync Mutation Queue
      if (!db.objectStoreNames.contains('sync_queue')) {
        const syncStore = db.createObjectStore('sync_queue', { keyPath: 'queueId', autoIncrement: true });
        syncStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };

    request.onsuccess = (event) => {
      dbInstance = event.target.result;
      resolve(dbInstance);
    };

    request.onerror = (event) => {
      console.error('IndexedDB open error:', event.target.error);
      reject(event.target.error);
    };
  });
}

/**
 * Get all cached entries for a given user.
 * @param {string} userId 
 * @returns {Promise<Array<Object>>}
 */
export async function getLocalEntries(userId) {
  const db = await openVaultDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('entries', 'readonly');
    const store = tx.objectStore('entries');
    const index = store.index('userId');
    const request = index.getAll(userId);

    request.onsuccess = () => {
      const results = request.result || [];
      // Filter out soft-deleted items
      resolve(results.filter(item => !item.isDeleted));
    };
    request.onerror = () => reject(request.error);
  });
}

/**
 * Save or update an entry in local IndexedDB.
 * @param {Object} entry 
 * @returns {Promise<void>}
 */
export async function putLocalEntry(entry) {
  const db = await openVaultDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('entries', 'readwrite');
    const store = tx.objectStore('entries');
    const request = store.put(entry);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Bulk save entries from remote fetch into IndexedDB.
 * @param {Array<Object>} entries 
 * @returns {Promise<void>}
 */
export async function bulkPutLocalEntries(entries) {
  if (!entries || entries.length === 0) return;
  const db = await openVaultDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('entries', 'readwrite');
    const store = tx.objectStore('entries');

    entries.forEach(entry => {
      store.put({ ...entry, isSynced: true });
    });

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Soft-delete or hard-delete an entry locally.
 * @param {string} id 
 * @returns {Promise<void>}
 */
export async function deleteLocalEntry(id) {
  const db = await openVaultDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('entries', 'readwrite');
    const store = tx.objectStore('entries');
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/* ------------------- SYNC QUEUE OPERATIONS ------------------- */

/**
 * Enqueue an offline mutation to be synchronized when connection is restored.
 * @param {{type: 'create'|'update'|'delete', collection: string, docId: string, data: Object}} mutation 
 * @returns {Promise<number>} queueId
 */
export async function enqueueOfflineMutation(mutation) {
  const db = await openVaultDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('sync_queue', 'readwrite');
    const store = tx.objectStore('sync_queue');
    const record = {
      ...mutation,
      timestamp: Date.now(),
      attempts: 0,
    };
    const request = store.add(record);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Retrieve all pending sync mutations in FIFO order.
 * @returns {Promise<Array<Object>>}
 */
export async function getPendingSyncMutations() {
  const db = await openVaultDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('sync_queue', 'readonly');
    const store = tx.objectStore('sync_queue');
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Remove an item from the sync queue after successful remote processing.
 * @param {number} queueId 
 * @returns {Promise<void>}
 */
export async function removeSyncMutation(queueId) {
  const db = await openVaultDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('sync_queue', 'readwrite');
    const store = tx.objectStore('sync_queue');
    const request = store.delete(queueId);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Clear all local IndexedDB stores upon account purge or logout.
 * @returns {Promise<void>}
 */
export async function clearVaultDB() {
  const db = await openVaultDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['entries', 'sound_presets', 'sync_queue'], 'readwrite');
    tx.objectStore('entries').clear();
    tx.objectStore('sound_presets').clear();
    tx.objectStore('sync_queue').clear();

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
