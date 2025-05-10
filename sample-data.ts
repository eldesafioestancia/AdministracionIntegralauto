import { storage } from "./server/storage";
import { seedMachines } from "./sample-machines";
import { seedPastures } from "./sample-pastures";
import { seedAnimals } from "./sample-animals";

async function seedData() {
  try {
    console.log("[Sample Data] Iniciando carga de datos de ejemplo...");

    // Cargar datos de máquinas
    await seedMachines();
    
    // Crear registros de mantenimiento para la primera máquina (ID: 1)
    const maintenance1 = await storage.createMaintenance({
      machineId: 1,
      date: new Date(),
      time: "08:30",
      type: "pre_start_check",
      driver: "Juan Pérez",
      engineOilLevel: true,
      fuelLevel: true,
      batteryWater: true,
      airPressure: true,
      addFuel: true,
      addFuelQuantity: "20",
      cutoffSwitch: true,
      cleaning: true,
      generalCheck: true,
    });
    console.log(`[Sample Data] Mantenimiento 1 creado: ${maintenance1.type} (ID: ${maintenance1.id})`);

    const maintenance2 = await storage.createMaintenance({
      machineId: 1,
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 días atrás
      time: "14:15",
      type: "oil_filter_change",
      driver: "Carlos Rodríguez",
      motorOil: true,
      motorOilQuantity: "10.5",
      hydraulicOil: true,
      hydraulicOilQuantity: "5",
      oilFilter: true,
      airFilter: true,
      fuelFilter: true,
    });
    console.log(`[Sample Data] Mantenimiento 2 creado: ${maintenance2.type} (ID: ${maintenance2.id})`);

    const maintenance3 = await storage.createMaintenance({
      machineId: 1,
      date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 días atrás
      time: "10:00",
      type: "maintenance_repair",
      driver: "Miguel López",
      notes: "Reparación de sistema hidráulico",
      isModified: true,
      modifiedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000), // Modificado 5 días después
    });
    console.log(`[Sample Data] Mantenimiento 3 creado: ${maintenance3.type} (ID: ${maintenance3.id})`);

    // Crear registros financieros
    const finance1 = await storage.createMachineFinance({
      machineId: 1,
      date: new Date(),
      type: "expense",
      concept: "Combustible",
      amount: "150.00",
    });
    console.log(`[Sample Data] Finanza 1 creada: ${finance1.concept} (ID: ${finance1.id})`);

    const finance2 = await storage.createMachineFinance({
      machineId: 1,
      date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 días atrás
      type: "expense",
      concept: "Repuestos",
      amount: "350.00",
    });
    console.log(`[Sample Data] Finanza 2 creada: ${finance2.concept} (ID: ${finance2.id})`);
    
    // Cargar datos de pasturas y trabajos
    console.log("[Sample Data] Iniciando carga de datos de pasturas...");
    try {
      await seedPastures();
      console.log("[Sample Data] Datos de pasturas cargados exitosamente.");
    } catch (error) {
      console.error("[Sample Data] Error al cargar datos de pasturas:", error);
    }
    
    // Cargar datos de animales
    console.log("[Sample Data] Iniciando carga de datos de animales...");
    try {
      await seedAnimals();
      console.log("[Sample Data] Datos de animales cargados exitosamente.");
    } catch (error) {
      console.error("[Sample Data] Error al cargar datos de animales:", error);
    }

    console.log("[Sample Data] Datos de ejemplo cargados exitosamente.");
  } catch (error) {
    console.error("[Sample Data] Error al crear datos de ejemplo:", error);
  }
}

seedData();