import {
  users, User, InsertUser,
  machines, Machine, InsertMachine,
  maintenance, Maintenance, InsertMaintenance,
  machineFinances, MachineFinance, InsertMachineFinance,
  animals, Animal, InsertAnimal,
  animalVeterinary, AnimalVeterinary, InsertAnimalVeterinary,
  animalFinances, AnimalFinance, InsertAnimalFinance,
  pastures, Pasture, InsertPasture,
  pastureWorks, PastureWork, InsertPastureWork,
  pastureFinances, PastureFinance, InsertPastureFinance,
  investments, Investment, InsertInvestment,
  services, Service, InsertService,
  taxes, Tax, InsertTax,
  repairs, Repair, InsertRepair,
  salaries, Salary, InsertSalary,
  capital, Capital, InsertCapital,
  animalWeights, AnimalWeight, InsertAnimalWeight
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
  
  // Warehouse/Product Management
  getProducts(): Promise<any[]>;
  updateProductStock(productName: string, quantity: number): Promise<boolean>;
  
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
  
  // Pasture Works (Trabajos agrícolas)
  getPastureWorks(pastureId?: number): Promise<PastureWork[]>;
  getPastureWork(id: number): Promise<PastureWork | undefined>;
  createPastureWork(work: InsertPastureWork): Promise<PastureWork>;
  deletePastureWork(id: number): Promise<boolean>;
  
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
  
  // Animal Weights
  getAnimalWeights(animalId?: number): Promise<AnimalWeight[]>;
  createAnimalWeight(weight: InsertAnimalWeight): Promise<AnimalWeight>;
  deleteAnimalWeight(id: number): Promise<boolean>;
  
  // Dashboard
  getDashboardStats(): Promise<{
    machineCount: number;
    animalCount: number;
    pastureCount: number;
    monthlyIncome: number;
    monthlyExpense: number;
  }>;
  getUpcomingMaintenances(): Promise<Maintenance[]>;
  getRecentTransactions(): Promise<(MachineFinance | AnimalFinance | PastureFinance)[]>;
  
  // Notificaciones Push
  addPushSubscription(userId: string, subscription: any): Promise<boolean>;
  removePushSubscription(userId: string, endpoint: string): Promise<boolean>;
  getUserPushSubscriptions(userId: string): Promise<any[]>;
  getAllPushSubscriptions(): Promise<Record<string, any[]>>;
  updateNotificationPreferences(userId: string, preferences: any): Promise<boolean>;
  getNotificationPreferences(userId: string): Promise<any>;
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
  private animalWeightsHistory: Map<number, AnimalWeight>;
  
  // Almacenamiento para notificaciones push
  private pushSubscriptions: Record<string, any[]> = {};
  private notificationPreferences: Record<string, any> = {};

  private currentIds: {
    user: number;
    machine: number;
    maintenance: number;
    machineFinance: number;
    animal: number;
    animalVeterinary: number;
    animalFinance: number;
    pasture: number;
    pastureWork: number;
    pastureFinance: number;
    investment: number;
    service: number;
    tax: number;
    repair: number;
    salary: number;
    capital: number;
  };

  private pastureWorks: Map<number, PastureWork>;
    
  constructor() {
    this.users = new Map();
    this.machines = new Map();
    this.maintenances = new Map();
    this.machineFinances = new Map();
    this.animals = new Map();
    this.animalVeterinary = new Map();
    this.animalFinances = new Map();
    this.pastures = new Map();
    this.pastureWorks = new Map();
    this.pastureFinances = new Map();
    this.investments = new Map();
    this.services = new Map();
    this.taxes = new Map();
    this.repairs = new Map();
    this.salaries = new Map();
    this.capitals = new Map();
    this.animalWeightsHistory = new Map();

    this.currentIds = {
      user: 1,
      machine: 1,
      maintenance: 1,
      machineFinance: 1,
      animal: 1,
      animalVeterinary: 1,
      animalFinance: 1,
      pasture: 1,
      pastureWork: 1,
      pastureFinance: 1,
      investment: 1,
      service: 1,
      tax: 1,
      repair: 1,
      salary: 1,
      capital: 1,
      animalWeight: 1,
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
    // Primero verificamos si la máquina existe
    const machine = this.machines.get(id);
    if (!machine) return false;

    try {
      // Eliminamos todos los registros de mantenimiento asociados a esta máquina
      const maintenanceEntries = Array.from(this.maintenances.entries());
      for (const [maintId, maint] of maintenanceEntries) {
        if (maint.machineId === id) {
          this.maintenances.delete(maintId);
        }
      }

      // Eliminamos todos los registros financieros asociados a esta máquina
      const financeEntries = Array.from(this.machineFinances.entries());
      for (const [financeId, finance] of financeEntries) {
        if (finance.machineId === id) {
          this.machineFinances.delete(financeId);
        }
      }

      // Eliminamos todos los trabajos agrícolas asociados a esta máquina
      const workEntries = Array.from(this.pastureWorks.entries());
      for (const [workId, work] of workEntries) {
        if (work.machineId === id) {
          this.pastureWorks.delete(workId);
        }
      }

      // Finalmente eliminamos la máquina
      return this.machines.delete(id);
    } catch (error) {
      console.error(`Error al eliminar la máquina con ID ${id}:`, error);
      return false;
    }
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
  
  // Warehouse/Product Management
  private products = [
    {
      id: 1,
      name: "Aceite de motor",
      category: "fluidos",
      quantity: 8,
      unit: "litros",
      unitPrice: 2400,
    },
    {
      id: 2,
      name: "Aceite hidráulico",
      category: "fluidos",
      quantity: 5,
      unit: "litros",
      unitPrice: 2000,
    },
    {
      id: 3,
      name: "Refrigerante",
      category: "fluidos",
      quantity: 10,
      unit: "litros",
      unitPrice: 1500,
    },
    {
      id: 16,
      name: "Gas Oil",
      category: "combustibles",
      quantity: 250,
      unit: "litros",
      unitPrice: 750,
    },
    {
      id: 17,
      name: "Nafta",
      category: "combustibles",
      quantity: 80,
      unit: "litros",
      unitPrice: 850,
    },
    {
      id: 18,
      name: "Rollos de hilo",
      category: "forraje",
      quantity: 15,
      unit: "rollos",
      unitPrice: 4500,
    },
    {
      id: 4,
      name: "Filtro de aceite",
      category: "repuestos",
      quantity: 4,
      unit: "unidades",
      unitPrice: 1800,
    },
    {
      id: 5,
      name: "Filtro hidráulico",
      category: "repuestos",
      quantity: 3,
      unit: "unidades",
      unitPrice: 2200,
    },
    {
      id: 6,
      name: "Filtro de combustible",
      category: "repuestos",
      quantity: 5,
      unit: "unidades",
      unitPrice: 1500,
    },
    {
      id: 7,
      name: "Filtro de aire",
      category: "repuestos",
      quantity: 2,
      unit: "unidades",
      unitPrice: 2100,
    },
    {
      id: 8,
      name: "Grasa lubricante",
      category: "fluidos",
      quantity: 6,
      unit: "kg",
      unitPrice: 1200,
    },
    {
      id: 9,
      name: "Llaves ajustables",
      category: "herramientas",
      quantity: 2,
      unit: "unidades",
      unitPrice: 2500,
    },
    {
      id: 10,
      name: "Destornilladores",
      category: "herramientas",
      quantity: 5,
      unit: "unidades",
      unitPrice: 500,
    },
    {
      id: 11,
      name: "Cuerda para rollos",
      category: "forraje",
      quantity: 300,
      unit: "metros",
      unitPrice: 15,
    },
    {
      id: 12,
      name: "Maíz para ganado",
      category: "forraje",
      quantity: 500,
      unit: "kg",
      unitPrice: 75,
    },
    {
      id: 13,
      name: "Semillas de pasto",
      category: "insumos",
      quantity: 50,
      unit: "kg",
      unitPrice: 300,
    },
    {
      id: 14,
      name: "Fertilizante",
      category: "insumos",
      quantity: 200,
      unit: "kg",
      unitPrice: 120,
    },
    {
      id: 15,
      name: "Servicio Mecánico",
      category: "servicios",
      quantity: 20,
      unit: "horas",
      unitPrice: 2500,
    },
  ];
  
  async getProducts(): Promise<any[]> {
    // Calcular totalPrice para cada producto y devolver una copia para evitar modificaciones directas
    return this.products.map(product => ({
      ...product,
      totalPrice: product.quantity * product.unitPrice
    }));
  }
  
  async updateProductStock(productName: string, quantity: number): Promise<boolean> {
    // Buscar el producto por nombre
    const productIndex = this.products.findIndex(product => product.name === productName);
    if (productIndex === -1) {
      console.error(`Producto no encontrado: ${productName}`);
      return false;
    }
    
    // Actualizar la cantidad
    const currentQuantity = this.products[productIndex].quantity;
    const newQuantity = currentQuantity + quantity;
    
    // No permitir cantidades negativas
    if (newQuantity < 0) {
      console.error(`Stock insuficiente para ${productName}: ${currentQuantity} disponibles, se intentó restar ${Math.abs(quantity)}`);
      return false;
    }
    
    // Actualizar el stock
    this.products[productIndex].quantity = newQuantity;
    console.log(`Stock actualizado: ${productName} - ${currentQuantity} -> ${newQuantity}`);
    return true;
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

  // Pasture Works (Trabajos agrícolas)
  async getPastureWorks(pastureId?: number): Promise<PastureWork[]> {
    const works = Array.from(this.pastureWorks.values());
    if (pastureId) {
      return works.filter(w => w.pastureId === pastureId);
    }
    return works;
  }

  async getPastureWork(id: number): Promise<PastureWork | undefined> {
    return this.pastureWorks.get(id);
  }

  async createPastureWork(insertWork: InsertPastureWork): Promise<PastureWork> {
    const id = this.currentIds.pastureWork++;
    const now = new Date();
    const work: PastureWork = { ...insertWork, id, createdAt: now };
    this.pastureWorks.set(id, work);
    return work;
  }

  async deletePastureWork(id: number): Promise<boolean> {
    return this.pastureWorks.delete(id);
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
  
  // Métodos para historial de pesos de animales
  async getAnimalWeights(animalId?: number): Promise<AnimalWeight[]> {
    const weights = Array.from(this.animalWeightsHistory.values());
    if (animalId !== undefined) {
      return weights.filter(weight => weight.animalId === animalId)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
    return weights.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
  
  async createAnimalWeight(insertWeight: InsertAnimalWeight): Promise<AnimalWeight> {
    const id = this.currentIds.animalWeight++;
    const now = new Date();
    
    const weight: AnimalWeight = { ...insertWeight, id, createdAt: now };
    this.animalWeightsHistory.set(id, weight);
    
    return weight;
  }
  
  async deleteAnimalWeight(id: number): Promise<boolean> {
    return this.animalWeightsHistory.delete(id);
  }

  // Dashboard
  async getDashboardStats(): Promise<{
    machineCount: number;
    animalCount: number;
    pastureCount: number;
    monthlyIncome: number;
    monthlyExpense: number;
  }> {
    const machines = await this.getMachines();
    const animals = await this.getAnimals();
    const pastures = await this.getPastures();
    
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
      pastureCount: pastures.length,
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
  
  // Implementación de métodos para notificaciones push
  async addPushSubscription(userId: string, subscription: any): Promise<boolean> {
    try {
      // Inicializar el array de suscripciones si no existe
      if (!this.pushSubscriptions[userId]) {
        this.pushSubscriptions[userId] = [];
      }
      
      // Verificar si la suscripción ya existe para evitar duplicados
      const exists = this.pushSubscriptions[userId].some(
        sub => sub.endpoint === subscription.endpoint
      );
      
      if (!exists) {
        this.pushSubscriptions[userId].push(subscription);
      }
      
      return true;
    } catch (error) {
      console.error('Error al guardar suscripción push:', error);
      return false;
    }
  }
  
  async removePushSubscription(userId: string, endpoint: string): Promise<boolean> {
    try {
      if (!this.pushSubscriptions[userId]) {
        return false;
      }
      
      // Filtrar la suscripción con el endpoint especificado
      this.pushSubscriptions[userId] = this.pushSubscriptions[userId].filter(
        sub => sub.endpoint !== endpoint
      );
      
      return true;
    } catch (error) {
      console.error('Error al eliminar suscripción push:', error);
      return false;
    }
  }
  
  async getUserPushSubscriptions(userId: string): Promise<any[]> {
    return this.pushSubscriptions[userId] || [];
  }
  
  async getAllPushSubscriptions(): Promise<Record<string, any[]>> {
    return this.pushSubscriptions;
  }
  
  async updateNotificationPreferences(userId: string, preferences: any): Promise<boolean> {
    try {
      this.notificationPreferences[userId] = {
        ...(this.notificationPreferences[userId] || {}),
        ...preferences
      };
      
      return true;
    } catch (error) {
      console.error('Error al actualizar preferencias de notificación:', error);
      return false;
    }
  }
  
  async getNotificationPreferences(userId: string): Promise<any> {
    // Valores predeterminados si no hay preferencias establecidas
    const defaultPreferences = {
      animalsAlerts: true,
      machinesAlerts: true,
      financialAlerts: true,
      pasturesAlerts: true,
      weatherAlerts: true,
      maintenanceReminders: true,
      enablePushNotifications: true
    };
    
    return this.notificationPreferences[userId] || defaultPreferences;
  }
}

// Inicializar el almacenamiento
export const storage = new MemStorage();

// Variable para controlar si los datos de muestra ya fueron cargados
let sampleDataLoaded = false;

// Cargar datos de ejemplo solo si no se han cargado antes
async function loadSampleData() {
  // Si los datos ya fueron cargados, no se vuelven a cargar
  if (sampleDataLoaded) {
    console.log("[Sample Data] Los datos de muestra ya fueron cargados anteriormente. Omitiendo carga.");
    return;
  }
  
  try {
    // Verificar si ya existen animales en el sistema
    const existingAnimals = await storage.getAnimals();
    if (existingAnimals.length > 0) {
      console.log(`[Sample Data] Se encontraron ${existingAnimals.length} animales existentes. No se cargarán datos de muestra.`);
      sampleDataLoaded = true;
      return;
    }
    
    // Crear máquinas de ejemplo
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
    
    // Tractores adicionales
    const tractor1 = await storage.createMachine({
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
    });
    console.log(`[Sample Data] Máquina creada: ${tractor1.brand} ${tractor1.model} (ID: ${tractor1.id})`);
    
    const tractor2 = await storage.createMachine({
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
    });
    console.log(`[Sample Data] Máquina creada: ${tractor2.brand} ${tractor2.model} (ID: ${tractor2.id})`);
    
    // Camiones
    const camion1 = await storage.createMachine({
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
    });
    console.log(`[Sample Data] Máquina creada: ${camion1.brand} ${camion1.model} (ID: ${camion1.id})`);
    
    // Topadoras
    const topadora = await storage.createMachine({
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
    });
    console.log(`[Sample Data] Máquina creada: ${topadora.brand} ${topadora.model} (ID: ${topadora.id})`);
    
    // Vehículos
    const vehiculo = await storage.createMachine({
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
    });
    console.log(`[Sample Data] Máquina creada: ${vehiculo.brand} ${vehiculo.model} (ID: ${vehiculo.id})`);
    
    // Accesorios
    const accesorio = await storage.createMachine({
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
    });
    console.log(`[Sample Data] Máquina creada: ${accesorio.brand} ${accesorio.model} (ID: ${accesorio.id})`);

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
    // Marcar que los datos se han cargado
    sampleDataLoaded = true;
  } catch (error) {
    console.error("[Sample Data] Error al crear datos de ejemplo:", error);
  }
}

// Cargar datos de ejemplo cuando se inicia el servidor
loadSampleData();

// Actualizar animales con datos aleatorios después de cargar
setTimeout(async () => {
  // Si no hay datos de muestra cargados, no actualizar animales
  if (!sampleDataLoaded) {
    console.log("[Sample Data] No se han cargado datos de muestra. Omitiendo actualización de animales.");
    return;
  }
  
  try {
    // Verificar si hay animales en el sistema antes de intentar actualizarlos
    const animalsCheck = await storage.getAnimals();
    if (animalsCheck.length === 0) {
      console.log("[Sample Data] No hay animales para actualizar con datos aleatorios.");
      return;
    }
    
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
