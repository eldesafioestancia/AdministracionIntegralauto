import { storage } from "./server/storage";

// Datos de maquinarias por categoría
const machineryData = {
  tractores: [
    { brand: "John Deere", models: ["5090E", "6110J", "6130J", "7230J", "8335R"] },
    { brand: "New Holland", models: ["T6.125", "T7.260", "T8.410", "TD5.110", "TL95E"] },
    { brand: "Massey Ferguson", models: ["MF 4275", "MF 4290", "MF 4299", "MF 7415", "MF 8690"] },
    { brand: "Case IH", models: ["Farmall 110A", "Farmall JX110", "Puma 185", "Magnum 280", "Steiger 620"] },
    { brand: "Valtra", models: ["A94", "BM125i", "BH180", "BC6500", "BT210"] },
  ],
  cosechadoras: [
    { brand: "John Deere", models: ["S680", "S780", "T550", "T670", "S670"] },
    { brand: "New Holland", models: ["CR6.80", "CR7.90", "CR8.90", "CR9.90", "CX5.90"] },
    { brand: "Case IH", models: ["Axial-Flow 7250", "Axial-Flow 8250", "Axial-Flow 9250"] },
    { brand: "Claas", models: ["Lexion 760", "Lexion 770", "Lexion 780", "Tucano 570", "Tucano 560"] },
    { brand: "Massey Ferguson", models: ["MF 9695", "MF 9795", "MF 9895", "Ideal 7", "Ideal 9"] },
  ],
  pulverizadoras: [
    { brand: "John Deere", models: ["M700", "M700i", "M900", "M900i", "M4030"] },
    { brand: "Metalfor", models: ["7025", "7040", "7050", "8000", "Multiple 3200"] },
    { brand: "Jacto", models: ["Uniport 2500 Star", "Uniport 3030", "Uniport 4530"] },
    { brand: "PLA", models: ["MAP 3000", "MAP II 3250", "MAP II 3500", "MAP 4000"] },
    { brand: "Case IH", models: ["Patriot 250", "Patriot 350", "SPX 3150", "SPX 4430"] },
  ],
  camiones: [
    { brand: "Mercedes-Benz", models: ["Atego 1726", "Atego 2426", "Axor 2036", "Axor 2046", "Actros 2646"] },
    { brand: "Scania", models: ["G360", "G410", "R450", "R500", "G480"] },
    { brand: "Volvo", models: ["VM 270", "FM 380", "FM 460", "FH 460", "FH 540"] },
    { brand: "Ford", models: ["F-4000", "Cargo 1723", "Cargo 1729", "Cargo 2429", "Cargo 2632"] },
    { brand: "Iveco", models: ["Daily 70C17", "Tector 170E28", "Tector 240E28", "Stralis 440S46T", "Hi-Way AS440S56TZ/P"] },
  ],
  sembradoras: [
    { brand: "Agrometal", models: ["TX3 24 a 52", "MX 33 a 40", "APX", "TX4", "Multipla 445"] },
    { brand: "Crucianelli", models: ["Pionera 3500", "Gringa V", "Gringa SX", "Gringa V Air Drill"] },
    { brand: "Giorgi", models: ["Precisa 8D-3800", "Precisa 6-3213", "Exacta 510", "G-6000"] },
    { brand: "John Deere", models: ["1745", "1755", "DB44", "DB60", "DB90"] },
    { brand: "Apache", models: ["27000", "54000", "63000", "68000", "70000"] },
  ],
  implementos: [
    { brand: "Mainero", models: ["9", "2330", "5870", "6028", "MX-IV"] },
    { brand: "Ombu", models: ["EC 3200", "Ceres 3600", "Ceres 3900", "Centauro", "Vulcano CE 500"] },
    { brand: "Tanzi", models: ["ZA Max", "ZA Max SE", "DUX", "Magnum", "Titán"] },
    { brand: "Stara", models: ["Hercules 10000", "Hercules 15000", "Bruttus", "Hércules"] },
    { brand: "Ipacol", models: ["Enfardadora P-140", "Toco P-140", "Mixer 6M3", "Mixer 12M3", "Mixer 16M3"] },
  ]
};

// Función para obtener años aleatorios (entre 2008 y 2024)
function getRandomYear() {
  return Math.floor(Math.random() * (2024 - 2008 + 1)) + 2008;
}

// Función para obtener horas aleatorias según el tipo de máquina y año
function getRandomHours(type: string, year: number) {
  const currentYear = 2025;
  const age = currentYear - year;
  
  let baseHoursPerYear = 0;
  
  switch(type) {
    case "tractor":
      baseHoursPerYear = 500;
      break;
    case "cosechadora":
      baseHoursPerYear = 350;
      break;
    case "pulverizadora":
      baseHoursPerYear = 450;
      break;
    case "camion":
      baseHoursPerYear = 40000; // kilómetros para camiones
      break;
    case "sembradora":
      baseHoursPerYear = 250;
      break;
    case "implemento":
      baseHoursPerYear = 200;
      break;
    default:
      baseHoursPerYear = 300;
  }
  
  // Añadir un factor aleatorio (±20%)
  const randomFactor = 0.8 + (Math.random() * 0.4);
  const totalHours = Math.floor(age * baseHoursPerYear * randomFactor);
  
  return type === "camion" ? totalHours : totalHours.toString();
}

// Función para seleccionar un combustible según el tipo de máquina
function getFuelType(type: string) {
  switch(type) {
    case "tractor":
    case "cosechadora":
    case "pulverizadora":
      return "Diesel";
    case "camion":
      return Math.random() > 0.2 ? "Diesel" : "Gasolina";
    default:
      return "N/A";
  }
}

// Función para obtener una potencia según el tipo y modelo
function getPower(type: string, model: string) {
  if (type === "implemento") return "N/A";
  
  // Base power depends on the machine type
  let basePower = 0;
  switch(type) {
    case "tractor":
      basePower = 90;
      break;
    case "cosechadora":
      basePower = 250;
      break;
    case "pulverizadora":
      basePower = 140;
      break;
    case "camion":
      basePower = 220;
      break;
    case "sembradora":
      basePower = 0; // Sembradoras no tienen potencia propia
      return "N/A";
  }
  
  // Adjust power based on model naming convention (higher numbers usually mean more power)
  let modelNumber = 0;
  const matches = model.match(/\d+/);
  if (matches) {
    modelNumber = parseInt(matches[0]);
  }
  
  // Simple algorithm to generate power based on model number
  const power = basePower + (modelNumber > 1000 ? Math.floor(modelNumber/100) : modelNumber/4);
  
  return `${Math.floor(power)} HP`;
}

// Función para generar una matrícula/patente aleatoria para vehículos
function generateLicensePlate() {
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const numbers = "0123456789";
  
  // Formato: AA123BB (Argentina)
  let plate = "";
  
  // Primeras dos letras
  plate += letters[Math.floor(Math.random() * letters.length)];
  plate += letters[Math.floor(Math.random() * letters.length)];
  
  // Tres números
  for (let i = 0; i < 3; i++) {
    plate += numbers[Math.floor(Math.random() * numbers.length)];
  }
  
  // Últimas dos letras
  plate += letters[Math.floor(Math.random() * letters.length)];
  plate += letters[Math.floor(Math.random() * letters.length)];
  
  return plate;
}

// Función para obtener una fecha de compra basada en el año de fabricación
function getPurchaseDate(year: number) {
  const month = Math.floor(Math.random() * 12);
  const day = Math.floor(Math.random() * 28) + 1;
  return new Date(year, month, day);
}

// Función para obtener un número de serie aleatorio
function getRandomSerialNumber(brand: string, model: string, year: number) {
  const prefix = brand.substring(0, 3).toUpperCase();
  const modelCode = model.replace(/\D/g, "").substring(0, 3).padStart(3, "0");
  const yearCode = year.toString().substring(2);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  
  return `${prefix}${modelCode}${yearCode}${random}`;
}

// Función principal para generar maquinarias
async function generateRandomMachines() {
  try {
    console.log("Generando maquinarias aleatorias...");
    
    // Mapear los tipos en nuestro objeto de datos a los tipos en el schema
    const typeMapping: Record<string, string> = {
      tractores: "tractor",
      cosechadoras: "cosechadora",
      pulverizadoras: "pulverizadora",
      camiones: "camion",
      sembradoras: "sembradora",
      implementos: "implemento"
    };
    
    // Para cada categoría, crear algunas máquinas
    for (const [category, machines] of Object.entries(machineryData)) {
      const type = typeMapping[category];
      
      // Crear entre 2 y 4 máquinas por categoría
      const numMachinesToCreate = Math.floor(Math.random() * 3) + 2;
      
      for (let i = 0; i < numMachinesToCreate; i++) {
        // Seleccionar marca y modelo aleatorios
        const brandObj = machines[Math.floor(Math.random() * machines.length)];
        const brand = brandObj.brand;
        const model = brandObj.models[Math.floor(Math.random() * brandObj.models.length)];
        
        // Generar año aleatorio
        const year = getRandomYear();
        
        // Crear la máquina
        const machine = await storage.createMachine({
          type,
          brand,
          model,
          year,
          hours: getRandomHours(type, year),
          power: getPower(type, model),
          fuelType: getFuelType(type),
          serialNumber: getRandomSerialNumber(brand, model, year),
          licensePlate: type === "camion" ? generateLicensePlate() : undefined,
          purchaseDate: getPurchaseDate(year),
          warrantyStart: getPurchaseDate(year),
          warrantyEnd: new Date(year + 2, 11, 31), // 2 años de garantía
        });
        
        console.log(`Máquina creada: ${machine.brand} ${machine.model} (${machine.type}) - ID: ${machine.id}`);
      }
    }
    
    console.log("Generación de maquinarias completada exitosamente.");
  } catch (error) {
    console.error("Error al generar maquinarias aleatorias:", error);
  }
}

// Ejecutar la función
generateRandomMachines();