/**
 * Sistema de prevención de recarga de elementos eliminados
 * 
 * Este módulo se encarga de filtrar los elementos eliminados
 * para que no vuelvan a cargarse cuando se reinicia la aplicación
 */

import fs from 'fs';
import path from 'path';

// Ruta al archivo de elementos eliminados
const deletedRecordsPath = path.join(process.cwd(), 'deleted_records.json');

// Estructura para los registros eliminados
interface DeletedRecords {
  machines: number[];
  animals: number[];
  pastures: number[];
  [key: string]: number[];
}

// Obtener los registros de elementos eliminados
export function getDeletedRecords(): DeletedRecords {
  if (!fs.existsSync(deletedRecordsPath)) {
    return { machines: [], animals: [], pastures: [] };
  }
  
  try {
    const data = fs.readFileSync(deletedRecordsPath, 'utf-8');
    return JSON.parse(data) as DeletedRecords;
  } catch (error) {
    console.error('[Error] No se pudo leer el archivo de registros eliminados:', error);
    return { machines: [], animals: [], pastures: [] };
  }
}

// Verificar si un elemento está en la lista de eliminados
export function isItemDeleted(type: string, id: number): boolean {
  const records = getDeletedRecords();
  if (!records[type]) {
    return false;
  }
  return records[type].includes(id);
}

// Agregar un elemento a la lista de eliminados
export function addToDeletedRecords(type: string, id: number): void {
  const records = getDeletedRecords();
  
  // Crear la categoría si no existe
  if (!records[type]) {
    records[type] = [];
  }
  
  // Agregar el ID si no está ya en la lista
  if (!records[type].includes(id)) {
    records[type].push(id);
    
    // Guardar los cambios
    fs.writeFileSync(deletedRecordsPath, JSON.stringify(records, null, 2), 'utf-8');
  }
}

// Filtrar una lista de elementos para excluir los eliminados
export function filterDeletedItems<T extends { id: number }>(type: string, items: T[]): T[] {
  const records = getDeletedRecords();
  
  if (!records[type] || records[type].length === 0) {
    return items;
  }
  
  return items.filter(item => !records[type].includes(item.id));
}