import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';
import { useEffect, useState } from 'react';

// Register plugins
PouchDB.plugin(PouchDBFind);

// Setup databases
const localDBs = {
  users: new PouchDB('users'),
  machines: new PouchDB('machines'),
  maintenance: new PouchDB('maintenance'),
  machineFinances: new PouchDB('machine_finances'),
  animals: new PouchDB('animals'),
  animalVeterinary: new PouchDB('animal_veterinary'),
  animalFinances: new PouchDB('animal_finances'),
  pastures: new PouchDB('pastures'),
  pastureFinances: new PouchDB('pasture_finances'),
  investments: new PouchDB('investments'),
  services: new PouchDB('services'),
  taxes: new PouchDB('taxes'),
  repairs: new PouchDB('repairs'),
  salaries: new PouchDB('salaries'),
  capital: new PouchDB('capital'),
};

// Setup remote databases
const setupRemoteDBs = (remoteUrl: string) => {
  const remoteDBs = {
    users: new PouchDB(`${remoteUrl}/users`),
    machines: new PouchDB(`${remoteUrl}/machines`),
    maintenance: new PouchDB(`${remoteUrl}/maintenance`),
    machineFinances: new PouchDB(`${remoteUrl}/machine_finances`),
    animals: new PouchDB(`${remoteUrl}/animals`),
    animalVeterinary: new PouchDB(`${remoteUrl}/animal_veterinary`),
    animalFinances: new PouchDB(`${remoteUrl}/animal_finances`),
    pastures: new PouchDB(`${remoteUrl}/pastures`),
    pastureFinances: new PouchDB(`${remoteUrl}/pasture_finances`),
    investments: new PouchDB(`${remoteUrl}/investments`),
    services: new PouchDB(`${remoteUrl}/services`),
    taxes: new PouchDB(`${remoteUrl}/taxes`),
    repairs: new PouchDB(`${remoteUrl}/repairs`),
    salaries: new PouchDB(`${remoteUrl}/salaries`),
    capital: new PouchDB(`${remoteUrl}/capital`),
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
