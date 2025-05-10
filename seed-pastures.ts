import axios from 'axios';

// Los IDs de los tractores y topadoras disponibles
const TRACTORS = [1, 2, 3]; // John Deere 5090E, John Deere 8R 410, New Holland T7.315
const BULLDOZERS = [5]; // Caterpillar D6K2

// Nombres de parcelas
const PARCEL_NAMES = [
  "Lote Norte",
  "Campo Grande",
  "El Trébol"
];

// Tipos de trabajos agrícolas
const WORK_TYPES = [
  "siembra",
  "arado",
  "fumigación",
  "fertilización",
  "rastrillado",
  "cosecha"
];

// Función para generar una fecha aleatoria en un rango
function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Función para obtener un elemento aleatorio de un array
function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// Función para crear una parcela con datos aleatorios
async function createParcel(name: string): Promise<number> {
  const parcel = {
    name,
    area: (20 + Math.floor(Math.random() * 100)).toString(), // Entre 20 y 120 hectáreas
    location: `Sector ${Math.floor(Math.random() * 10) + 1}`,
    soilType: getRandomItem(["arcilloso", "arenoso", "limoso", "franco"]),
    waterSource: getRandomItem(["arroyo", "pozo", "laguna", "ninguna"]),
    status: "active",
    latitude: ((-27) - Math.random() * 3).toFixed(6),
    longitude: ((-55) - Math.random() * 3).toFixed(6),
    description: `Parcela utilizada para producción agropecuaria. ${Math.random() > 0.5 ? "Con alambrado perimetral." : ""}`
  };

  console.log(`Creando parcela: ${name}`);
  const response = await axios.post('http://localhost:5000/api/pastures', parcel);
  console.log(`Parcela ${name} creada con ID: ${response.data.id}`);
  
  return response.data.id;
}

// Función para crear un trabajo agrícola en una parcela
async function createWork(pastureId: number, machineryType: "tractor" | "topadora") {
  const machineId = machineryType === "tractor" 
    ? getRandomItem(TRACTORS) 
    : getRandomItem(BULLDOZERS);
  
  const workType = getRandomItem(WORK_TYPES);
  const startDate = randomDate(new Date(2024, 0, 1), new Date(2025, 4, 1));
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + Math.floor(Math.random() * 5) + 1);
  
  const areaWorked = (10 + Math.floor(Math.random() * 50)).toString(); // Entre 10 y 60 hectáreas
  const workingHours = (5 + Math.floor(Math.random() * 20)).toString(); // Entre 5 y 25 horas
  const fuelUsed = (50 + Math.floor(Math.random() * 150)).toString(); // Entre 50 y 200 litros
  
  const operativeCost = (10000 + Math.floor(Math.random() * 30000)).toString(); // Entre 10000 y 40000 pesos
  const suppliesCost = (5000 + Math.floor(Math.random() * 25000)).toString(); // Entre 5000 y 30000 pesos
  const totalCost = (parseInt(operativeCost) + parseInt(suppliesCost)).toString();
  
  // Datos específicos según el tipo de trabajo
  let specificData = {};
  switch (workType) {
    case "siembra":
      specificData = {
        seedType: getRandomItem(["maíz", "trigo", "soja", "girasol"]),
        seedQuantity: (80 + Math.floor(Math.random() * 40)).toString() // 80-120 kg/ha
      };
      break;
    case "fumigación":
      specificData = {
        chemicalType: getRandomItem(["herbicida", "insecticida", "fungicida"]),
        chemicalQuantity: (2 + Math.random() * 4).toFixed(1) // 2-6 L/ha
      };
      break;
    case "fertilización":
      specificData = {
        fertilizerType: getRandomItem(["nitrogenado", "fosfatado", "potásico", "completo"]),
        fertilizerQuantity: (150 + Math.floor(Math.random() * 150)).toString() // 150-300 kg/ha
      };
      break;
  }
  
  const work = {
    pastureId,
    workType,
    description: `Trabajo de ${workType} realizado con ${machineryType}`,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    machineId,
    areaWorked,
    workingHours,
    fuelUsed,
    operativeCost,
    suppliesCost,
    totalCost,
    weatherConditions: getRandomItem(["despejado", "nublado", "parcialmente nublado"]),
    temperature: (15 + Math.floor(Math.random() * 20)).toString(), // 15-35°C
    soilHumidity: (20 + Math.floor(Math.random() * 40)).toString(), // 20-60%
    observations: `Trabajo completado ${Math.random() > 0.7 ? "con dificultades por condiciones del terreno" : "sin inconvenientes"}`,
    ...specificData
  };
  
  console.log(`Creando trabajo de ${workType} en parcela ID ${pastureId} con ${machineryType} (ID: ${machineId})`);
  const response = await axios.post('http://localhost:5000/api/pasture-works', work);
  console.log(`Trabajo agrícola creado con ID: ${response.data.id}`);
  
  return response.data.id;
}

// Función principal para crear las parcelas y sus trabajos
async function seedPasturesAndWorks() {
  try {
    console.log("Creando parcelas y trabajos agrícolas...");
    
    for (const name of PARCEL_NAMES) {
      const parcelId = await createParcel(name);
      
      // Crear dos trabajos para cada parcela, uno con tractor y otro con topadora
      await createWork(parcelId, "tractor");
      await createWork(parcelId, "topadora");
    }
    
    console.log("¡Datos de parcelas y trabajos agrícolas creados exitosamente!");
  } catch (error) {
    console.error("Error creando parcelas y trabajos:", error);
  }
}

// Ejecutar el script
seedPasturesAndWorks();