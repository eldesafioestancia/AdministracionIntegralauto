import { db } from "./server/storage";

/**
 * Script para cargar una versión reducida de las maquinarias
 * Solo mantenemos una de cada tipo
 */
async function reduceMachines() {
  try {
    // Primero eliminamos todas las maquinarias existentes
    // Nota: Esto también eliminará registros relacionados como mantenimientos y trabajos
    await db.machine.deleteMany({});
    
    console.log("[Reducir Máquinas] Eliminando máquinas existentes...");
    
    // Lista reducida de maquinarias (una de cada tipo)
    const machinesList = [
      // Un tractor
      {
        brand: "John Deere",
        model: "5090E",
        type: "tractor",
        year: 2020,
        horsepower: 90,
        purchaseDate: new Date("2020-05-12"),
        purchasePrice: 65000,
        status: "activo",
        image: "tractor.jpg",
        engineHours: 1230,
        serialNumber: "JD5090E12345",
        fuelType: "diesel",
        licensePlate: "",
        insurancePolicy: "AGR-123456",
        insuranceExpiration: new Date("2025-05-12"),
        lastMaintenanceDate: new Date(),
        nextMaintenanceDate: new Date(new Date().setMonth(new Date().getMonth() + 3)),
        description: "Tractor agrícola de uso general con alta potencia."
      },
      // Una topadora
      {
        brand: "Caterpillar",
        model: "D6K",
        type: "topadora",
        year: 2018,
        horsepower: 130,
        purchaseDate: new Date("2018-08-15"),
        purchasePrice: 120000,
        status: "activo",
        image: "topadora.jpg",
        engineHours: 2100,
        serialNumber: "CATD6K54321",
        fuelType: "diesel",
        licensePlate: "",
        insurancePolicy: "AGR-654321",
        insuranceExpiration: new Date("2025-09-15"),
        lastMaintenanceDate: new Date(),
        nextMaintenanceDate: new Date(new Date().setMonth(new Date().getMonth() + 2)),
        description: "Topadora para desmonte y preparación de terreno."
      },
      // Un camión
      {
        brand: "Mercedes-Benz",
        model: "Atego 1725",
        type: "camion",
        year: 2019,
        horsepower: 250,
        purchaseDate: new Date("2019-10-25"),
        purchasePrice: 85000,
        status: "activo",
        image: "camion.jpg",
        engineHours: 3500,
        serialNumber: "MBZ1725XYZ",
        fuelType: "diesel",
        licensePlate: "AB123CD",
        insurancePolicy: "TRK-789012",
        insuranceExpiration: new Date("2025-10-25"),
        lastMaintenanceDate: new Date(),
        nextMaintenanceDate: new Date(new Date().setMonth(new Date().getMonth() + 4)),
        description: "Camión para transporte de granos y animales."
      },
      // Un vehículo
      {
        brand: "Toyota",
        model: "Hilux 4x4",
        type: "vehiculo",
        year: 2021,
        horsepower: 175,
        purchaseDate: new Date("2021-03-18"),
        purchasePrice: 42000,
        status: "activo",
        image: "hilux.jpg",
        engineHours: 1800,
        serialNumber: "TYT4X4ABCD",
        fuelType: "diesel",
        licensePlate: "XY789ZW",
        insurancePolicy: "VEH-456789",
        insuranceExpiration: new Date("2025-03-18"),
        lastMaintenanceDate: new Date(),
        nextMaintenanceDate: new Date(new Date().setMonth(new Date().getMonth() + 5)),
        description: "Camioneta para supervisión y transporte de personal."
      },
      // Una cosechadora
      {
        brand: "New Holland",
        model: "CX 5090",
        type: "cosechadora",
        year: 2017,
        horsepower: 240,
        purchaseDate: new Date("2017-12-05"),
        purchasePrice: 180000,
        status: "activo",
        image: "cosechadora.jpg",
        engineHours: 2800,
        serialNumber: "NH5090HARV",
        fuelType: "diesel",
        licensePlate: "",
        insurancePolicy: "AGR-987654",
        insuranceExpiration: new Date("2025-12-05"),
        lastMaintenanceDate: new Date(),
        nextMaintenanceDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
        description: "Cosechadora para granos de alto rendimiento."
      }
    ];
    
    // Insertar las máquinas una por una
    for (const machine of machinesList) {
      await db.machine.create({
        data: machine
      });
      console.log(`[Reducir Máquinas] Máquina creada: ${machine.brand} ${machine.model} (${machine.type})`);
    }
    
    console.log("[Reducir Máquinas] Se han añadido 5 máquinas (una de cada tipo) correctamente.");
    
  } catch (error) {
    console.error("[Error] No se pudieron reducir las máquinas:", error);
  }
}

// Ejecutar la función para reducir las máquinas
reduceMachines()
  .then(() => console.log("Script de reducción de máquinas finalizado."))
  .catch(console.error);