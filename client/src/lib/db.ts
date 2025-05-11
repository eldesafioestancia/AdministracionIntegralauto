import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';
import { doc, getDoc } from './firebase';

// Tipos de base de datos
export type CollectionName = 'machines' | 'animals' | 'pastures' | 'pastureWorks' | 'maintenance' | 'investments' | 'capital' | 'employees';

// Registrar el plugin de búsqueda de PouchDB
if (PouchDB) {
  PouchDB.plugin(PouchDBFind);
}

// Clase para manejar la base de datos local y su sincronización
class DatabaseService {
  private databases: Map<CollectionName, any>;
  private remoteUrls: Map<CollectionName, string>;
  private isOnline: boolean;
  private listeners: Set<(online: boolean) => void>;

  constructor() {
    this.databases = new Map();
    this.remoteUrls = new Map();
    this.isOnline = navigator.onLine;
    this.listeners = new Set();

    // Configurar las colecciones que vamos a sincronizar
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

    // Inicializar bases de datos locales y URLs remotas
    collections.forEach(collection => {
      this.databases.set(collection, new (PouchDB as any)(collection));
      this.remoteUrls.set(collection, `https://${import.meta.env.FIREBASE_PROJECT_ID}.firebaseio.com/${collection}`);
    });

    // Escuchar cambios en la conectividad
    window.addEventListener('online', this.handleNetworkChange.bind(this));
    window.addEventListener('offline', this.handleNetworkChange.bind(this));
  }

  // Manejar cambios en la conectividad
  private handleNetworkChange() {
    const prevOnline = this.isOnline;
    this.isOnline = navigator.onLine;
    
    if (prevOnline !== this.isOnline) {
      // Notificar a los escuchadores del cambio
      this.listeners.forEach(listener => listener(this.isOnline));
      
      // Si se recuperó la conexión, iniciar sincronización
      if (this.isOnline) {
        this.syncAll();
      }
    }
  }

  // Registrar un escuchador para cambios de conectividad
  public addNetworkListener(listener: (online: boolean) => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  // Obtener la base de datos local para una colección
  public getDatabase(collection: CollectionName): any {
    return this.databases.get(collection);
  }

  // Sincronizar una colección específica
  public async sync(collection: CollectionName): Promise<void> {
    if (!this.isOnline) {
      console.log(`No se puede sincronizar ${collection}, el dispositivo está offline`);
      return;
    }

    const localDb = this.databases.get(collection);
    const remoteUrl = this.remoteUrls.get(collection);

    if (!localDb || !remoteUrl) {
      console.error(`Error: no se encontró la base de datos local o la URL remota para ${collection}`);
      return;
    }

    try {
      const remoteDb = new (PouchDB as any)(remoteUrl);
      await localDb.sync(remoteDb, {
        live: true,
        retry: true
      });
      console.log(`Sincronización de ${collection} iniciada correctamente`);
    } catch (error) {
      console.error(`Error sincronizando ${collection}:`, error);
    }
  }

  // Sincronizar todas las colecciones
  public async syncAll(): Promise<void> {
    if (!this.isOnline) {
      console.log('No se pueden sincronizar las bases de datos, el dispositivo está offline');
      return;
    }

    const collections = Array.from(this.databases.keys());
    for (const collection of collections) {
      await this.sync(collection);
    }

    console.log('Todas las colecciones han sido sincronizadas');
  }

  // CRUD Operations

  // Crear un documento
  public async createDocument(collection: CollectionName, data: any): Promise<any> {
    const db = this.getDatabase(collection);
    const now = new Date().toISOString();
    
    const doc = {
      _id: data.id || `${collection}_${Date.now()}`,
      ...data,
      createdAt: now,
      updatedAt: now
    };

    try {
      const response = await db.put(doc);
      return { id: response.id, ...data };
    } catch (error) {
      console.error(`Error creating document in ${collection}:`, error);
      throw error;
    }
  }

  // Obtener todos los documentos
  public async getAllDocuments(collection: CollectionName): Promise<any[]> {
    const db = this.getDatabase(collection);
    
    try {
      const result = await db.allDocs({ include_docs: true });
      return result.rows
        .map((row: { doc: any }) => row.doc)
        .filter((doc: any) => doc && !doc._deleted)
        .map((doc: any) => {
          // Omitir propiedades internas de PouchDB
          const { _id, _rev, ...data } = doc;
          return { id: _id, ...data };
        });
    } catch (error) {
      console.error(`Error fetching documents from ${collection}:`, error);
      throw error;
    }
  }

  // Obtener un documento por ID
  public async getDocumentById(collection: CollectionName, id: string): Promise<any> {
    const db = this.getDatabase(collection);
    
    try {
      const doc = await db.get(id);
      const { _id, _rev, ...data } = doc as any;
      return { id: _id, ...data };
    } catch (error) {
      if ((error as any).name === 'not_found') {
        return null;
      }
      console.error(`Error fetching document ${id} from ${collection}:`, error);
      throw error;
    }
  }

  // Actualizar un documento
  public async updateDocument(collection: CollectionName, id: string, data: any): Promise<any> {
    const db = this.getDatabase(collection);
    
    try {
      // Obtener el documento actual para preservar el _rev
      const existingDoc = await db.get(id);
      
      // Actualizar el documento
      const updatedDoc = {
        ...existingDoc,
        ...data,
        updatedAt: new Date().toISOString()
      };

      const response = await db.put(updatedDoc);
      
      return { id: response.id, ...data };
    } catch (error) {
      console.error(`Error updating document ${id} in ${collection}:`, error);
      throw error;
    }
  }

  // Eliminar un documento
  public async deleteDocument(collection: CollectionName, id: string): Promise<void> {
    const db = this.getDatabase(collection);
    
    try {
      // Obtener el documento actual para obtener el _rev
      const doc = await db.get(id);
      
      // Eliminar el documento
      await db.remove(doc);
    } catch (error) {
      console.error(`Error deleting document ${id} from ${collection}:`, error);
      throw error;
    }
  }

  // Búsqueda de documentos
  public async findDocuments(collection: CollectionName, query: any): Promise<any[]> {
    const db = this.getDatabase(collection);
    
    try {
      // Crear índices si no existen
      await db.createIndex({
        index: { fields: Object.keys(query.selector || {}) }
      });
      
      const result = await db.find(query);
      
      return result.docs.map((doc: any) => {
        const { _id, _rev, ...data } = doc;
        return { id: _id, ...data };
      });
    } catch (error) {
      console.error(`Error finding documents in ${collection}:`, error);
      throw error;
    }
  }
}

// Crear una instancia única
const dbService = new DatabaseService();

export default dbService;