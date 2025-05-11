import { QueryClient, QueryFunction } from "@tanstack/react-query";
import dbService from './db';

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Función para extraer el tipo de colección y operación de la URL
function parseApiUrl(url: string): { collection: string | null; operation: string | null } {
  const regex = /\/api\/([a-zA-Z-]+)(?:\/([a-zA-Z0-9-]+))?/;
  const match = url.match(regex);
  
  if (!match) return { collection: null, operation: null };
  
  // El primer grupo capturado es la colección
  let collection = match[1];
  let operation = match[2] || null;
  
  // Mapear nombres de API a nombres de colecciones
  const collectionMap: { [key: string]: string } = {
    'machines': 'machines',
    'animals': 'animals',
    'pastures': 'pastures',
    'pasture-works': 'pastureWorks',
    'maintenance': 'maintenance',
    'investments': 'investments',
    'capital': 'capital',
    'employees': 'employees'
  };
  
  return { 
    collection: collectionMap[collection] || null,
    operation
  };
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Intentar primero la solicitud online
  try {
    if (navigator.onLine) {
      const res = await fetch(url, {
        method,
        headers: data ? { "Content-Type": "application/json" } : {},
        body: data ? JSON.stringify(data) : undefined,
        credentials: "include",
      });
      
      await throwIfResNotOk(res);
      return res;
    }
  } catch (error) {
    console.log('Error en solicitud online, usando almacenamiento local:', error);
  }
  
  // Fallback a almacenamiento local si estamos offline o hubo un error
  console.log(`Modo offline: usando almacenamiento local para ${method} ${url}`);
  
  // Extraer información de la URL
  const { collection, operation } = parseApiUrl(url);
  
  if (!collection) {
    throw new Error(`No se pudo determinar la colección para ${url}`);
  }
  
  let response: any;
  
  // Manejar diferentes métodos HTTP utilizando el almacenamiento local
  try {
    if (method === 'GET') {
      if (operation && !isNaN(Number(operation))) {
        // GET por ID
        response = await dbService.getDocumentById(collection as any, operation);
      } else {
        // GET todos los documentos
        response = await dbService.getAllDocuments(collection as any);
      }
    } else if (method === 'POST') {
      // Crear nuevo documento
      response = await dbService.createDocument(collection as any, data);
    } else if (method === 'PUT' && operation) {
      // Actualizar documento existente
      response = await dbService.updateDocument(collection as any, operation, data);
    } else if (method === 'DELETE' && operation) {
      // Eliminar documento
      await dbService.deleteDocument(collection as any, operation);
      response = { success: true, id: operation };
    }
    
    // Crear una Response simulada para mantener la compatibilidad de la interfaz
    const blob = new Blob([JSON.stringify(response)], { type: 'application/json' });
    const mockResponse = new Response(blob, { status: 200, statusText: 'OK' });
    return mockResponse;
  } catch (error) {
    console.error('Error en operación de base de datos local:', error);
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    try {
      // Primero intentamos con la API en línea
      if (navigator.onLine) {
        try {
          const res = await fetch(queryKey[0] as string, {
            credentials: "include",
          });

          if (unauthorizedBehavior === "returnNull" && res.status === 401) {
            return null;
          }

          await throwIfResNotOk(res);
          return await res.json();
        } catch (onlineError) {
          console.log('Error en solicitud online, cambiando a modo offline:', onlineError);
          // Si hay un error, pasamos al modo offline
        }
      }
      
      // Modo offline - usar base de datos local
      console.log(`Modo offline: obteniendo datos locales para ${queryKey[0]}`);
      const { collection, operation } = parseApiUrl(queryKey[0] as string);
      
      if (!collection) {
        throw new Error(`No se pudo determinar la colección para ${queryKey[0]}`);
      }
      
      let response: any;
      
      if (operation && !isNaN(Number(operation))) {
        // Consulta por ID
        response = await dbService.getDocumentById(collection as any, operation);
      } else {
        // Consulta de todos los documentos
        response = await dbService.getAllDocuments(collection as any);
      }
      
      return response;
    } catch (error) {
      console.error('Error al obtener datos offline:', error);
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
