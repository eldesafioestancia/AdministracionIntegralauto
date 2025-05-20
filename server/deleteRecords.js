/**
 * Utilidad para mantener registros de elementos eliminados entre sesiones
 * Este archivo guarda IDs de elementos eliminados en un archivo JSON para 
 * que no vuelvan a aparecer cuando se reinicia el servidor
 */

const fs = require('fs');
const path = require('path');

const deletedRecordsPath = path.join(process.cwd(), 'deleted_records.json');

// Estructura para mantener los registros eliminados
const defaultDeletedRecords = {
  machines: [],
  animals: [],
  pastures: []
};

/**
 * Carga los registros de elementos eliminados
 */
function loadDeletedRecords() {
  try {
    if (fs.existsSync(deletedRecordsPath)) {
      const data = fs.readFileSync(deletedRecordsPath, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('[DeleteRecords] Error al cargar registros eliminados:', err);
  }

  // Si no existe o hay error, crear nuevo archivo
  saveDeletedRecords(defaultDeletedRecords);
  return defaultDeletedRecords;
}

/**
 * Guarda los registros de elementos eliminados
 */
function saveDeletedRecords(records) {
  try {
    fs.writeFileSync(deletedRecordsPath, JSON.stringify(records, null, 2), 'utf8');
  } catch (err) {
    console.error('[DeleteRecords] Error al guardar registros eliminados:', err);
  }
}

/**
 * Añade un ID a la lista de registros eliminados
 */
function addDeletedRecord(type, id) {
  const records = loadDeletedRecords();
  
  if (!records[type]) {
    console.error(`[DeleteRecords] Tipo desconocido: ${type}`);
    return;
  }
  
  // Verificar si el ID ya existe en la lista
  if (!records[type].includes(id)) {
    records[type].push(id);
    saveDeletedRecords(records);
    console.log(`[DeleteRecords] Añadido registro eliminado: ${type} ID ${id}`);
  }
}

/**
 * Verifica si un ID está en la lista de registros eliminados
 */
function isDeleted(type, id) {
  const records = loadDeletedRecords();
  return records[type]?.includes(id) || false;
}

/**
 * Obtiene todos los IDs eliminados de un tipo específico
 */
function getDeletedIds(type) {
  const records = loadDeletedRecords();
  return records[type] || [];
}

/**
 * Elimina IDs que ya no existen en el sistema
 */
function cleanupDeletedRecords(type, existingIds) {
  const records = loadDeletedRecords();
  if (!records[type]) return;
  
  // Mantener solo IDs que existen en el sistema
  records[type] = records[type].filter(id => existingIds.includes(id));
  saveDeletedRecords(records);
}

module.exports = {
  addDeletedRecord,
  isDeleted,
  getDeletedIds,
  cleanupDeletedRecords
};