import { storage } from './server/storage';

// Lista de máquinas para agregar
const machinesList = [
  // Tractores
  {
    type: "tractor",
    brand: "John Deere",
    model: "8R 410",
    serialNumber: "JD8R410-2345678",
    year: 2023,
    hours: "150",
    power: "410 HP",
    fuelType: "Diesel",
    licensePlate: "",
    purchaseDate: new Date("2023-12-15"),
    supplier: "Agro Center S.A.",
    invoiceNumber: "F-23456",
    purchasePrice: "85000000",
    paymentMethod: "Crédito bancario",
    warrantyStart: new Date("2023-12-15"),
    warrantyEnd: new Date("2025-12-15"),
    documentation: "Manual, garantía, factura",
    photo: ""
  },
  {
    type: "tractor",
    brand: "New Holland",
    model: "T7.315",
    serialNumber: "NH7315-6543210",
    year: 2022,
    hours: "320",
    power: "315 HP",
    fuelType: "Diesel",
    licensePlate: "",
    purchaseDate: new Date("2022-06-10"),
    supplier: "Maquinarias del Sur",
    invoiceNumber: "F-65432",
    purchasePrice: "72000000",
    paymentMethod: "Contado",
    warrantyStart: new Date("2022-06-10"),
    warrantyEnd: new Date("2024-06-10"),
    documentation: "Manual, garantía, factura",
    photo: ""
  },
  {
    type: "tractor",
    brand: "Case IH",
    model: "Maxxum 150",
    serialNumber: "CIMAX150-789012",
    year: 2021,
    hours: "580",
    power: "150 HP",
    fuelType: "Diesel",
    licensePlate: "",
    purchaseDate: new Date("2021-08-22"),
    supplier: "Agro Maquinarias",
    invoiceNumber: "F-12345",
    purchasePrice: "45000000",
    paymentMethod: "Leasing",
    warrantyStart: new Date("2021-08-22"),
    warrantyEnd: new Date("2023-08-22"),
    documentation: "Manual, garantía, certificado de leasing",
    photo: ""
  },
  
  // Camiones
  {
    type: "camion",
    brand: "Mercedes-Benz",
    model: "Atego 1726",
    serialNumber: "MB1726-123456",
    year: 2022,
    hours: "25000",
    power: "260 HP",
    fuelType: "Diesel",
    licensePlate: "AB123CD",
    purchaseDate: new Date("2022-03-15"),
    supplier: "Automotores del Norte",
    invoiceNumber: "F-34567",
    purchasePrice: "28000000",
    paymentMethod: "Financiación concesionario",
    warrantyStart: new Date("2022-03-15"),
    warrantyEnd: new Date("2024-03-15"),
    documentation: "Manual, garantía, factura, cédula",
    photo: ""
  },
  {
    type: "camion",
    brand: "Scania",
    model: "R450",
    serialNumber: "SCR450-987654",
    year: 2021,
    hours: "38000",
    power: "450 HP",
    fuelType: "Diesel",
    licensePlate: "XY456ZW",
    purchaseDate: new Date("2021-05-20"),
    supplier: "Scania Argentina",
    invoiceNumber: "F-56789",
    purchasePrice: "35000000",
    paymentMethod: "Crédito bancario",
    warrantyStart: new Date("2021-05-20"),
    warrantyEnd: new Date("2023-05-20"),
    documentation: "Manual, garantía, factura, cédula",
    photo: ""
  },
  
  // Topadoras
  {
    type: "topadora",
    brand: "Caterpillar",
    model: "D6K2",
    serialNumber: "CAT-D6K2-543210",
    year: 2020,
    hours: "1200",
    power: "130 HP",
    fuelType: "Diesel",
    licensePlate: "",
    purchaseDate: new Date("2020-11-10"),
    supplier: "Finning CAT",
    invoiceNumber: "F-67890",
    purchasePrice: "40000000",
    paymentMethod: "Leasing",
    warrantyStart: new Date("2020-11-10"),
    warrantyEnd: new Date("2022-11-10"),
    documentation: "Manual, garantía, certificado de leasing",
    photo: ""
  },
  {
    type: "topadora",
    brand: "Komatsu",
    model: "D51EX-24",
    serialNumber: "KOM-D51EX-654321",
    year: 2022,
    hours: "450",
    power: "130 HP",
    fuelType: "Diesel",
    licensePlate: "",
    purchaseDate: new Date("2022-02-18"),
    supplier: "Komatsu Argentina",
    invoiceNumber: "F-78901",
    purchasePrice: "35000000",
    paymentMethod: "Contado",
    warrantyStart: new Date("2022-02-18"),
    warrantyEnd: new Date("2024-02-18"),
    documentation: "Manual, garantía, factura",
    photo: ""
  },
  
  // Vehículos
  {
    type: "vehiculo",
    brand: "Toyota",
    model: "Hilux 4x4 SRX",
    serialNumber: "TOY-HLX-876543",
    year: 2023,
    hours: "12000",
    power: "204 HP",
    fuelType: "Diesel",
    licensePlate: "AD345FG",
    purchaseDate: new Date("2023-01-25"),
    supplier: "Toyota Misiones",
    invoiceNumber: "F-89012",
    purchasePrice: "15000000",
    paymentMethod: "Financiación concesionario",
    warrantyStart: new Date("2023-01-25"),
    warrantyEnd: new Date("2026-01-25"),
    documentation: "Manual, garantía, factura, cédula, seguro",
    photo: ""
  },
  {
    type: "vehiculo",
    brand: "Ford",
    model: "Ranger Limited 4x4",
    serialNumber: "FOR-RNG-765432",
    year: 2022,
    hours: "18000",
    power: "213 HP",
    fuelType: "Diesel",
    licensePlate: "AD789HJ",
    purchaseDate: new Date("2022-06-15"),
    supplier: "Ford Sur",
    invoiceNumber: "F-90123",
    purchasePrice: "14000000",
    paymentMethod: "Crédito bancario",
    warrantyStart: new Date("2022-06-15"),
    warrantyEnd: new Date("2025-06-15"),
    documentation: "Manual, garantía, factura, cédula, seguro",
    photo: ""
  },
  
  // Accesorios
  {
    type: "accesorio",
    brand: "John Deere",
    model: "Sembradora 1755",
    serialNumber: "JD-SEM-234567",
    year: 2021,
    hours: "320",
    power: "N/A",
    fuelType: "N/A",
    licensePlate: "",
    purchaseDate: new Date("2021-07-20"),
    supplier: "Agro Center S.A.",
    invoiceNumber: "F-01234",
    purchasePrice: "18000000",
    paymentMethod: "Contado",
    warrantyStart: new Date("2021-07-20"),
    warrantyEnd: new Date("2023-07-20"),
    documentation: "Manual, garantía, factura",
    photo: ""
  },
  {
    type: "accesorio",
    brand: "Mainero",
    model: "Rotoenfardadora 5880",
    serialNumber: "MNR-5880-345678",
    year: 2022,
    hours: "180",
    power: "N/A",
    fuelType: "N/A",
    licensePlate: "",
    purchaseDate: new Date("2022-08-10"),
    supplier: "Rodagro Maquinarias",
    invoiceNumber: "F-12345",
    purchasePrice: "8500000",
    paymentMethod: "Financiación proveedor",
    warrantyStart: new Date("2022-08-10"),
    warrantyEnd: new Date("2024-08-10"),
    documentation: "Manual, garantía, factura",
    photo: ""
  },
  {
    type: "accesorio",
    brand: "Agrometal",
    model: "Sembradora TX Mega",
    serialNumber: "AGM-TXM-456789",
    year: 2023,
    hours: "60",
    power: "N/A",
    fuelType: "N/A",
    licensePlate: "",
    purchaseDate: new Date("2023-05-05"),
    supplier: "Agroimplementos S.A.",
    invoiceNumber: "F-23456",
    purchasePrice: "22000000",
    paymentMethod: "Leasing",
    warrantyStart: new Date("2023-05-05"),
    warrantyEnd: new Date("2025-05-05"),
    documentation: "Manual, garantía, certificado de leasing",
    photo: ""
  }
];

// Función para crear las máquinas
async function seedMachines() {
  console.log("[Sample Data] Creando máquinas aleatorias...");
  
  // Crear cada máquina
  for (const machineData of machinesList) {
    try {
      const machine = await storage.createMachine(machineData);
      console.log(`[Sample Data] Máquina creada: ${machine.brand} ${machine.model} (ID: ${machine.id})`);
    } catch (error) {
      console.error(`[Sample Data] Error al crear máquina ${machineData.brand} ${machineData.model}:`, error);
    }
  }
  
  console.log("[Sample Data] Máquinas aleatorias creadas exitosamente.");
}

// Exportar la función para poder usarla en sample-data.ts
export { seedMachines };