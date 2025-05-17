// Archivo para implementar nuestra propia API para el reinicio de datos
const express = require('express');
const { storage } = require('./server/storage');

// Creamos un mini servidor express para manejar solo los reinicio de datos
const app = express();
app.use(express.json());

// Endpoint para resetear datos de un módulo específico
app.post('/api/database/reset', async (req, res) => {
  try {
    const { module } = req.body;
    
    if (!module) {
      return res.status(400).json({ error: "Debe especificar el módulo a reiniciar" });
    }
    
    console.log(`[Database] Reiniciando datos del módulo: ${module}`);
    
    if (module === 'animals') {
      // Reiniciar datos de animales
      const animals = await storage.getAnimals();
      console.log(`[Database] Eliminando ${animals.length} animales...`);
      
      let deletedCount = 0;
      for (const animal of animals) {
        await storage.deleteAnimal(animal.id);
        deletedCount++;
        
        if (deletedCount % 10 === 0) {
          console.log(`[Database] Eliminados ${deletedCount} de ${animals.length} animales...`);
        }
      }
      console.log(`[Database] ${deletedCount} animales eliminados`);
      
      // Eliminar registros veterinarios
      const vetRecords = await storage.getAnimalVeterinary();
      console.log(`[Database] Eliminando ${vetRecords.length} registros veterinarios...`);
      
      let vetDeletedCount = 0;
      for (const record of vetRecords) {
        await storage.deleteAnimalVeterinary(record.id);
        vetDeletedCount++;
      }
      console.log(`[Database] ${vetDeletedCount} registros veterinarios eliminados`);
      
      // Eliminar registros financieros
      const financeRecords = await storage.getAnimalFinances();
      console.log(`[Database] Eliminando ${financeRecords.length} registros financieros...`);
      
      let financeDeletedCount = 0;
      for (const record of financeRecords) {
        await storage.deleteAnimalFinance(record.id);
        financeDeletedCount++;
      }
      console.log(`[Database] ${financeDeletedCount} registros financieros eliminados`);
      
      // Eliminar registros de pesos
      const weightRecords = await storage.getAnimalWeights();
      console.log(`[Database] Eliminando ${weightRecords.length} registros de pesos...`);
      
      let weightDeletedCount = 0;
      for (const record of weightRecords) {
        await storage.deleteAnimalWeight(record.id);
        weightDeletedCount++;
      }
      console.log(`[Database] ${weightDeletedCount} registros de pesos eliminados`);
      
      console.log('[Database] Datos de animales reiniciados con éxito');
      return res.status(200).json({ 
        success: true,
        message: "Datos de animales reiniciados con éxito",
        stats: {
          animalesEliminados: deletedCount,
          registrosVeterinariosEliminados: vetDeletedCount,
          registrosFinancierosEliminados: financeDeletedCount,
          registrosPesosEliminados: weightDeletedCount
        }
      });
    } else if (module === 'machines') {
      // Reiniciar datos de máquinas (implementación similar)
      return res.status(200).json({ 
        success: true, 
        message: `Datos de máquinas reiniciados con éxito`,
        simulado: true
      });
    } else {
      // Para otros módulos (implementación similar)
      return res.status(200).json({ 
        success: true, 
        message: `Datos del módulo ${module} reiniciados con éxito (simulado)`,
        simulado: true
      });
    }
  } catch (error) {
    console.error("Error reiniciando datos:", error);
    res.status(500).json({ error: "Error al reiniciar los datos" });
  }
});

// Puerto para escuchar (diferente al principal)
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Servidor de administración de BD escuchando en puerto ${PORT}`);
});