// Simple mock version of PouchDB for initial development
// This helps us avoid the Class extends error while we fix the PouchDB integration
import { useEffect, useState } from 'react';

// Mock PouchDB implementation that doesn't rely on class extension
const createMockDB = (name: string) => {
  const store = new Map();
  
  return {
    name,
    put: async (doc: any) => {
      const id = doc._id || Math.random().toString(36).substring(2, 15);
      store.set(id, { ...doc, _id: id });
      return { id, ok: true };
    },
    get: async (id: string) => {
      const doc = store.get(id);
      if (!doc) throw new Error('Document not found');
      return doc;
    },
    allDocs: async () => ({
      rows: Array.from(store.entries()).map(([id, doc]) => ({ id, doc })),
      total_rows: store.size
    }),
    changes: async () => ({ results: [] }),
    sync: (remoteDB: any, options: any) => {
      console.log(`Sync started with options:`, options);
      const handler = {
        on: function(event: string, callback: Function) {
          // Store the callback for this event
          console.log(`Registered handler for event: ${event}`);
          // Return self for chaining
          return this;
        },
        cancel: () => console.log('Sync cancelled')
      };
      return handler;
    }
  };
};

// Setup databases using our mock implementation
const localDBs = {
  users: createMockDB('users'),
  machines: createMockDB('machines'),
  maintenance: createMockDB('maintenance'),
  machineFinances: createMockDB('machine_finances'),
  animals: createMockDB('animals'),
  animalVeterinary: createMockDB('animal_veterinary'),
  animalFinances: createMockDB('animal_finances'),
  pastures: createMockDB('pastures'),
  pastureFinances: createMockDB('pasture_finances'),
  investments: createMockDB('investments'),
  services: createMockDB('services'),
  taxes: createMockDB('taxes'),
  repairs: createMockDB('repairs'),
  salaries: createMockDB('salaries'),
  capital: createMockDB('capital'),
};

// Setup mock remote databases
const setupRemoteDBs = (remoteUrl: string) => {
  const remoteDBs = {
    users: createMockDB(`${remoteUrl}/users`),
    machines: createMockDB(`${remoteUrl}/machines`),
    maintenance: createMockDB(`${remoteUrl}/maintenance`),
    machineFinances: createMockDB(`${remoteUrl}/machine_finances`),
    animals: createMockDB(`${remoteUrl}/animals`),
    animalVeterinary: createMockDB(`${remoteUrl}/animal_veterinary`),
    animalFinances: createMockDB(`${remoteUrl}/animal_finances`),
    pastures: createMockDB(`${remoteUrl}/pastures`),
    pastureFinances: createMockDB(`${remoteUrl}/pasture_finances`),
    investments: createMockDB(`${remoteUrl}/investments`),
    services: createMockDB(`${remoteUrl}/services`),
    taxes: createMockDB(`${remoteUrl}/taxes`),
    repairs: createMockDB(`${remoteUrl}/repairs`),
    salaries: createMockDB(`${remoteUrl}/salaries`),
    capital: createMockDB(`${remoteUrl}/capital`),
  };

  return remoteDBs;
};

// Setup sync options
const syncOptions = {
  live: true,
  retry: true,
};

// Setup sync
export const setupSync = (remoteUrl: string) => {
  const remoteDBs = setupRemoteDBs(remoteUrl);
  
  // Start sync for each DB
  const syncHandlers = Object.keys(localDBs).map((dbName: string) => {
    const localDB = localDBs[dbName as keyof typeof localDBs];
    const remoteDB = remoteDBs[dbName as keyof typeof remoteDBs];
    
    return localDB.sync(remoteDB, syncOptions)
      .on('change', (change) => {
        console.log(`${dbName} sync change:`, change);
      })
      .on('paused', (info) => {
        console.log(`${dbName} sync paused:`, info);
      })
      .on('active', () => {
        console.log(`${dbName} sync active`);
      })
      .on('denied', (err) => {
        console.error(`${dbName} sync denied:`, err);
      })
      .on('complete', (info) => {
        console.log(`${dbName} sync complete:`, info);
      })
      .on('error', (err) => {
        console.error(`${dbName} sync error:`, err);
      });
  });
  
  return {
    cancel: () => {
      syncHandlers.forEach(handler => handler.cancel());
    }
  };
};

// Get DB instance
export const getDB = (name: keyof typeof localDBs) => {
  return localDBs[name];
};

// Get pending documents count (docs that need sync)
export const getPendingDocsCount = async () => {
  let totalPending = 0;
  
  for (const dbName in localDBs) {
    const db = localDBs[dbName as keyof typeof localDBs];
    // Get changes that haven't been synced yet
    const changes = await db.changes({
      since: 'now',
      live: false,
      include_docs: false
    });
    
    if (changes.results) {
      totalPending += changes.results.length;
    }
  }
  
  return totalPending;
};

// Hook to monitor pending docs count
export const usePendingDocsCount = () => {
  const [pendingCount, setPendingCount] = useState(0);
  
  useEffect(() => {
    const checkPendingDocs = async () => {
      const count = await getPendingDocsCount();
      setPendingCount(count);
    };
    
    // Check immediately
    checkPendingDocs();
    
    // Then check periodically
    const interval = setInterval(checkPendingDocs, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  return pendingCount;
};

// Export databases
export default localDBs;
