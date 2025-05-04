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
  capital, Capital, InsertCapital,
  products, Product, InsertProduct
} from "@shared/schema";

export interface IStorage {
  // Products
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  updateProductStock(id: number, quantity: number): Promise<Product | undefined>;

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
  private products: Map<number, Product>;

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
    product: number;
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
    this.products = new Map();

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
      product: 1,
    };

    // Initialize with a default admin user
    this.createUser({
      username: "admin@agrogest.com",
      password: "$2b$10$eCJJFfGJXRrQGPc7KZbhfeoZXmn1tdGQM.8gGXqUEFSc40KWjN6fC", // This is "password" hashed
      fullName: "Admin User",
      role: "admin",
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

// Inicializar el almacenamiento
export const storage = new MemStorage();

// Cargar datos de ejemplo
async function loadSampleData() {
  try {
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
    console.log(`[Sample Data] Máquina creada: ${machine.brand} ${machine.model} (ID: ${machine.id})`);

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
    console.log(`[Sample Data] Mantenimiento 1 creado: ${maintenance1.type} (ID: ${maintenance1.id})`);

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
    console.log(`[Sample Data] Mantenimiento 2 creado: ${maintenance2.type} (ID: ${maintenance2.id})`);

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
    console.log(`[Sample Data] Mantenimiento 3 creado: ${maintenance3.type} (ID: ${maintenance3.id})`);

    // Crear registros financieros
    const finance1 = await storage.createMachineFinance({
      machineId: machine.id,
      date: new Date(),
      type: "expense",
      concept: "Combustible",
      amount: "150.00",
    });
    console.log(`[Sample Data] Finanza 1 creada: ${finance1.concept} (ID: ${finance1.id})`);

    const finance2 = await storage.createMachineFinance({
      machineId: machine.id,
      date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 días atrás
      type: "expense",
      concept: "Repuestos",
      amount: "350.00",
    });
    console.log(`[Sample Data] Finanza 2 creada: ${finance2.concept} (ID: ${finance2.id})`);

    console.log("[Sample Data] Datos de ejemplo cargados exitosamente.");
  } catch (error) {
    console.error("[Sample Data] Error al crear datos de ejemplo:", error);
  }
}

// Cargar datos de ejemplo cuando se inicia el servidor
loadSampleData();

// Actualizar animales con datos aleatorios después de cargar
setTimeout(async () => {
  try {
    const categories = ["vaca", "vaquillona", "toro", "novillo", "ternero", "ternera"];
    
    // Estados reproductivos y sus categorías aplicables
    const reproductiveStates: Record<string, string[]> = {
      vaca: ["vacia", "servicio", "prenada", "parida"],
      vaquillona: ["vacia", "servicio", "prenada", "parida"],
      toro: ["en_servicio", "no_en_servicio"],
      novillo: ["no_aplica"],
      ternero: ["no_aplica"],
      ternera: ["no_aplica"]
    };
    
    // Colores de caravana
    const cartagenaColors = ["rojo", "amarillo", "azul", "verde", "violeta", "naranja", "rosa", "blanco", "negro"];
    
    // Condiciones corporales
    const bodyConditions = ["1", "1.5", "2", "2.5", "3", "3.5", "4", "4.5", "5"];
    
    // Función para obtener un elemento aleatorio de un array
    function getRandomItem<T>(array: T[]): T {
      return array[Math.floor(Math.random() * array.length)];
    }
    
    // Función para generar una fecha aleatoria entre dos fechas
    function getRandomDate(start: Date, end: Date): Date {
      return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    }
    
    // Obtener todos los animales
    const animals = await storage.getAnimals();
    console.log(`[Sample Data] Actualizando ${animals.length} animales con datos aleatorios...`);
    
    for (const animal of animals) {
      // Asignar categoría aleatoria
      const category = getRandomItem(categories);
      
      // Asignar estado reproductivo aleatorio según la categoría
      const reproductiveStatus = getRandomItem(reproductiveStates[category as keyof typeof reproductiveStates]);
      
      // Asignar color de caravana aleatorio
      const cartagenaColor = getRandomItem(cartagenaColors);
      
      // Asignar condición corporal aleatoria
      const bodyCondition = getRandomItem(bodyConditions);
      
      // Asignar ubicación aleatoria
      const locations = ["Potrero Norte", "Potrero Sur", "Corral 1", "Corral 2", "Campo nuevo", "Lote 5", "Potrero Central"];
      const location = getRandomItem(locations);
      
      // Asignar peso aleatorio
      const currentWeight = (Math.floor(Math.random() * 500) + 200).toString(); // Entre 200 y 700 kg
      
      // Fecha de última pesada (entre 1 y 90 días atrás)
      const now = new Date();
      const lastWeightDate = getRandomDate(new Date(now.setDate(now.getDate() - 90)), new Date());
      
      // Para animales preñados, fecha estimada de parto (entre 30 y 270 días en el futuro)
      let expectedDeliveryDate = null;
      if (reproductiveStatus === "prenada") {
        const today = new Date();
        expectedDeliveryDate = getRandomDate(
          new Date(today.setDate(today.getDate() + 30)), 
          new Date(today.setDate(today.getDate() + 240))
        );
      }
      
      // Actualizar el animal
      await storage.updateAnimal(animal.id, {
        category,
        reproductiveStatus,
        cartagenaColor,
        bodyCondition,
        location,
        currentWeight,
        lastWeightDate,
        expectedDeliveryDate,
        // Añadir padres aleatorios para algunos animales (50% de probabilidad)
        fatherCartagena: Math.random() > 0.5 ? `T${Math.floor(Math.random() * 100)}` : "",
        motherCartagena: Math.random() > 0.5 ? `V${Math.floor(Math.random() * 500)}` : "",
      });
    }
    
    console.log("[Sample Data] Datos aleatorios de animales actualizados exitosamente.");
  } catch (error) {
    console.error("[Sample Data] Error al actualizar datos de animales:", error);
  }
}, 5000); // Esperar 5 segundos para asegurarse de que los animales se han cargado
