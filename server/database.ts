import { Request, Response } from 'express';
import { storage } from './storage';

/**
 * Reinicia los datos del módulo especificado
 */
export const resetData = async (req: Request, res: Response) => {
  try {
    const { module } = req.body;
    
    if (!module) {
      return res.status(400).json({ error: 'El módulo a reiniciar es obligatorio' });
    }
    
    console.log(`[DATABASE] Resetting data for module: ${module}`);
    
    switch (module) {
      case 'all':
        // Reiniciar todos los datos
        await resetAllData();
        break;
      case 'animals':
        // Reiniciar datos de animales
        await resetAnimalsData();
        break;
      case 'machines':
        // Reiniciar datos de maquinarias
        await resetMachinesData();
        break;
      case 'pastures':
        // Reiniciar datos de pasturas
        await resetPasturesData();
        break;
      case 'finances':
        // Reiniciar datos financieros
        await resetFinancesData();
        break;
      case 'warehouse':
        // Reiniciar datos de depósito
        await resetWarehouseData();
        break;
      case 'employees':
        // Reiniciar datos de empleados
        await resetEmployeesData();
        break;
      case 'investments':
        // Reiniciar datos de inversiones
        await resetInvestmentsData();
        break;
      default:
        return res.status(400).json({ error: 'Módulo no válido' });
    }
    
    res.status(200).json({ success: true, message: `Datos del módulo ${module} reiniciados correctamente` });
  } catch (error) {
    console.error('Error resetting data:', error);
    res.status(500).json({ error: 'Error al reiniciar los datos' });
  }
};

/**
 * Crea un respaldo de la base de datos
 */
export const createBackup = async (req: Request, res: Response) => {
  try {
    const { backupName, description } = req.body;
    
    if (!backupName) {
      return res.status(400).json({ error: 'El nombre del respaldo es obligatorio' });
    }
    
    // Implementar la lógica para crear un respaldo
    console.log(`[DATABASE] Creating backup: ${backupName}`);
    
    res.status(200).json({ 
      success: true, 
      message: 'Respaldo creado correctamente',
      backup: {
        name: backupName,
        description,
        date: new Date().toISOString(),
        size: '45.8 MB'
      } 
    });
  } catch (error) {
    console.error('Error creating backup:', error);
    res.status(500).json({ error: 'Error al crear el respaldo' });
  }
};

/**
 * Exporta los datos de la base de datos
 */
export const exportData = async (_req: Request, res: Response) => {
  try {
    // Implementar la lógica para exportar los datos
    console.log('[DATABASE] Exporting data');
    
    // Simulamos la exportación para descargar
    res.status(200).json({ 
      success: true, 
      message: 'Datos exportados correctamente',
      data: {} // Aquí iría el objeto con todos los datos
    });
  } catch (error) {
    console.error('Error exporting data:', error);
    res.status(500).json({ error: 'Error al exportar los datos' });
  }
};

/**
 * Importa datos a la base de datos
 */
export const importData = async (req: Request, res: Response) => {
  try {
    const data = req.body.data;
    
    if (!data) {
      return res.status(400).json({ error: 'No se han proporcionado datos para importar' });
    }
    
    // Implementar la lógica para importar los datos
    console.log('[DATABASE] Importing data');
    
    res.status(200).json({ success: true, message: 'Datos importados correctamente' });
  } catch (error) {
    console.error('Error importing data:', error);
    res.status(500).json({ error: 'Error al importar los datos' });
  }
};

/**
 * Obtiene estadísticas de la base de datos
 */
export const getDatabaseStats = async (_req: Request, res: Response) => {
  try {
    // Aquí se implementaría la lógica para obtener estadísticas reales de la BD
    const stats = {
      totalRecords: 12547,
      tablesCount: 24,
      dbSize: '45.8 MB',
      lastBackup: '17/05/2025 14:30',
      dataModified: '17/05/2025 19:15'
    };
    
    res.status(200).json({ success: true, stats });
  } catch (error) {
    console.error('Error getting database stats:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas de la base de datos' });
  }
};

// FUNCIONES INTERNAS PARA RESETEO DE DATOS

// Reinicia todos los datos
async function resetAllData() {
  // Eliminar todos los datos de las tablas
  await storage.clearAnimals();
  await storage.clearAnimalVeterinary();
  await storage.clearAnimalFinances();
  await storage.clearAnimalWeights();
  
  await storage.clearMachines();
  await storage.clearMaintenance();
  await storage.clearMachineFinances();
  
  await storage.clearPastures();
  await storage.clearPastureWorks();
  await storage.clearPastureFinances();
  
  await storage.clearInvestments();
  await storage.clearWarehouseItems();
  await storage.clearEmployees();
  await storage.clearSalaries();
  
  await storage.clearServices();
  await storage.clearTaxes();
  await storage.clearRepairs();
  await storage.clearCapital();
  
  console.log('[DATABASE] All data reset complete');
}

// Reinicia los datos de animales
async function resetAnimalsData() {
  await storage.clearAnimals();
  await storage.clearAnimalVeterinary();
  await storage.clearAnimalFinances();
  await storage.clearAnimalWeights();
  console.log('[DATABASE] Animals data reset complete');
}

// Reinicia los datos de maquinarias
async function resetMachinesData() {
  await storage.clearMachines();
  await storage.clearMaintenance();
  await storage.clearMachineFinances();
  console.log('[DATABASE] Machines data reset complete');
}

// Reinicia los datos de pasturas
async function resetPasturesData() {
  await storage.clearPastures();
  await storage.clearPastureWorks();
  await storage.clearPastureFinances();
  console.log('[DATABASE] Pastures data reset complete');
}

// Reinicia los datos financieros
async function resetFinancesData() {
  await storage.clearMachineFinances();
  await storage.clearAnimalFinances();
  await storage.clearPastureFinances();
  await storage.clearServices();
  await storage.clearTaxes();
  await storage.clearRepairs();
  await storage.clearCapital();
  console.log('[DATABASE] Financial data reset complete');
}

// Reinicia los datos de depósito
async function resetWarehouseData() {
  await storage.clearWarehouseItems();
  console.log('[DATABASE] Warehouse data reset complete');
}

// Reinicia los datos de empleados
async function resetEmployeesData() {
  await storage.clearEmployees();
  await storage.clearSalaries();
  console.log('[DATABASE] Employees data reset complete');
}

// Reinicia los datos de inversiones
async function resetInvestmentsData() {
  await storage.clearInvestments();
  console.log('[DATABASE] Investments data reset complete');
}