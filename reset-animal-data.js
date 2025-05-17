// Script para reiniciar datos de animales

const { storage } = require('./server/storage');

async function resetAnimalData() {
  try {
    console.log('Iniciando eliminación de datos de animales...');

    // Obtener y eliminar todos los animales
    const animals = await storage.getAnimals();
    console.log(`Se encontraron ${animals.length} animales para eliminar`);
    
    let animalCount = 0;
    for (const animal of animals) {
      await storage.deleteAnimal(animal.id);
      animalCount++;
      
      if (animalCount % 10 === 0) {
        console.log(`Eliminados ${animalCount} animales de ${animals.length}`);
      }
    }
    console.log(`✅ Se eliminaron ${animalCount} animales con éxito`);

    // Obtener y eliminar todos los registros veterinarios
    const vetRecords = await storage.getAnimalVeterinary();
    console.log(`Se encontraron ${vetRecords.length} registros veterinarios para eliminar`);
    
    let vetCount = 0;
    for (const record of vetRecords) {
      await storage.deleteAnimalVeterinary(record.id);
      vetCount++;
    }
    console.log(`✅ Se eliminaron ${vetCount} registros veterinarios con éxito`);

    // Obtener y eliminar todos los registros financieros de animales
    const financeRecords = await storage.getAnimalFinances();
    console.log(`Se encontraron ${financeRecords.length} registros financieros para eliminar`);
    
    let financeCount = 0;
    for (const record of financeRecords) {
      await storage.deleteAnimalFinance(record.id);
      financeCount++;
    }
    console.log(`✅ Se eliminaron ${financeCount} registros financieros con éxito`);

    // Obtener y eliminar todos los registros de pesos
    const weightRecords = await storage.getAnimalWeights();
    console.log(`Se encontraron ${weightRecords.length} registros de pesos para eliminar`);
    
    let weightCount = 0;
    for (const record of weightRecords) {
      await storage.deleteAnimalWeight(record.id);
      weightCount++;
    }
    console.log(`✅ Se eliminaron ${weightCount} registros de pesos con éxito`);

    console.log('====================================');
    console.log('REINICIO DE DATOS DE ANIMALES COMPLETADO:');
    console.log(`✅ Animales: ${animalCount}`);
    console.log(`✅ Registros veterinarios: ${vetCount}`);
    console.log(`✅ Registros financieros: ${financeCount}`);
    console.log(`✅ Registros de pesos: ${weightCount}`);
    console.log('====================================');

    return {
      success: true,
      animalsDeleted: animalCount,
      vetRecordsDeleted: vetCount,
      financeRecordsDeleted: financeCount,
      weightRecordsDeleted: weightCount
    };
  } catch (error) {
    console.error('❌ ERROR al reiniciar datos de animales:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Ejecutar el script directamente
resetAnimalData()
  .then(result => {
    if (result.success) {
      console.log('El script de reinicio de datos terminó exitosamente');
    } else {
      console.log('El script de reinicio de datos falló:', result.error);
    }
  })
  .catch(err => {
    console.error('Error inesperado:', err);
  });