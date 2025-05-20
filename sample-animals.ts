import { storage } from "./server/storage";
import fs from 'fs';
import path from 'path';

// Función para obtener IDs de animales eliminados
function getDeletedAnimalIds(): number[] {
  try {
    const deletedRecordsPath = path.join(process.cwd(), 'deleted_records.json');
    if (fs.existsSync(deletedRecordsPath)) {
      const deletedRecords = JSON.parse(fs.readFileSync(deletedRecordsPath, 'utf-8'));
      return deletedRecords.animals || [];
    }
  } catch (error) {
    console.error('[Error] No se pudo leer el archivo de animales eliminados:', error);
  }
  return [];
}

async function seedAnimals() {
  try {
    // Cargar lista de IDs eliminados
    const deletedAnimalIds = getDeletedAnimalIds();
    console.log(`[Sample Data] Se encontraron ${deletedAnimalIds.length} animales eliminados que no serán recreados`);
    
    console.log("[Sample Data] Iniciando carga de datos de ejemplo para animales...");

    // Crear animales de ejemplo
    const animal1 = await storage.createAnimal({
      cartagena: "A123",
      cartagenaColor: "amarillo",
      cartagenaSecondaryColor: "rojo",
      category: "vaca",
      race: "angus",
      birthDate: new Date("2021-08-15"),
      reproductiveStatus: "prenada",
      origin: "nacido_establecimiento",
      marks: "Mancha blanca en pata trasera derecha",
      currentWeight: "450",
      lastWeightDate: new Date("2023-09-01"),
      bodyCondition: "4",
      lastServiceDate: new Date("2023-08-10"),
      lastServiceType: "Inseminación artificial",
      expectedDeliveryDate: new Date("2024-05-25"),
    });

    console.log(`Animal 1 creado: ${animal1.cartagena} - ${animal1.category} (ID: ${animal1.id})`);

    const animal2 = await storage.createAnimal({
      cartagena: "T045",
      cartagenaColor: "verde",
      category: "toro",
      race: "hereford",
      birthDate: new Date("2020-03-10"),
      reproductiveStatus: "toro_en_servicio",
      origin: "comprado",
      supplier: "Cabaña Los Alamos",
      purchaseDate: new Date("2021-05-20"),
      marks: "Ninguna marca distintiva",
      currentWeight: "850",
      lastWeightDate: new Date("2023-08-15"),
      bodyCondition: "5",
    });

    console.log(`Animal 2 creado: ${animal2.cartagena} - ${animal2.category} (ID: ${animal2.id})`);

    const animal3 = await storage.createAnimal({
      cartagena: "N078",
      cartagenaColor: "blanco",
      cartagenaSecondaryColor: "azul",
      category: "novillo",
      race: "braford",
      birthDate: new Date("2022-04-18"),
      origin: "nacido_establecimiento",
      motherId: animal1.id,
      marks: "Marca en oreja izquierda",
      currentWeight: "320",
      lastWeightDate: new Date("2023-07-10"),
      bodyCondition: "3",
    });

    console.log(`Animal 3 creado: ${animal3.cartagena} - ${animal3.category} (ID: ${animal3.id})`);

    // Crear registros veterinarios
    const vet1 = await storage.createAnimalVeterinary({
      animalId: animal1.id,
      date: new Date("2023-08-10"),
      type: "insemination",
      description: "Inseminación artificial con semen de toro Angus premium",
    });

    console.log(`Registro veterinario 1 creado: ${vet1.type} (ID: ${vet1.id})`);

    const vet2 = await storage.createAnimalVeterinary({
      animalId: animal1.id,
      date: new Date("2023-09-15"),
      type: "check",
      description: "Control de preñez. Confirmación positiva.",
    });

    console.log(`Registro veterinario 2 creado: ${vet2.type} (ID: ${vet2.id})`);

    const vet3 = await storage.createAnimalVeterinary({
      animalId: animal2.id,
      date: new Date("2023-07-05"),
      type: "visit",
      description: "Visita veterinaria de rutina. Sin problemas detectados.",
    });

    console.log(`Registro veterinario 3 creado: ${vet3.type} (ID: ${vet3.id})`);

    // Crear registros financieros
    const animalFinance1 = await storage.createAnimalFinance({
      animalId: animal1.id,
      date: new Date("2023-08-10"),
      type: "expense",
      concept: "Inseminación artificial",
      amount: "15000",
    });

    console.log(`Finanza animal 1 creada: ${animalFinance1.concept} (ID: ${animalFinance1.id})`);

    const animalFinance2 = await storage.createAnimalFinance({
      animalId: animal2.id,
      date: new Date("2021-05-20"),
      type: "expense",
      concept: "Compra de animal",
      amount: "250000",
    });

    console.log(`Finanza animal 2 creada: ${animalFinance2.concept} (ID: ${animalFinance2.id})`);

    const animalFinance3 = await storage.createAnimalFinance({
      animalId: animal3.id,
      date: new Date("2023-07-10"),
      type: "expense",
      concept: "Vacunas",
      amount: "5000",
    });

    console.log(`Finanza animal 3 creada: ${animalFinance3.concept} (ID: ${animalFinance3.id})`);

    console.log("Datos de ejemplo de animales cargados exitosamente.");
  } catch (error) {
    console.error("Error al crear datos de ejemplo para animales:", error);
  }
}

// Exportar la función para poder usarla en sample-data.ts
export { seedAnimals };