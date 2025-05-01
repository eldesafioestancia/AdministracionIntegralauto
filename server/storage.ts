import {
  users, User, InsertUser,
  machines, Machine, InsertMachine,
  maintenance, Maintenance, InsertMaintenance,
  machineFinances, MachineFinance, InsertMachineFinance,
  animals, Animal, InsertAnimal,
  animalVeterinary, AnimalVeterinary, InsertAnimalVeterinary,
  animalFinances, AnimalFinance, InsertAnimalFinance,
  pastures, Pasture, InsertPasture,
  pastureFinances, PastureFinance, InsertPastureFinance,
  investments, Investment, InsertInvestment,
  services, Service, InsertService,
  taxes, Tax, InsertTax,
  repairs, Repair, InsertRepair,
  salaries, Salary, InsertSalary,
  capital, Capital, InsertCapital
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Machines
  getMachines(): Promise<Machine[]>;
  getMachine(id: number): Promise<Machine | undefined>;
  createMachine(machine: InsertMachine): Promise<Machine>;
  updateMachine(id: number, machine: Partial<InsertMachine>): Promise<Machine | undefined>;
  deleteMachine(id: number): Promise<boolean>;
  
  // Maintenance
  getMaintenances(machineId?: number): Promise<Maintenance[]>;
  getMaintenance(id: number): Promise<Maintenance | undefined>;
  createMaintenance(maintenance: InsertMaintenance): Promise<Maintenance>;
  updateMaintenance(id: number, maintenance: Partial<InsertMaintenance>): Promise<Maintenance | undefined>;
  deleteMaintenance(id: number): Promise<boolean>;
  
  // Machine Finances
  getMachineFinances(machineId?: number): Promise<MachineFinance[]>;
  getMachineFinance(id: number): Promise<MachineFinance | undefined>;
  createMachineFinance(finance: InsertMachineFinance): Promise<MachineFinance>;
  deleteMachineFinance(id: number): Promise<boolean>;
  
  // Animals
  getAnimals(): Promise<Animal[]>;
  getAnimal(id: number): Promise<Animal | undefined>;
  createAnimal(animal: InsertAnimal): Promise<Animal>;
  updateAnimal(id: number, animal: Partial<InsertAnimal>): Promise<Animal | undefined>;
  deleteAnimal(id: number): Promise<boolean>;
  
  // Animal Veterinary
  getAnimalVeterinary(animalId?: number): Promise<AnimalVeterinary[]>;
  createAnimalVeterinary(record: InsertAnimalVeterinary): Promise<AnimalVeterinary>;
  deleteAnimalVeterinary(id: number): Promise<boolean>;
  
  // Animal Finances
  getAnimalFinances(animalId?: number): Promise<AnimalFinance[]>;
  createAnimalFinance(finance: InsertAnimalFinance): Promise<AnimalFinance>;
  deleteAnimalFinance(id: number): Promise<boolean>;
  
  // Pastures
  getPastures(): Promise<Pasture[]>;
  getPasture(id: number): Promise<Pasture | undefined>;
  createPasture(pasture: InsertPasture): Promise<Pasture>;
  updatePasture(id: number, pasture: Partial<InsertPasture>): Promise<Pasture | undefined>;
  deletePasture(id: number): Promise<boolean>;
  
  // Pasture Finances
  getPastureFinances(pastureId?: number): Promise<PastureFinance[]>;
  createPastureFinance(finance: InsertPastureFinance): Promise<PastureFinance>;
  deletePastureFinance(id: number): Promise<boolean>;
  
  // Investments
  getInvestments(): Promise<Investment[]>;
  getInvestment(id: number): Promise<Investment | undefined>;
  createInvestment(investment: InsertInvestment): Promise<Investment>;
  deleteInvestment(id: number): Promise<boolean>;
  
  // Services
  getServices(): Promise<Service[]>;
  createService(service: InsertService): Promise<Service>;
  deleteService(id: number): Promise<boolean>;
  
  // Taxes
  getTaxes(): Promise<Tax[]>;
  createTax(tax: InsertTax): Promise<Tax>;
  deleteTax(id: number): Promise<boolean>;
  
  // Repairs
  getRepairs(): Promise<Repair[]>;
  createRepair(repair: InsertRepair): Promise<Repair>;
  deleteRepair(id: number): Promise<boolean>;
  
  // Salaries
  getSalaries(): Promise<Salary[]>;
  createSalary(salary: InsertSalary): Promise<Salary>;
  deleteSalary(id: number): Promise<boolean>;
  
  // Capital
  getCapital(): Promise<Capital[]>;
  createCapital(capital: InsertCapital): Promise<Capital>;
  deleteCapital(id: number): Promise<boolean>;
  
  // Dashboard
  getDashboardStats(): Promise<{
    machineCount: number;
    animalCount: number;
    monthlyIncome: number;
    monthlyExpense: number;
  }>;
  getUpcomingMaintenances(): Promise<Maintenance[]>;
  getRecentTransactions(): Promise<(MachineFinance | AnimalFinance | PastureFinance)[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private machines: Map<number, Machine>;
  private maintenances: Map<number, Maintenance>;
  private machineFinances: Map<number, MachineFinance>;
  private animals: Map<number, Animal>;
  private animalVeterinary: Map<number, AnimalVeterinary>;
  private animalFinances: Map<number, AnimalFinance>;
  private pastures: Map<number, Pasture>;
  private pastureFinances: Map<number, PastureFinance>;
  private investments: Map<number, Investment>;
  private services: Map<number, Service>;
  private taxes: Map<number, Tax>;
  private repairs: Map<number, Repair>;
  private salaries: Map<number, Salary>;
  private capitals: Map<number, Capital>;

  private currentIds: {
    user: number;
    machine: number;
    maintenance: number;
    machineFinance: number;
    animal: number;
    animalVeterinary: number;
    animalFinance: number;
    pasture: number;
    pastureFinance: number;
    investment: number;
    service: number;
    tax: number;
    repair: number;
    salary: number;
    capital: number;
  };

  constructor() {
    this.users = new Map();
    this.machines = new Map();
    this.maintenances = new Map();
    this.machineFinances = new Map();
    this.animals = new Map();
    this.animalVeterinary = new Map();
    this.animalFinances = new Map();
    this.pastures = new Map();
    this.pastureFinances = new Map();
    this.investments = new Map();
    this.services = new Map();
    this.taxes = new Map();
    this.repairs = new Map();
    this.salaries = new Map();
    this.capitals = new Map();

    this.currentIds = {
      user: 1,
      machine: 1,
      maintenance: 1,
      machineFinance: 1,
      animal: 1,
      animalVeterinary: 1,
      animalFinance: 1,
      pasture: 1,
      pastureFinance: 1,
      investment: 1,
      service: 1,
      tax: 1,
      repair: 1,
      salary: 1,
      capital: 1,
    };

    // Initialize with a default admin user
    this.createUser({
      username: "admin@agrogest.com",
      password: "$2b$10$eCJJFfGJXRrQGPc7KZbhfeoZXmn1tdGQM.8gGXqUEFSc40KWjN6fC", // This is "password" hashed
      fullName: "Admin User",
      role: "admin",
    });

    // Tractores
    this.createMachine({
      type: "tractor",
      brand: "John Deere",
      model: "6130M",
      year: 2020,
      hours: "1245",
      purchaseDate: new Date("2020-05-15"),
      serialNumber: "JD6130M-54321",
      status: "activo",
      fuelType: "diesel",
      engineType: "6 cilindros turbo",
      engineHp: 130,
      transmission: "PowerQuad Plus",
      weight: "5200",
      dimensions: { length: 4.5, width: 2.3, height: 2.9 },
      attachments: ["arado", "rastra"],
      purchasePrice: "85000",
      lastMaintenanceDate: new Date("2024-03-15"),
      nextMaintenanceDate: new Date("2025-06-15"),
      image: "https://placehold.co/600x400/png?text=John+Deere+6130M"
    });

    this.createMachine({
      type: "tractor",
      brand: "Massey Ferguson",
      model: "5710",
      year: 2021,
      hours: "980",
      purchaseDate: new Date("2021-02-10"),
      serialNumber: "MF5710-98765",
      status: "activo",
      fuelType: "diesel",
      engineType: "4 cilindros",
      engineHp: 110,
      transmission: "Dyna-4",
      weight: "4800",
      dimensions: { length: 4.3, width: 2.2, height: 2.8 },
      attachments: ["sembradora", "fertilizadora"],
      purchasePrice: "78000",
      lastMaintenanceDate: new Date("2024-04-05"),
      nextMaintenanceDate: new Date("2025-04-05"),
      image: "https://placehold.co/600x400/png?text=Massey+Ferguson+5710"
    });

    // Topadoras
    this.createMachine({
      type: "topadora",
      brand: "Caterpillar",
      model: "D6",
      year: 2018,
      hours: "2890",
      purchaseDate: new Date("2018-03-22"),
      serialNumber: "CAT-D6-12345",
      status: "activo",
      fuelType: "diesel",
      engineType: "C9.3B",
      engineHp: 215,
      transmission: "Servotransmisión",
      weight: "22000",
      dimensions: { length: 6.4, width: 3.4, height: 3.2 },
      attachments: ["hoja estándar", "hoja en ángulo"],
      purchasePrice: "290000",
      lastMaintenanceDate: new Date("2024-02-10"),
      nextMaintenanceDate: new Date("2025-02-10"),
      image: "https://placehold.co/600x400/png?text=Caterpillar+D6"
    });

    this.createMachine({
      type: "topadora",
      brand: "Komatsu",
      model: "D65EX-18",
      year: 2019,
      hours: "2100",
      purchaseDate: new Date("2019-06-15"),
      serialNumber: "KOM-D65-54321",
      status: "en_mantenimiento",
      fuelType: "diesel",
      engineType: "SAA6D114E-6",
      engineHp: 220,
      transmission: "ECMV automática",
      weight: "23000",
      dimensions: { length: 6.5, width: 3.5, height: 3.3 },
      attachments: ["hoja sigmadozer", "escarificador"],
      purchasePrice: "310000",
      lastMaintenanceDate: new Date("2024-04-20"),
      nextMaintenanceDate: new Date("2025-04-20"),
      image: "https://placehold.co/600x400/png?text=Komatsu+D65EX"
    });

    // Camiones
    this.createMachine({
      type: "camion",
      brand: "Ford",
      model: "F-350",
      year: 2019,
      hours: "85600",
      purchaseDate: new Date("2019-11-10"),
      serialNumber: "FORD-F350-67890",
      status: "activo",
      fuelType: "diesel",
      engineType: "Power Stroke",
      engineHp: 450,
      transmission: "TorqShift 10 velocidades",
      weight: "3500",
      dimensions: { length: 6.3, width: 2.4, height: 2.0 },
      licensePlate: "AB 123 CD",
      maxLoad: "6000",
      purchasePrice: "65000",
      lastMaintenanceDate: new Date("2024-01-15"),
      nextMaintenanceDate: new Date("2025-01-15"),
      image: "https://placehold.co/600x400/png?text=Ford+F350"
    });

    this.createMachine({
      type: "camion",
      brand: "Mercedes-Benz",
      model: "Actros 2645",
      year: 2020,
      hours: "65000",
      purchaseDate: new Date("2020-08-22"),
      serialNumber: "MB-ACT-123456",
      status: "activo",
      fuelType: "diesel",
      engineType: "OM 471",
      engineHp: 450,
      transmission: "PowerShift 3",
      weight: "8500",
      dimensions: { length: 7.2, width: 2.5, height: 3.8 },
      licensePlate: "CD 456 EF",
      maxLoad: "25000",
      purchasePrice: "125000",
      lastMaintenanceDate: new Date("2024-03-10"),
      nextMaintenanceDate: new Date("2025-03-10"),
      image: "https://placehold.co/600x400/png?text=Mercedes+Actros"
    });

    // Accesorios
    this.createMachine({
      type: "accesorio",
      brand: "John Deere",
      model: "Arado de 5 surcos",
      year: 2019,
      hours: "850",
      purchaseDate: new Date("2019-05-20"),
      serialNumber: "JD-ARADO-12345",
      status: "activo",
      weight: "980",
      dimensions: { length: 3.2, width: 2.8, height: 1.4 },
      attachments: ["tractores serie 6M"],
      purchasePrice: "12500",
      lastMaintenanceDate: new Date("2024-02-15"),
      nextMaintenanceDate: new Date("2025-02-15"),
      image: "https://placehold.co/600x400/png?text=Arado+JD"
    });

    this.createMachine({
      type: "accesorio",
      brand: "Kuhn",
      model: "Sembradora Multi-Drill",
      year: 2021,
      hours: "450",
      purchaseDate: new Date("2021-03-15"),
      serialNumber: "KUHN-SEM-54321",
      status: "activo",
      weight: "2200",
      dimensions: { length: 4.5, width: 3.0, height: 1.8 },
      attachments: ["tractores 100-150HP"],
      purchasePrice: "35000",
      lastMaintenanceDate: new Date("2024-01-10"),
      nextMaintenanceDate: new Date("2025-01-10"),
      image: "https://placehold.co/600x400/png?text=Sembradora+Kuhn"
    });

    // Add some maintenance records
    this.createMaintenance({
      machineId: 1,
      date: new Date("2023-07-15"),
      type: "oil_change",
      description: "Cambio de aceite programado",
      responsible: "Juan García",
      motorOil: true,
      motorOilQuantity: "15",
      oilFilter: true,
    });

    this.createMaintenance({
      machineId: 3,
      date: new Date("2023-08-02"),
      type: "filter_change",
      description: "Cambio de filtro de combustible",
      responsible: "Carlos López",
      fuelFilter: true,
    });

    this.createMaintenance({
      machineId: 2,
      date: new Date("2023-08-10"),
      type: "general_check",
      description: "Revisión general programada",
      responsible: "María Rodríguez",
    });

    // Add machine finances
    this.createMachineFinance({
      machineId: 1,
      date: new Date("2023-06-10"),
      type: "expense",
      concept: "Repuestos",
      amount: "2500.50",
    });

    this.createMachineFinance({
      machineId: 2,
      date: new Date("2023-06-15"),
      type: "expense",
      concept: "Combustible",
      amount: "3200.75",
    });

    // Initialize animals
    for (let i = 1; i <= 243; i++) {
      this.createAnimal({
        birthDate: new Date(2020 + Math.floor(Math.random() * 3), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        race: ["Aberdeen Angus", "Hereford", "Brahman", "Brangus"][Math.floor(Math.random() * 4)],
        description: `Animal #${i}`,
        cartagena: `A${String(i).padStart(3, '0')}`,
        color: ["Negro", "Marrón", "Blanco y negro", "Beige"][Math.floor(Math.random() * 4)],
        bodyCondition: ["Excelente", "Bueno", "Regular", "A mejorar"][Math.floor(Math.random() * 4)],
      });
    }
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentIds.user++;
    const now = new Date();
    // Ensure role is set if it's undefined
    const role = insertUser.role || "operator";
    const user: User = { ...insertUser, id, createdAt: now, role };
    this.users.set(id, user);
    return user;
  }

  // Machines
  async getMachines(): Promise<Machine[]> {
    return Array.from(this.machines.values());
  }

  async getMachine(id: number): Promise<Machine | undefined> {
    return this.machines.get(id);
  }

  async createMachine(insertMachine: InsertMachine): Promise<Machine> {
    const id = this.currentIds.machine++;
    const now = new Date();
    // Ensure hours is set to a string
    const hours = insertMachine.hours?.toString() || "0";
    const machine: Machine = { 
      ...insertMachine, 
      id, 
      createdAt: now, 
      updatedAt: now,
      hours 
    };
    this.machines.set(id, machine);
    return machine;
  }

  async updateMachine(id: number, updateData: Partial<InsertMachine>): Promise<Machine | undefined> {
    const machine = this.machines.get(id);
    if (!machine) return undefined;
    
    const updatedMachine: Machine = {
      ...machine,
      ...updateData,
      updatedAt: new Date(),
    };
    
    this.machines.set(id, updatedMachine);
    return updatedMachine;
  }

  async deleteMachine(id: number): Promise<boolean> {
    return this.machines.delete(id);
  }

  // Maintenance
  async getMaintenances(machineId?: number): Promise<Maintenance[]> {
    const maintenances = Array.from(this.maintenances.values());
    if (machineId) {
      return maintenances.filter(m => m.machineId === machineId);
    }
    return maintenances;
  }

  async getMaintenance(id: number): Promise<Maintenance | undefined> {
    return this.maintenances.get(id);
  }

  async createMaintenance(insertMaintenance: InsertMaintenance): Promise<Maintenance> {
    const id = this.currentIds.maintenance++;
    const now = new Date();
    const maintenance: Maintenance = { ...insertMaintenance, id, createdAt: now, updatedAt: now };
    this.maintenances.set(id, maintenance);
    return maintenance;
  }

  async updateMaintenance(id: number, updateData: Partial<InsertMaintenance>): Promise<Maintenance | undefined> {
    const maintenance = this.maintenances.get(id);
    if (!maintenance) return undefined;
    
    const updatedMaintenance: Maintenance = {
      ...maintenance,
      ...updateData,
      updatedAt: new Date(),
    };
    
    this.maintenances.set(id, updatedMaintenance);
    return updatedMaintenance;
  }

  async deleteMaintenance(id: number): Promise<boolean> {
    return this.maintenances.delete(id);
  }

  // Machine Finances
  async getMachineFinances(machineId?: number): Promise<MachineFinance[]> {
    const finances = Array.from(this.machineFinances.values());
    if (machineId) {
      return finances.filter(f => f.machineId === machineId);
    }
    return finances;
  }

  async getMachineFinance(id: number): Promise<MachineFinance | undefined> {
    return this.machineFinances.get(id);
  }

  async createMachineFinance(insertFinance: InsertMachineFinance): Promise<MachineFinance> {
    const id = this.currentIds.machineFinance++;
    const now = new Date();
    const finance: MachineFinance = { ...insertFinance, id, createdAt: now };
    this.machineFinances.set(id, finance);
    return finance;
  }

  async deleteMachineFinance(id: number): Promise<boolean> {
    return this.machineFinances.delete(id);
  }

  // Animals
  async getAnimals(): Promise<Animal[]> {
    return Array.from(this.animals.values());
  }

  async getAnimal(id: number): Promise<Animal | undefined> {
    return this.animals.get(id);
  }

  async createAnimal(insertAnimal: InsertAnimal): Promise<Animal> {
    const id = this.currentIds.animal++;
    const now = new Date();
    const animal: Animal = { ...insertAnimal, id, createdAt: now, updatedAt: now };
    this.animals.set(id, animal);
    return animal;
  }

  async updateAnimal(id: number, updateData: Partial<InsertAnimal>): Promise<Animal | undefined> {
    const animal = this.animals.get(id);
    if (!animal) return undefined;
    
    const updatedAnimal: Animal = {
      ...animal,
      ...updateData,
      updatedAt: new Date(),
    };
    
    this.animals.set(id, updatedAnimal);
    return updatedAnimal;
  }

  async deleteAnimal(id: number): Promise<boolean> {
    return this.animals.delete(id);
  }

  // Animal Veterinary
  async getAnimalVeterinary(animalId?: number): Promise<AnimalVeterinary[]> {
    const records = Array.from(this.animalVeterinary.values());
    if (animalId) {
      return records.filter(r => r.animalId === animalId);
    }
    return records;
  }

  async createAnimalVeterinary(insertRecord: InsertAnimalVeterinary): Promise<AnimalVeterinary> {
    const id = this.currentIds.animalVeterinary++;
    const now = new Date();
    const record: AnimalVeterinary = { ...insertRecord, id, createdAt: now };
    this.animalVeterinary.set(id, record);
    return record;
  }

  async deleteAnimalVeterinary(id: number): Promise<boolean> {
    return this.animalVeterinary.delete(id);
  }

  // Animal Finances
  async getAnimalFinances(animalId?: number): Promise<AnimalFinance[]> {
    const finances = Array.from(this.animalFinances.values());
    if (animalId) {
      return finances.filter(f => f.animalId === animalId);
    }
    return finances;
  }

  async createAnimalFinance(insertFinance: InsertAnimalFinance): Promise<AnimalFinance> {
    const id = this.currentIds.animalFinance++;
    const now = new Date();
    const finance: AnimalFinance = { ...insertFinance, id, createdAt: now };
    this.animalFinances.set(id, finance);
    return finance;
  }

  async deleteAnimalFinance(id: number): Promise<boolean> {
    return this.animalFinances.delete(id);
  }

  // Pastures
  async getPastures(): Promise<Pasture[]> {
    return Array.from(this.pastures.values());
  }

  async getPasture(id: number): Promise<Pasture | undefined> {
    return this.pastures.get(id);
  }

  async createPasture(insertPasture: InsertPasture): Promise<Pasture> {
    const id = this.currentIds.pasture++;
    const now = new Date();
    const pasture: Pasture = { ...insertPasture, id, createdAt: now, updatedAt: now };
    this.pastures.set(id, pasture);
    return pasture;
  }

  async updatePasture(id: number, updateData: Partial<InsertPasture>): Promise<Pasture | undefined> {
    const pasture = this.pastures.get(id);
    if (!pasture) return undefined;
    
    const updatedPasture: Pasture = {
      ...pasture,
      ...updateData,
      updatedAt: new Date(),
    };
    
    this.pastures.set(id, updatedPasture);
    return updatedPasture;
  }

  async deletePasture(id: number): Promise<boolean> {
    return this.pastures.delete(id);
  }

  // Pasture Finances
  async getPastureFinances(pastureId?: number): Promise<PastureFinance[]> {
    const finances = Array.from(this.pastureFinances.values());
    if (pastureId) {
      return finances.filter(f => f.pastureId === pastureId);
    }
    return finances;
  }

  async createPastureFinance(insertFinance: InsertPastureFinance): Promise<PastureFinance> {
    const id = this.currentIds.pastureFinance++;
    const now = new Date();
    const finance: PastureFinance = { ...insertFinance, id, createdAt: now };
    this.pastureFinances.set(id, finance);
    return finance;
  }

  async deletePastureFinance(id: number): Promise<boolean> {
    return this.pastureFinances.delete(id);
  }

  // Investments
  async getInvestments(): Promise<Investment[]> {
    return Array.from(this.investments.values());
  }

  async getInvestment(id: number): Promise<Investment | undefined> {
    return this.investments.get(id);
  }

  async createInvestment(insertInvestment: InsertInvestment): Promise<Investment> {
    const id = this.currentIds.investment++;
    const now = new Date();
    const investment: Investment = { ...insertInvestment, id, createdAt: now };
    this.investments.set(id, investment);
    return investment;
  }

  async deleteInvestment(id: number): Promise<boolean> {
    return this.investments.delete(id);
  }

  // Services
  async getServices(): Promise<Service[]> {
    return Array.from(this.services.values());
  }

  async createService(insertService: InsertService): Promise<Service> {
    const id = this.currentIds.service++;
    const now = new Date();
    const service: Service = { ...insertService, id, createdAt: now };
    this.services.set(id, service);
    return service;
  }

  async deleteService(id: number): Promise<boolean> {
    return this.services.delete(id);
  }

  // Taxes
  async getTaxes(): Promise<Tax[]> {
    return Array.from(this.taxes.values());
  }

  async createTax(insertTax: InsertTax): Promise<Tax> {
    const id = this.currentIds.tax++;
    const now = new Date();
    const tax: Tax = { ...insertTax, id, createdAt: now };
    this.taxes.set(id, tax);
    return tax;
  }

  async deleteTax(id: number): Promise<boolean> {
    return this.taxes.delete(id);
  }

  // Repairs
  async getRepairs(): Promise<Repair[]> {
    return Array.from(this.repairs.values());
  }

  async createRepair(insertRepair: InsertRepair): Promise<Repair> {
    const id = this.currentIds.repair++;
    const now = new Date();
    const repair: Repair = { ...insertRepair, id, createdAt: now };
    this.repairs.set(id, repair);
    return repair;
  }

  async deleteRepair(id: number): Promise<boolean> {
    return this.repairs.delete(id);
  }

  // Salaries
  async getSalaries(): Promise<Salary[]> {
    return Array.from(this.salaries.values());
  }

  async createSalary(insertSalary: InsertSalary): Promise<Salary> {
    const id = this.currentIds.salary++;
    const now = new Date();
    const salary: Salary = { ...insertSalary, id, createdAt: now };
    this.salaries.set(id, salary);
    return salary;
  }

  async deleteSalary(id: number): Promise<boolean> {
    return this.salaries.delete(id);
  }

  // Capital
  async getCapital(): Promise<Capital[]> {
    return Array.from(this.capitals.values());
  }

  async createCapital(insertCapital: InsertCapital): Promise<Capital> {
    const id = this.currentIds.capital++;
    const now = new Date();
    const capital: Capital = { ...insertCapital, id, createdAt: now };
    this.capitals.set(id, capital);
    return capital;
  }

  async deleteCapital(id: number): Promise<boolean> {
    return this.capitals.delete(id);
  }

  // Dashboard
  async getDashboardStats(): Promise<{
    machineCount: number;
    animalCount: number;
    monthlyIncome: number;
    monthlyExpense: number;
  }> {
    const machines = await this.getMachines();
    const animals = await this.getAnimals();
    
    // Calculate financial stats for the current month
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const machineFinances = await this.getMachineFinances();
    const animalFinances = await this.getAnimalFinances();
    const pastureFinances = await this.getPastureFinances();
    
    // Combine all finances
    const allFinances = [
      ...machineFinances,
      ...animalFinances,
      ...pastureFinances,
    ];
    
    // Filter for current month
    const currentMonthFinances = allFinances.filter(f => 
      new Date(f.date) >= firstDayOfMonth && new Date(f.date) <= now
    );
    
    // Calculate totals
    let monthlyIncome = 0;
    let monthlyExpense = 0;
    
    currentMonthFinances.forEach(finance => {
      if (finance.type === 'income') {
        monthlyIncome += Number(finance.amount);
      } else {
        monthlyExpense += Number(finance.amount);
      }
    });
    
    return {
      machineCount: machines.length,
      animalCount: animals.length,
      monthlyIncome,
      monthlyExpense,
    };
  }

  async getUpcomingMaintenances(): Promise<Maintenance[]> {
    const maintenances = await this.getMaintenances();
    
    // Sort by date, most recent first
    return maintenances
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5);
  }

  async getRecentTransactions(): Promise<(MachineFinance | AnimalFinance | PastureFinance)[]> {
    const machineFinances = await this.getMachineFinances();
    const animalFinances = await this.getAnimalFinances();
    const pastureFinances = await this.getPastureFinances();
    
    // Combine all finances
    const allFinances = [
      ...machineFinances,
      ...animalFinances,
      ...pastureFinances,
    ];
    
    // Sort by date, most recent first
    return allFinances
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }
}

export const storage = new MemStorage();
