import { storage } from './server/storage';

// Nombres de lotes realistas para un campo argentino
const pastureNames = [
  "La Loma", "El Bajo", "La Cañada", "Campo Grande", 
  "El Triangulo", "La Curva", "Potrero Norte", "Lote 15",
  "La Legua", "El Monte", "El Tajamar", "La Laguna",
  "Campo Nuevo", "La Esquina", "Potrero Sur", "El Cerco"
];

// Tipos de suelo típicos de Argentina
const soilTypes = ["Arcilloso", "Franco", "Arenoso", "Limoso", "Argiudol típico", "Hapludol éntico", "Haplustol"];

// Tipos de trabajo agrícola
const workTypes = ["Siembra", "Fumigación", "Fertilización", "Cosecha", "Rastra", "Disco", "Limpieza", "Nivelación", "Enrollado"];

// Cultivos para sembrar
const seedTypes = ["Maíz", "Soja", "Trigo", "Girasol", "Sorgo", "Alfalfa", "Avena", "Cebada"];

// Fertilizantes comunes
const fertilizerTypes = ["Urea", "Fosfato diamónico", "UAN", "Nitrato de amonio", "Sulfato de amonio"];

// Agroquímicos comunes
const agrochemicalTypes = ["Glifosato", "2,4-D", "Atrazina", "Dicamba", "Metolacloro", "Cipermetrina"];

// Función para obtener una fecha aleatoria entre dos fechas
const getRandomDate = (start: Date, end: Date): Date => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Función para obtener un elemento aleatorio de un array
const getRandomItem = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

// Función para obtener un número aleatorio entre min y max
const getRandomNumber = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Función principal para sembrar datos
async function seedPastures() {
  console.log("[Sample Data] Creando datos de ejemplo para pasturas...");

  // Crear parcelas aleatorias
  for (let i = 1; i <= 16; i++) {
    const name = pastureNames[i - 1];
    const area = getRandomNumber(25, 150).toString();
    const soilType = getRandomItem(soilTypes);
    const hasWater = Math.random() > 0.3; // 70% de probabilidad de tener agua
    
    const pasture = await storage.createPasture({
      name,
      area,
      soilType,
      status: "activo",
      location: `Sector ${String.fromCharCode(64 + getRandomNumber(1, 4))}`,
      coordinates: `${getRandomNumber(-34, -33)}.${getRandomNumber(100000, 999999)}, ${getRandomNumber(-59, -58)}.${getRandomNumber(100000, 999999)}`,
      description: `Lote de ${area} hectáreas con suelo ${soilType.toLowerCase()}`,
      waterAvailability: hasWater ? "Sí" : "No",
      acquisitionDate: getRandomDate(new Date(2000, 0, 1), new Date(2022, 0, 1)),
      acquisitionValue: hasWater ? (parseInt(area) * getRandomNumber(3000, 5000)).toString() : (parseInt(area) * getRandomNumber(2000, 3500)).toString(),
    });

    console.log(`[Sample Data] Parcela creada: ${name} (ID: ${pasture.id})`);
    
    // Crear entre 2 y 5 trabajos por parcela
    const numberOfWorks = getRandomNumber(2, 5);
    
    for (let j = 1; j <= numberOfWorks; j++) {
      const workType = getRandomItem(workTypes);
      const startDate = getRandomDate(new Date(2023, 0, 1), new Date());
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + getRandomNumber(1, 7)); // Entre 1 y 7 días después
      
      // Seleccionar máquina (tractor o topadora) según el tipo de trabajo
      const machineType = workType === "Limpieza" || workType === "Nivelación" ? "topadora" : "tractor";
      const machineId = machineType === "topadora" ? 5 : getRandomItem([1, 2, 3]); // IDs de tractores o topadora
      
      // Datos específicos según el tipo de trabajo
      let specificData: any = {};
      let description = "";
      
      switch (workType) {
        case "Siembra":
          const seedType = getRandomItem(seedTypes);
          const kgPerHa = getRandomNumber(80, 120);
          specificData = {
            seedType,
            kgPerHa: kgPerHa.toString(),
            totalSeedKg: (parseInt(area) * kgPerHa).toString()
          };
          description = `Siembra de ${seedType} a razón de ${kgPerHa} kg/ha`;
          break;
          
        case "Fumigación":
          const agrochemical = getRandomItem(agrochemicalTypes);
          const litersPerHa = getRandomNumber(2, 10);
          specificData = {
            agrochemicalType: agrochemical,
            litersPerHa: litersPerHa.toString(),
            totalLiters: (parseInt(area) * litersPerHa).toString()
          };
          description = `Aplicación de ${agrochemical} a razón de ${litersPerHa} l/ha`;
          break;
          
        case "Fertilización":
          const fertilizer = getRandomItem(fertilizerTypes);
          const kgPerHaFert = getRandomNumber(100, 300);
          specificData = {
            fertilizerType: fertilizer,
            kgPerHa: kgPerHaFert.toString(),
            totalFertilizerKg: (parseInt(area) * kgPerHaFert).toString()
          };
          description = `Fertilización con ${fertilizer} a razón de ${kgPerHaFert} kg/ha`;
          break;
          
        case "Cosecha":
          const cropType = getRandomItem(seedTypes);
          const yieldPerHa = getRandomNumber(2000, 8000);
          specificData = {
            cropType,
            yieldPerHa: yieldPerHa.toString(),
            totalYieldKg: (parseInt(area) * yieldPerHa).toString()
          };
          description = `Cosecha de ${cropType} con rendimiento de ${yieldPerHa} kg/ha`;
          break;
          
        case "Enrollado":
          const rollsPerHa = getRandomNumber(5, 15);
          const threadRollsUsed = getRandomNumber(1, 3);
          specificData = {
            rollsPerHa: rollsPerHa.toString(),
            totalRolls: (parseInt(area) * rollsPerHa / 10).toString(), // Dividido por 10 para un número más realista
            threadRollsUsed: threadRollsUsed.toString()
          };
          description = `Confección de rollos con ${threadRollsUsed} rollos de hilo utilizados`;
          break;
          
        default:
          description = `Trabajo de ${workType.toLowerCase()} en parcela`;
      }
      
      // Datos comunes para todos los tipos de trabajo
      const operationalCost = getRandomNumber(5000, 15000).toString();
      const suppliesCost = getRandomNumber(10000, 50000).toString();
      const totalCost = (parseInt(operationalCost) + parseInt(suppliesCost)).toString();
      
      const work = await storage.createPastureWork({
        pastureId: pasture.id,
        workType,
        description,
        startDate,
        endDate,
        machineId,
        areaWorked: area,
        workTime: getRandomNumber(3, 12).toString(),
        fuelUsage: getRandomNumber(50, 200).toString(),
        operationalCost,
        suppliesCost,
        totalCost,
        weather: getRandomItem(["Soleado", "Nublado", "Parcialmente nublado"]),
        temperature: getRandomNumber(15, 35).toString(),
        soilHumidity: getRandomNumber(40, 80).toString(),
        observations: `Trabajo de ${workType.toLowerCase()} completado sin inconvenientes`,
        ...specificData
      });
      
      console.log(`[Sample Data] Trabajo creado: ${workType} en ${name} (ID: ${work.id})`);
    }
  }
  
  console.log("[Sample Data] Datos de ejemplo para pasturas cargados exitosamente.");
}

// Solo exportamos la función para que la ejecute sample-data.ts
export { seedPastures };