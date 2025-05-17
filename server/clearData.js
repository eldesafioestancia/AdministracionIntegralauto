const { storage } = require('./storage');

/**
 * Script para limpiar datos del sistema
 * Lo ejecutaremos directamente para probar la funcionalidad
 */
async function resetAllData() {
  try {
    // Eliminamos todos los datos de animales
    console.log('Limpiando datos de animales...');
    const animals = await storage.getAnimals();
    for (const animal of animals) {
      await storage.deleteAnimal(animal.id);
    }
    console.log(`${animals.length} animales eliminados.`);
    
    // Limpiamos datos veterinarios
    console.log('Limpiando datos veterinarios...');
    const vetRecords = await storage.getAnimalVeterinary();
    for (const record of vetRecords) {
      await storage.deleteAnimalVeterinary(record.id);
    }
    console.log(`${vetRecords.length} registros veterinarios eliminados.`);
    
    // Limpiamos registros financieros de animales
    console.log('Limpiando registros financieros de animales...');
    const animalFinances = await storage.getAnimalFinances();
    for (const finance of animalFinances) {
      await storage.deleteAnimalFinance(finance.id);
    }
    console.log(`${animalFinances.length} registros financieros de animales eliminados.`);
    
    // Limpiamos registros de pesos
    console.log('Limpiando registros de pesos...');
    const weights = await storage.getAnimalWeights();
    for (const weight of weights) {
      await storage.deleteAnimalWeight(weight.id);
    }
    console.log(`${weights.length} registros de pesos eliminados.`);
    
    console.log('¡DATOS REINICIADOS EXITOSAMENTE!');
  } catch (error) {
    console.error('Error al reiniciar los datos:', error);
  }
}

// Ejecutar la función
resetAllData();