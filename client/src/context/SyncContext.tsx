import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import dbService, { CollectionName } from '@/lib/db';

interface SyncContextProps {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTime: Date | null;
  syncStatus: Map<CollectionName, boolean>;
  syncAllCollections: () => Promise<void>;
  syncCollection: (collection: CollectionName) => Promise<void>;
}

const SyncContext = createContext<SyncContextProps | undefined>(undefined);

interface SyncProviderProps {
  children: ReactNode;
}

export function SyncProvider({ children }: SyncProviderProps) {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncStatus, setSyncStatus] = useState<Map<CollectionName, boolean>>(new Map());

  // Inicializar el estado de sincronización
  useEffect(() => {
    const collections: CollectionName[] = [
      'machines', 
      'animals', 
      'pastures',
      'pastureWorks',
      'maintenance',
      'investments',
      'capital',
      'employees'
    ];
    
    const initialSyncStatus = new Map<CollectionName, boolean>();
    collections.forEach(collection => {
      initialSyncStatus.set(collection, false);
    });
    
    setSyncStatus(initialSyncStatus);
    
    // Registrar escuchador para cambios de conectividad
    const removeListener = dbService.addNetworkListener((online: boolean) => {
      setIsOnline(online);
      
      // Mostrar notificación de cambio de estado
      if (online) {
        console.log('Conexión restablecida. Sincronizando datos...');
        syncAllCollections();
      } else {
        console.log('Conexión perdida. Trabajando en modo offline.');
      }
    });
    
    // Intentar una sincronización inicial si estamos online
    if (navigator.onLine) {
      syncAllCollections();
    }
    
    return () => {
      removeListener();
    };
  }, []);

  // Función para sincronizar todas las colecciones
  const syncAllCollections = async () => {
    if (!isOnline) {
      console.log('No se puede sincronizar, dispositivo offline');
      return;
    }
    
    setIsSyncing(true);
    
    try {
      await dbService.syncAll();
      
      // Actualizar estado de sincronización
      const newSyncStatus = new Map(syncStatus);
      newSyncStatus.forEach((_, collection) => {
        newSyncStatus.set(collection, true);
      });
      
      setSyncStatus(newSyncStatus);
      setLastSyncTime(new Date());
      
      console.log('Sincronización completa: ' + new Date().toLocaleString());
    } catch (error) {
      console.error('Error al sincronizar todas las colecciones:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  // Función para sincronizar una colección específica
  const syncCollection = async (collection: CollectionName) => {
    if (!isOnline) {
      console.log(`No se puede sincronizar ${collection}, dispositivo offline`);
      return;
    }
    
    setIsSyncing(true);
    
    try {
      await dbService.sync(collection);
      
      // Actualizar estado de sincronización
      const newSyncStatus = new Map(syncStatus);
      newSyncStatus.set(collection, true);
      setSyncStatus(newSyncStatus);
      
      // Actualizar tiempo de última sincronización
      setLastSyncTime(new Date());
      
      console.log(`Colección ${collection} sincronizada: ${new Date().toLocaleString()}`);
    } catch (error) {
      console.error(`Error al sincronizar la colección ${collection}:`, error);
    } finally {
      setIsSyncing(false);
    }
  };

  const value = {
    isOnline,
    isSyncing,
    lastSyncTime,
    syncStatus,
    syncAllCollections,
    syncCollection
  };

  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
}

export function useSync() {
  const context = useContext(SyncContext);
  if (context === undefined) {
    throw new Error('useSync debe ser usado dentro de un SyncProvider');
  }
  return context;
}