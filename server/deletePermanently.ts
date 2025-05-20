/**
 * Módulo para manejar eliminaciones permanentes
 * Este módulo se encarga de mantener un registro de los elementos eliminados
 * para evitar que vuelvan a aparecer si se reinicia la aplicación
 */

import fs from 'fs';
import path from 'path';
import { storage } from './storage';
import { Request, Response } from 'express';

// Ruta al archivo que almacena el registro de eliminaciones
const deletedRecordsFile = path.join(process.cwd(), 'deleted_records.json');

// Estructura para el registro de eliminaciones
interface DeletedRecords {
  machines: number[];
  animals: number[];
  pastures: number[];
  [key: string]: number[];
}

// Inicializar archivo si no existe
function initializeDeletedRecords(): DeletedRecords {
  if (!fs.existsSync(deletedRecordsFile)) {
    const initialData: DeletedRecords = {
      machines: [],
      animals: [],
      pastures: []
    };
    
    fs.writeFileSync(deletedRecordsFile, JSON.stringify(initialData, null, 2));
    return initialData;
  }
  
  try {
    const data = fs.readFileSync(deletedRecordsFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error al leer el archivo de registros eliminados:', error);
    return { machines: [], animals: [], pastures: [] };
  }
}

// Cargar registros eliminados
let deletedRecords = initializeDeletedRecords();

// Guardar un registro de eliminación
function saveDeletedRecord(type: string, id: number) {
  try {
    if (!deletedRecords[type]) {
      deletedRecords[type] = [];
    }
    
    if (!deletedRecords[type].includes(id)) {
      deletedRecords[type].push(id);
      fs.writeFileSync(deletedRecordsFile, JSON.stringify(deletedRecords, null, 2));
      console.log(`[Eliminación permanente] ${type} con ID ${id} registrado para eliminación permanente`);
    }
  } catch (error) {
    console.error(`Error al guardar registro de eliminación para ${type} id ${id}:`, error);
  }
}

// Función para eliminar un elemento de forma permanente
export async function deletePermanently(req: Request, res: Response) {
  const { type, id } = req.params;
  
  if (!id || !type) {
    return res.status(400).json({ error: 'Se requiere un ID y tipo válidos' });
  }
  
  try {
    // Primero realizar la eliminación normal dependiendo del tipo
    switch (type) {
      case 'machines':
        await storage.deleteMachine(parseInt(id));
        break;
      case 'animals':
        await storage.deleteAnimal(parseInt(id));
        break;
      case 'pastures':
        await storage.deletePasture(parseInt(id));
        break;
      default:
        return res.status(400).json({ error: 'Tipo no soportado para eliminación permanente' });
    }
    
    // Registrar la eliminación para que sea permanente
    saveDeletedRecord(type, parseInt(id));
    
    return res.status(200).json({ success: true, message: `${type} con ID ${id} eliminado permanentemente` });
  } catch (error) {
    console.error(`Error al eliminar permanentemente ${type} id ${id}:`, error);
    return res.status(500).json({ error: 'Error al procesar la eliminación permanente' });
  }
}

// Eliminar elementos que han sido marcados como eliminados permanentemente
export async function applyPermanentDeletions() {
  console.log('[Eliminación permanente] Aplicando eliminaciones permanentes...');
  
  try {
    // Eliminar máquinas
    for (const id of deletedRecords.machines) {
      try {
        await storage.deleteMachine(id);
        console.log(`[Eliminación permanente] Máquina ID ${id} eliminada durante inicialización`);
      } catch (error) {
        // Ignorar errores si la máquina ya no existe
      }
    }
    
    // Eliminar animales
    for (const id of deletedRecords.animals) {
      try {
        await storage.deleteAnimal(id);
        console.log(`[Eliminación permanente] Animal ID ${id} eliminado durante inicialización`);
      } catch (error) {
        // Ignorar errores si el animal ya no existe
      }
    }
    
    // Eliminar pasturas
    for (const id of deletedRecords.pastures) {
      try {
        await storage.deletePasture(id);
        console.log(`[Eliminación permanente] Pastura ID ${id} eliminada durante inicialización`);
      } catch (error) {
        // Ignorar errores si la pastura ya no existe
      }
    }
    
    console.log('[Eliminación permanente] Proceso de eliminación permanente finalizado');
  } catch (error) {
    console.error('[Eliminación permanente] Error durante la aplicación de eliminaciones permanentes:', error);
  }
}

// Obtener la lista de registros eliminados
export function getDeletedRecords(req: Request, res: Response) {
  res.status(200).json(deletedRecords);
}

// Función para añadir un registro de eliminación manualmente
export function addDeletedRecord(req: Request, res: Response) {
  const { type, id } = req.body;
  
  if (!id || !type) {
    return res.status(400).json({ error: 'Se requiere un ID y tipo válidos' });
  }
  
  saveDeletedRecord(type, parseInt(id));
  return res.status(200).json({ success: true, message: `${type} con ID ${id} marcado para eliminación permanente` });
}