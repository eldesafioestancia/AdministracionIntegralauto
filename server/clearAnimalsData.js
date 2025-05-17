const { storage } = require('./storage');

/**
 * Script para limpiar datos de animales específicamente
 */
async function clearAnimalsData() {
  try {
    // Obtener todos los animales
    const animals = await storage.getAnimals();
    console.log(`Encontrados ${animals.length} animales para eliminar...`);
    
    // Eliminar cada animal uno por uno
    let deletedCount = 0;
    for (const animal of animals) {
      await storage.deleteAnimal(animal.id);
      deletedCount++;
      if (deletedCount % 10 === 0) {
        console.log(`Eliminados ${deletedCount} animales de ${animals.length}...`);
      }
    }
    
    console.log(`Eliminación completada. ${deletedCount} animales han sido eliminados.`);
    
    // Eliminar registros veterinarios
    const vetRecords = await storage.getAnimalVeterinary();
    console.log(`Encontrados ${vetRecords.length} registros veterinarios para eliminar...`);
    
    let vetDeletedCount = 0;
    for (const record of vetRecords) {
      await storage.deleteAnimalVeterinary(record.id);
      vetDeletedCount++;
    }
    
    console.log(`Eliminados ${vetDeletedCount} registros veterinarios.`);
    
    // Eliminar registros financieros
    const financeRecords = await storage.getAnimalFinances();
    console.log(`Encontrados ${financeRecords.length} registros financieros para eliminar...`);
    
    let financeDeletedCount = 0;
    for (const record of financeRecords) {
      await storage.deleteAnimalFinance(record.id);
      financeDeletedCount++;
    }
    
    console.log(`Eliminados ${financeDeletedCount} registros financieros.`);
    
    // Eliminar registros de peso
    const weightRecords = await storage.getAnimalWeights();
    console.log(`Encontrados ${weightRecords.length} registros de peso para eliminar...`);
    
    let weightDeletedCount = 0;
    for (const record of weightRecords) {
      await storage.deleteAnimalWeight(record.id);
      weightDeletedCount++;
    }
    
    console.log(`Eliminados ${weightDeletedCount} registros de peso.`);
    
    console.log('¡REINICIO DE DATOS DE ANIMALES COMPLETADO CON ÉXITO!');
  } catch (error) {
    console.error('Error al limpiar datos de animales:', error);
  }
}

// Ejecutar la función
clearAnimalsData();