import { Request, Response } from 'express';
import { storage } from './storage';

/**
 * Endpoint para reiniciar los datos de animales
 */
export async function resetAnimals(req: Request, res: Response) {
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

    return res.status(200).json({
      success: true,
      message: 'Todos los datos de animales han sido reiniciados correctamente',
      stats: {
        animalesEliminados: animalCount,
        registrosVeterinariosEliminados: vetCount,
        registrosFinancierosEliminados: financeCount,
        registrosPesosEliminados: weightCount
      }
    });
  } catch (error) {
    console.error('❌ ERROR al reiniciar datos de animales:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al reiniciar los datos de animales',
      error: (error as Error).message
    });
  }
}