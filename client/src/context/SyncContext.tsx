import { createContext, useState, useEffect, ReactNode } from 'react';
import { setupSync, usePendingDocsCount } from '@/lib/db';
import { useOfflineStatus } from '@/hooks/useOfflineStatus';

interface SyncContextType {
  isOffline: boolean;
  pendingChanges: number;
  startSync: () => void;
  stopSync: () => void;
}

export const SyncContext = createContext<SyncContextType>({
  isOffline: false,
  pendingChanges: 0,
  startSync: () => {},
  stopSync: () => {}
});

interface SyncProviderProps {
  children: ReactNode;
}

export const SyncProvider = ({ children }: SyncProviderProps) => {
  const isOffline = useOfflineStatus();
  const pendingChanges = usePendingDocsCount();
  const [syncHandler, setSyncHandler] = useState<any>(null);
  
  // Get the CouchDB remote URL from environment variables
  const remoteUrl = import.meta.env.VITE_COUCHDB_URL || 'http://localhost:5984';
  
  useEffect(() => {
    // Start sync on component mount
    startSync();
    
    // Clean up on unmount
    return () => {
      stopSync();
    };
  }, []);
  
  const startSync = () => {
    if (!syncHandler && !isOffline) {
      const handler = setupSync(remoteUrl);
      setSyncHandler(handler);
    }
  };
  
  const stopSync = () => {
    if (syncHandler) {
      syncHandler.cancel();
      setSyncHandler(null);
    }
  };
  
  // If online status changes, handle sync accordingly
  useEffect(() => {
    if (isOffline) {
      stopSync();
    } else {
      startSync();
    }
  }, [isOffline]);
  
  const value = {
    isOffline,
    pendingChanges,
    startSync,
    stopSync
  };
  
  return (
    <SyncContext.Provider value={value}>
      {children}
    </SyncContext.Provider>
  );
};
