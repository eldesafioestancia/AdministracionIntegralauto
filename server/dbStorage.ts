import { db } from "./db";
import { IStorage } from "./storage";
import { eq, desc } from "drizzle-orm";
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
  capital, Capital, InsertCapital
} from "@shared/schema";

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Machines
  async getMachines(): Promise<Machine[]> {
    return await db.select().from(machines);
  }

  async getMachine(id: number): Promise<Machine | undefined> {
    const [machine] = await db.select().from(machines).where(eq(machines.id, id));
    return machine || undefined;
  }

  async createMachine(insertMachine: InsertMachine): Promise<Machine> {
    const [machine] = await db
      .insert(machines)
      .values(insertMachine)
      .returning();
    return machine;
  }

  async updateMachine(id: number, updateData: Partial<InsertMachine>): Promise<Machine | undefined> {
    const [machine] = await db
      .update(machines)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(machines.id, id))
      .returning();
    return machine || undefined;
  }

  async deleteMachine(id: number): Promise<boolean> {
    const result = await db.delete(machines).where(eq(machines.id, id));
    return result.count > 0;
  }

  // Maintenance
  async getMaintenances(machineId?: number): Promise<Maintenance[]> {
    if (machineId) {
      return await db.select().from(maintenance).where(eq(maintenance.machineId, machineId));
    }
    return await db.select().from(maintenance);
  }

  async getMaintenance(id: number): Promise<Maintenance | undefined> {
    const [item] = await db.select().from(maintenance).where(eq(maintenance.id, id));
    return item || undefined;
  }

  async createMaintenance(insertMaintenance: InsertMaintenance): Promise<Maintenance> {
    const [item] = await db
      .insert(maintenance)
      .values(insertMaintenance)
      .returning();
    return item;
  }

  async updateMaintenance(id: number, updateData: Partial<InsertMaintenance>): Promise<Maintenance | undefined> {
    const [item] = await db
      .update(maintenance)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(maintenance.id, id))
      .returning();
    return item || undefined;
  }

  async deleteMaintenance(id: number): Promise<boolean> {
    const result = await db.delete(maintenance).where(eq(maintenance.id, id));
    return result.count > 0;
  }

  // Warehouse/Product Management
  // Simplemente reutilizaremos el código existente ya que no hay tabla de productos aún
  private products = [
    {
      id: 1,
      name: "Aceite de motor",
      category: "fluidos",
      quantity: 8,
      unit: "litros",
      unitPrice: 2400,
    },
    // ... (rest of the products from MemStorage)
  ];
  
  async getProducts(): Promise<any[]> {
    return this.products.map(product => ({
      ...product,
      totalPrice: product.quantity * product.unitPrice
    }));
  }
  
  async updateProductStock(productName: string, quantity: number): Promise<boolean> {
    const productIndex = this.products.findIndex(product => product.name === productName);
    if (productIndex === -1) {
      return false;
    }
    
    const currentQuantity = this.products[productIndex].quantity;
    const newQuantity = currentQuantity + quantity;
    
    if (newQuantity < 0) {
      return false;
    }
    
    this.products[productIndex].quantity = newQuantity;
    return true;
  }

  // Machine Finances
  async getMachineFinances(machineId?: number): Promise<MachineFinance[]> {
    if (machineId) {
      return await db.select().from(machineFinances).where(eq(machineFinances.machineId, machineId));
    }
    return await db.select().from(machineFinances);
  }

  async getMachineFinance(id: number): Promise<MachineFinance | undefined> {
    const [item] = await db.select().from(machineFinances).where(eq(machineFinances.id, id));
    return item || undefined;
  }

  async createMachineFinance(insertFinance: InsertMachineFinance): Promise<MachineFinance> {
    const [item] = await db
      .insert(machineFinances)
      .values(insertFinance)
      .returning();
    return item;
  }

  async deleteMachineFinance(id: number): Promise<boolean> {
    const result = await db.delete(machineFinances).where(eq(machineFinances.id, id));
    return result.count > 0;
  }

  // Animals
  async getAnimals(): Promise<Animal[]> {
    return await db.select().from(animals);
  }

  async getAnimal(id: number): Promise<Animal | undefined> {
    const [animal] = await db.select().from(animals).where(eq(animals.id, id));
    return animal || undefined;
  }

  async createAnimal(insertAnimal: InsertAnimal): Promise<Animal> {
    const [animal] = await db
      .insert(animals)
      .values(insertAnimal)
      .returning();
    return animal;
  }

  async updateAnimal(id: number, updateData: Partial<InsertAnimal>): Promise<Animal | undefined> {
    const [animal] = await db
      .update(animals)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(animals.id, id))
      .returning();
    return animal || undefined;
  }

  async deleteAnimal(id: number): Promise<boolean> {
    const result = await db.delete(animals).where(eq(animals.id, id));
    return result.count > 0;
  }

  // Animal Veterinary
  async getAnimalVeterinary(animalId?: number): Promise<AnimalVeterinary[]> {
    if (animalId) {
      return await db.select().from(animalVeterinary).where(eq(animalVeterinary.animalId, animalId));
    }
    return await db.select().from(animalVeterinary);
  }

  async createAnimalVeterinary(record: InsertAnimalVeterinary): Promise<AnimalVeterinary> {
    const [item] = await db
      .insert(animalVeterinary)
      .values(record)
      .returning();
    return item;
  }

  async deleteAnimalVeterinary(id: number): Promise<boolean> {
    const result = await db.delete(animalVeterinary).where(eq(animalVeterinary.id, id));
    return result.count > 0;
  }

  // Animal Finances
  async getAnimalFinances(animalId?: number): Promise<AnimalFinance[]> {
    if (animalId) {
      return await db.select().from(animalFinances).where(eq(animalFinances.animalId, animalId));
    }
    return await db.select().from(animalFinances);
  }

  async createAnimalFinance(finance: InsertAnimalFinance): Promise<AnimalFinance> {
    const [item] = await db
      .insert(animalFinances)
      .values(finance)
      .returning();
    return item;
  }

  async deleteAnimalFinance(id: number): Promise<boolean> {
    const result = await db.delete(animalFinances).where(eq(animalFinances.id, id));
    return result.count > 0;
  }

  // Pastures
  async getPastures(): Promise<Pasture[]> {
    return await db.select().from(pastures);
  }

  async getPasture(id: number): Promise<Pasture | undefined> {
    const [pasture] = await db.select().from(pastures).where(eq(pastures.id, id));
    return pasture || undefined;
  }

  async createPasture(insertPasture: InsertPasture): Promise<Pasture> {
    const [pasture] = await db
      .insert(pastures)
      .values(insertPasture)
      .returning();
    return pasture;
  }

  async updatePasture(id: number, updateData: Partial<InsertPasture>): Promise<Pasture | undefined> {
    const [pasture] = await db
      .update(pastures)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(pastures.id, id))
      .returning();
    return pasture || undefined;
  }

  async deletePasture(id: number): Promise<boolean> {
    const result = await db.delete(pastures).where(eq(pastures.id, id));
    return result.count > 0;
  }

  // Pasture Works
  async getPastureWorks(pastureId?: number): Promise<PastureWork[]> {
    if (pastureId) {
      return await db.select().from(pastureWorks).where(eq(pastureWorks.pastureId, pastureId));
    }
    return await db.select().from(pastureWorks);
  }

  async getPastureWork(id: number): Promise<PastureWork | undefined> {
    const [work] = await db.select().from(pastureWorks).where(eq(pastureWorks.id, id));
    return work || undefined;
  }

  async createPastureWork(work: InsertPastureWork): Promise<PastureWork> {
    const [item] = await db
      .insert(pastureWorks)
      .values(work)
      .returning();
    return item;
  }

  async deletePastureWork(id: number): Promise<boolean> {
    const result = await db.delete(pastureWorks).where(eq(pastureWorks.id, id));
    return result.count > 0;
  }

  // Pasture Finances
  async getPastureFinances(pastureId?: number): Promise<PastureFinance[]> {
    if (pastureId) {
      return await db.select().from(pastureFinances).where(eq(pastureFinances.pastureId, pastureId));
    }
    return await db.select().from(pastureFinances);
  }

  async createPastureFinance(finance: InsertPastureFinance): Promise<PastureFinance> {
    const [item] = await db
      .insert(pastureFinances)
      .values(finance)
      .returning();
    return item;
  }

  async deletePastureFinance(id: number): Promise<boolean> {
    const result = await db.delete(pastureFinances).where(eq(pastureFinances.id, id));
    return result.count > 0;
  }

  // Investments
  async getInvestments(): Promise<Investment[]> {
    return await db.select().from(investments);
  }

  async getInvestment(id: number): Promise<Investment | undefined> {
    const [investment] = await db.select().from(investments).where(eq(investments.id, id));
    return investment || undefined;
  }

  async createInvestment(insertInvestment: InsertInvestment): Promise<Investment> {
    const [investment] = await db
      .insert(investments)
      .values(insertInvestment)
      .returning();
    return investment;
  }

  async deleteInvestment(id: number): Promise<boolean> {
    const result = await db.delete(investments).where(eq(investments.id, id));
    return result.count > 0;
  }

  // Services
  async getServices(): Promise<Service[]> {
    return await db.select().from(services);
  }

  async createService(insertService: InsertService): Promise<Service> {
    const [service] = await db
      .insert(services)
      .values(insertService)
      .returning();
    return service;
  }

  async deleteService(id: number): Promise<boolean> {
    const result = await db.delete(services).where(eq(services.id, id));
    return result.count > 0;
  }

  // Taxes
  async getTaxes(): Promise<Tax[]> {
    return await db.select().from(taxes);
  }

  async createTax(insertTax: InsertTax): Promise<Tax> {
    const [tax] = await db
      .insert(taxes)
      .values(insertTax)
      .returning();
    return tax;
  }

  async deleteTax(id: number): Promise<boolean> {
    const result = await db.delete(taxes).where(eq(taxes.id, id));
    return result.count > 0;
  }

  // Repairs
  async getRepairs(): Promise<Repair[]> {
    return await db.select().from(repairs);
  }

  async createRepair(insertRepair: InsertRepair): Promise<Repair> {
    const [repair] = await db
      .insert(repairs)
      .values(insertRepair)
      .returning();
    return repair;
  }

  async deleteRepair(id: number): Promise<boolean> {
    const result = await db.delete(repairs).where(eq(repairs.id, id));
    return result.count > 0;
  }

  // Salaries
  async getSalaries(): Promise<Salary[]> {
    return await db.select().from(salaries);
  }

  async createSalary(insertSalary: InsertSalary): Promise<Salary> {
    const [salary] = await db
      .insert(salaries)
      .values(insertSalary)
      .returning();
    return salary;
  }

  async deleteSalary(id: number): Promise<boolean> {
    const result = await db.delete(salaries).where(eq(salaries.id, id));
    return result.count > 0;
  }

  // Capital
  async getCapital(): Promise<Capital[]> {
    return await db.select().from(capital);
  }

  async createCapital(insertCapital: InsertCapital): Promise<Capital> {
    const [item] = await db
      .insert(capital)
      .values(insertCapital)
      .returning();
    return item;
  }

  async deleteCapital(id: number): Promise<boolean> {
    const result = await db.delete(capital).where(eq(capital.id, id));
    return result.count > 0;
  }

  // Dashboard
  async getDashboardStats(): Promise<{
    machineCount: number;
    animalCount: number;
    monthlyIncome: number;
    monthlyExpense: number;
  }> {
    const [machinesResult] = await db.select({ count: db.fn.count(machines.id) }).from(machines);
    const [animalsResult] = await db.select({ count: db.fn.count(animals.id) }).from(animals);

    const machineCount = Number(machinesResult?.count || 0);
    const animalCount = Number(animalsResult?.count || 0);

    // Simplificando, se puede expandir para obtener ingresos/gastos mensuales reales
    return {
      machineCount,
      animalCount,
      monthlyIncome: 0,
      monthlyExpense: 0
    };
  }

  async getUpcomingMaintenances(): Promise<Maintenance[]> {
    return await db.select().from(maintenance).limit(5);
  }

  async getRecentTransactions(): Promise<(MachineFinance | AnimalFinance | PastureFinance)[]> {
    const machineTransactions = await db.select().from(machineFinances).orderBy(desc(machineFinances.createdAt)).limit(5);
    const animalTransactions = await db.select().from(animalFinances).orderBy(desc(animalFinances.createdAt)).limit(5);
    const pastureTransactions = await db.select().from(pastureFinances).orderBy(desc(pastureFinances.createdAt)).limit(5);
    
    return [...machineTransactions, ...animalTransactions, ...pastureTransactions]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }
}