import { storage } from "./server/storage";

async function seedData() {
  try {
    console.log("Iniciando carga de datos de ejemplo...");

    // Crear una máquina de ejemplo
    const machine = await storage.createMachine({
      brand: "John Deere",
      model: "5090E",
      type: "tractor",
      year: "2020",
      hours: "450",
      purchaseDate: new Date("2020-05-15"),
      warrantyStart: new Date("2020-05-15"),
      warrantyEnd: new Date("2022-05-15"),
    });
    console.log(`Máquina creada: ${machine.brand} ${machine.model} (ID: ${machine.id})`);

    // Crear registros de mantenimiento
    const maintenance1 = await storage.createMaintenance({
      machineId: machine.id,
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
    console.log(`Mantenimiento 1 creado: ${maintenance1.type} (ID: ${maintenance1.id})`);

    const maintenance2 = await storage.createMaintenance({
      machineId: machine.id,
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
    console.log(`Mantenimiento 2 creado: ${maintenance2.type} (ID: ${maintenance2.id})`);

    const maintenance3 = await storage.createMaintenance({
      machineId: machine.id,
      date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 días atrás
      time: "10:00",
      type: "maintenance_repair",
      driver: "Miguel López",
      notes: "Reparación de sistema hidráulico",
      isModified: true,
      modifiedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000), // Modificado 5 días después
    });
    console.log(`Mantenimiento 3 creado: ${maintenance3.type} (ID: ${maintenance3.id})`);

    // Crear registros financieros
    const finance1 = await storage.createMachineFinance({
      machineId: machine.id,
      date: new Date(),
      type: "expense",
      concept: "Combustible",
      amount: "150.00",
    });
    console.log(`Finanza 1 creada: ${finance1.concept} (ID: ${finance1.id})`);

    const finance2 = await storage.createMachineFinance({
      machineId: machine.id,
      date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 días atrás
      type: "expense",
      concept: "Repuestos",
      amount: "350.00",
    });
    console.log(`Finanza 2 creada: ${finance2.concept} (ID: ${finance2.id})`);

    console.log("Datos de ejemplo cargados exitosamente.");
  } catch (error) {
    console.error("Error al crear datos de ejemplo:", error);
  }
}

seedData();