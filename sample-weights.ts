import { storage } from "./server/storage";

async function loadSampleWeights() {
  try {
    console.log("[Sample Weights] Iniciando carga de datos de muestra para pesos de animales");
    
    // Obtener 10 animales aleatorios para agregarles datos de peso
    const animals = await storage.getAnimals();
    
    // Si no hay animales, no podemos agregar pesos
    if (!animals.length) {
      console.log("[Sample Weights] No hay animales en el sistema para agregar pesos");
      return;
    }
    
    // Seleccionar 10 animales al azar (o menos si no hay suficientes)
    const sampleSize = Math.min(10, animals.length);
    const selectedAnimals: any[] = [];
    
    // Copia del array para poder modificarlo
    const animalsCopy = [...animals];
    
    // Seleccionar animales aleatorios
    for (let i = 0; i < sampleSize; i++) {
      const randomIndex = Math.floor(Math.random() * animalsCopy.length);
      selectedAnimals.push(animalsCopy[randomIndex]);
      animalsCopy.splice(randomIndex, 1);
    }
    
    // Para cada animal seleccionado, crear varios registros de peso
    for (const animal of selectedAnimals) {
      console.log(`[Sample Weights] Agregando pesos para animal ID: ${animal.id}`);
      
      // Fecha base: entre 6 y 12 meses atrás
      const startMonths = Math.floor(Math.random() * 6) + 6;
      const baseDate = new Date();
      baseDate.setMonth(baseDate.getMonth() - startMonths);
      
      // Peso base: entre 250 y 500 kg dependiendo de la categoría
      let baseWeight = 0;
      switch (animal.category) {
        case "vaca":
        case "toro":
          baseWeight = 350 + Math.floor(Math.random() * 150); // 350-500kg
          break;
        case "vaquillona":
        case "novillo":
          baseWeight = 300 + Math.floor(Math.random() * 100); // 300-400kg
          break;
        case "ternero":
        case "ternera":
          baseWeight = 150 + Math.floor(Math.random() * 100); // 150-250kg
          break;
        default:
          baseWeight = 250 + Math.floor(Math.random() * 250); // 250-500kg
      }
      
      // Crear entre 5 y 10 registros de peso
      const numRecords = Math.floor(Math.random() * 6) + 5; // 5-10 registros
      
      for (let i = 0; i < numRecords; i++) {
        // Cada registro está separado entre 15 y 45 días del anterior
        const daysOffset = (i * (Math.floor(Math.random() * 30) + 15));
        const recordDate = new Date(baseDate);
        recordDate.setDate(baseDate.getDate() + daysOffset);
        
        // El peso aumenta gradualmente con variaciones aleatorias
        // Aumento entre 0.5 y 1.5 kg por día
        const weightIncrease = daysOffset * (0.5 + Math.random());
        const weightWithVariation = baseWeight + weightIncrease + (Math.random() * 10 - 5); // Variación de ±5kg
        const finalWeight = Math.round(weightWithVariation * 10) / 10; // Redondear a 1 decimal
        
        // Crear el registro
        const weightRecord = {
          animalId: animal.id,
          date: recordDate,
          weight: finalWeight.toString(),
          notes: `Control de peso periódico #${i+1}` as string | null
        };
        
        await storage.createAnimalWeight(weightRecord);
        console.log(`[Sample Weights] Registro creado: Animal ${animal.id}, Fecha ${recordDate.toISOString().split('T')[0]}, Peso ${finalWeight}kg`);
      }
      
      // Obtener el último peso registrado (el más reciente)
      const lastRecordDate = new Date(baseDate);
      lastRecordDate.setDate(baseDate.getDate() + ((numRecords - 1) * (Math.floor(Math.random() * 30) + 15)));
      const weightIncrease = ((numRecords - 1) * (Math.floor(Math.random() * 30) + 15)) * (0.5 + Math.random());
      const lastWeightWithVariation = baseWeight + weightIncrease + (Math.random() * 10 - 5);
      const lastWeight = Math.round(lastWeightWithVariation * 10) / 10;
      
      // Actualizar el peso actual del animal con el último peso registrado
      await storage.updateAnimal(animal.id, {
        currentWeight: lastWeight.toString(),
        lastWeightDate: lastRecordDate
      });
    }
    
    console.log("[Sample Weights] Datos de muestra para pesos cargados exitosamente");
  } catch (error) {
    console.error("[Sample Weights] Error al cargar datos de muestra para pesos:", error);
  }
}

loadSampleWeights();