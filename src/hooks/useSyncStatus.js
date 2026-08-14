import { useState, useEffect } from 'react';
import syncManager from '../lib/storage/syncManager';

/**
 * Hook to observe network connectivity and background sync status.
 * @returns {{ isOnline: boolean, isSyncing: boolean, triggerSync: () => Promise<void> }}
 */
export function useSyncStatus() {
  const [status, setStatus] = useState(() => syncManager.getStatus());

  useEffect(() => {
    const unsubscribe = syncManager.subscribe((newStatus) => {
      setStatus(newStatus);
    });
    return unsubscribe;
  }, []);

  const triggerSync = async () => {
    await syncManager.flushSyncQueue();
  };

  return {
    isOnline: status.isOnline,
    isSyncing: status.isSyncing,
    triggerSync,
  };
}

export default useSyncStatus;
