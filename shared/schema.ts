import { pgTable, text, serial, integer, decimal, timestamp, boolean, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User Table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  role: text("role").notNull().default("operator"), // admin, supervisor, operator
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

// Machine Table (Unidades Productivas)
export const machines = pgTable("machines", {
  id: serial("id").primaryKey(),
  // Datos de identificación
  type: text("type").notNull(), // tractor, camion, topadora, vehiculo, accesorio
  brand: text("brand").notNull(),
  model: text("model").notNull(),
  serialNumber: text("serial_number"),
  year: integer("year").notNull(),
  hours: decimal("hours").notNull().default("0"), // horas/kms
  power: text("power"), // Potencia (HP/kW)
  fuelType: text("fuel_type"), // Combustible
  licensePlate: text("license_plate"), // Patente/matrícula
  
  // Datos de adquisición
  purchaseDate: timestamp("purchase_date").notNull(),
  supplier: text("supplier"), // Proveedor/Vendedor
  invoiceNumber: text("invoice_number"), // Número de factura
  purchasePrice: decimal("purchase_price"), // Precio de compra
  paymentMethod: text("payment_method"), // Forma de pago
  warrantyStart: timestamp("warranty_start"), // Fecha inicio garantía
  warrantyEnd: timestamp("warranty_end"), // Fecha fin garantía
  documentation: text("documentation"), // Documentación adjunta
  photo: text("photo"), // Fotografía de la maquinaria
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Base insertion schema
const baseMachineSchema = createInsertSchema(machines).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Extended schema with date transformations
export const insertMachineSchema = baseMachineSchema.extend({
  purchaseDate: z.string().or(z.date()).transform(val => 
    typeof val === 'string' ? new Date(val) : val
  ),
  warrantyStart: z.string().or(z.date()).nullable().transform(val => 
    typeof val === 'string' ? new Date(val) : val
  ).optional(),
  warrantyEnd: z.string().or(z.date()).nullable().transform(val => 
    typeof val === 'string' ? new Date(val) : val
  ).optional(),
});

// Machine Maintenance
export const maintenance = pgTable("maintenance", {
  id: serial("id").primaryKey(),
  machineId: integer("machine_id").notNull(),
  date: timestamp("date").notNull(),
  time: text("time"), // Hora del mantenimiento/revisión
  type: text("type").notNull(), // pre_start_check, oil_filter_change, maintenance_repair
  driver: text("driver"), // Chofer/conductor
  notes: text("notes"),
  isModified: boolean("is_modified").default(false),
  modifiedAt: timestamp("modified_at"),
  
  // Información del taller para mantenimiento y reparación
  workshopName: text("workshop_name"), // Nombre del taller
  workshopAddress: text("workshop_address"), // Dirección del taller
  workshopPhone: text("workshop_phone"), // Teléfono del taller
  
  // Campos para mantenimiento y reparación
  electricalSystem: boolean("electrical_system").default(false), // Eléctrico
  mechanicalSystem: boolean("mechanical_system").default(false), // Mecánico
  frontAxle: boolean("front_axle").default(false), // Tren delantero
  gearbox: boolean("gearbox").default(false), // Caja
  differential: boolean("differential").default(false), // Diferencial
  hydraulicSystem: boolean("hydraulic_system").default(false), // Hidráulico
  brakes: boolean("brakes").default(false), // Frenos
  diagnosis: text("diagnosis"), // Diagnóstico
  
  // Costos de mantenimiento y reparación
  spareParts: text("spare_parts"), // Descripción de repuestos
  sparePartsCost: text("spare_parts_cost"), // Costo total de repuestos en pesos
  labor: text("labor"), // Descripción de mano de obra
  laborCost: text("labor_cost"), // Costo total de mano de obra en pesos
  totalCost: text("total_cost"), // Costo total
  
  // Previo al arranque
  gearboxOilLevel: boolean("gearbox_oil_level").default(false), // Chequear nivel aceite de caja
  engineOilLevel: boolean("engine_oil_level").default(false), // Chequear nivel aceite de motor
  fuelLevel: boolean("fuel_level").default(false), // Combustible
  batteryWater: boolean("battery_water").default(false), // Agua de batería
  airPressure: boolean("air_pressure").default(false), // Presión de aire
  airFilterCleaning: boolean("air_filter_cleaning").default(false), // Limpiar filtro de aire
  oilBathAirFilter: boolean("oil_bath_air_filter").default(false), // Limpiar filtro de aire baño aceite
  differentialVent: boolean("differential_vent").default(false), // Limpiar venteo de diferencial
  greasing: boolean("greasing").default(false), // Engrasar
  
  // Después del arranque
  fuelLeaks: boolean("fuel_leaks").default(false), // Posibles pérdidas de combustible
  engineOilLeaks: boolean("engine_oil_leaks").default(false), // Posibles pérdidas de aceite: Motor
  gearboxOilLeaks: boolean("gearbox_oil_leaks").default(false), // Posibles pérdidas de aceite: Caja
  differentialOilLeaks: boolean("differential_oil_leaks").default(false), // Posibles pérdidas de aceite: Diferencial
  hydraulicOilLeaks: boolean("hydraulic_oil_leaks").default(false), // Posibles pérdidas de aceite: Hidráulico
  oilPressureTemp: boolean("oil_pressure_temp").default(false), // Presión de aceite y temperatura
  
  // Añadir aceite/combustible
  addOil: boolean("add_oil").default(false), // Agregar aceite
  addOilQuantity: decimal("add_oil_quantity").default("0"), // Cantidad de aceite agregado
  addFuel: boolean("add_fuel").default(false), // Agregar combustible
  addFuelQuantity: decimal("add_fuel_quantity").default("0"), // Cantidad de combustible agregado
  
  // Terminado el turno
  cutoffSwitch: boolean("cutoff_switch").default(false), // Llave de corte
  cleaning: boolean("cleaning").default(false), // Limpiar
  generalCheck: boolean("general_check").default(false), // Chequeo general y reporte de fallas
  
  // Campos originales para cambio de aceite y filtros
  motorOil: boolean("motor_oil").default(false),
  motorOilQuantity: decimal("motor_oil_quantity").default("0"),
  hydraulicOil: boolean("hydraulic_oil").default(false),
  hydraulicOilQuantity: decimal("hydraulic_oil_quantity").default("0"),
  coolant: boolean("coolant").default(false),
  coolantQuantity: decimal("coolant_quantity").default("0"),
  oilFilter: boolean("oil_filter").default(false),
  hydraulicFilter: boolean("hydraulic_filter").default(false),
  fuelFilter: boolean("fuel_filter").default(false),
  airFilter: boolean("air_filter").default(false),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Base maintenance schema
const baseMaintenanceSchema = createInsertSchema(maintenance).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Extended schema with date transformations
export const insertMaintenanceSchema = baseMaintenanceSchema.extend({
  date: z.string().or(z.date()).transform(val => 
    typeof val === 'string' ? new Date(val) : val
  ),
  modifiedAt: z.string().or(z.date()).transform(val => 
    typeof val === 'string' ? new Date(val) : val
  ).optional(),
});

// Machine Financial Records
export const machineFinances = pgTable("machine_finances", {
  id: serial("id").primaryKey(),
  machineId: integer("machine_id").notNull(),
  date: timestamp("date").notNull(),
  type: text("type").notNull(), // expense, income
  concept: text("concept").notNull(),
  amount: decimal("amount").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Base machine finance schema
const baseMachineFinanceSchema = createInsertSchema(machineFinances).omit({
  id: true,
  createdAt: true,
});

// Extended schema with date transformations
export const insertMachineFinanceSchema = baseMachineFinanceSchema.extend({
  date: z.string().or(z.date()).transform(val => 
    typeof val === 'string' ? new Date(val) : val
  ),
});

// Animal Table
export const animals = pgTable("animals", {
  id: serial("id").primaryKey(),
  birthDate: timestamp("birth_date").notNull(),
  race: text("race").notNull(),
  category: text("category").notNull(), // vaca, toro, novillo, ternero, ternera
  reproductiveStatus: text("reproductive_status"), // vacia, servicio, preñada, parida (para vacas) / en_servicio, no_en_servicio (para toros)
  reproductiveDetail: text("reproductive_detail"), // detalles adicionales según el estado reproductivo
  origin: text("origin"), // nacido_establecimiento, comprado
  supplier: text("supplier"), // proveedor si fue comprado
  purchaseDate: timestamp("purchase_date"), // fecha de compra si fue comprado
  motherId: integer("mother_id"),
  fatherId: integer("father_id"),
  description: text("description"),
  cartagena: text("cartagena").notNull(), // nro caravana (obligatorio)
  cartagenaColor: text("caravana_color").notNull(), // color de la caravana
  marks: text("marks"), // señales o marcas particulares
  currentWeight: text("current_weight"), // peso actual en kg
  lastWeightDate: timestamp("last_weight_date"), // fecha del último control de peso
  bodyCondition: text("body_condition"), // condición corporal (1-5)
  lastServiceDate: timestamp("last_service_date"), // fecha del último servicio
  lastServiceType: text("last_service_type"), // tipo del último servicio
  expectedDeliveryDate: timestamp("expected_delivery_date"), // fecha probable de parto  
  color: text("color"),
  location: text("location"), // Ubicación del animal (potrero, corral, etc.)
  status: text("status").default("active").notNull(), // active, sold, dead
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Base animal schema
const baseAnimalSchema = createInsertSchema(animals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Extended schema with date transformations
export const insertAnimalSchema = baseAnimalSchema.extend({
  birthDate: z.string().or(z.date()).transform(val => 
    typeof val === 'string' ? new Date(val) : val
  ),
  purchaseDate: z.string().or(z.date()).transform(val => 
    typeof val === 'string' ? new Date(val) : val
  ).optional().nullable(),
  lastWeightDate: z.string().or(z.date()).transform(val => 
    typeof val === 'string' ? new Date(val) : val
  ).optional().nullable(),
  lastServiceDate: z.string().or(z.date()).transform(val => 
    typeof val === 'string' ? new Date(val) : val
  ).optional().nullable(),
  expectedDeliveryDate: z.string().or(z.date()).transform(val => 
    typeof val === 'string' ? new Date(val) : val
  ).optional().nullable(),
});

// Animal Veterinary Records
export const animalVeterinary = pgTable("animal_veterinary", {
  id: serial("id").primaryKey(),
  animalId: integer("animal_id").notNull(),
  date: timestamp("date").notNull(),
  type: text("type").notNull(), // separation, device_placement, device_removal, insemination, check, visit, birth, weaning, sale, vaccination
  description: text("description").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Base animal veterinary schema
const baseAnimalVeterinarySchema = createInsertSchema(animalVeterinary).omit({
  id: true,
  createdAt: true,
});

// Extended schema with date transformations
export const insertAnimalVeterinarySchema = baseAnimalVeterinarySchema.extend({
  date: z.string().or(z.date()).transform(val => 
    typeof val === 'string' ? new Date(val) : val
  ),
});

// Animal Financial Records
export const animalFinances = pgTable("animal_finances", {
  id: serial("id").primaryKey(),
  animalId: integer("animal_id").notNull(),
  date: timestamp("date").notNull(),
  type: text("type").notNull(), // expense, income
  concept: text("concept").notNull(), // senasa, vaccine, vet, food, other
  animalCategory: text("animal_category"), // ternero, novillo, vaquillona, vaca, toro
  totalKg: decimal("total_kg"),
  pricePerKg: decimal("price_per_kg"),
  amount: decimal("amount").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Base animal finance schema
const baseAnimalFinanceSchema = createInsertSchema(animalFinances).omit({
  id: true,
  createdAt: true,
});

// Extended schema with date transformations
export const insertAnimalFinanceSchema = baseAnimalFinanceSchema.extend({
  date: z.string().or(z.date()).transform(val => 
    typeof val === 'string' ? new Date(val) : val
  ),
});

// Pasture Table
export const pastures = pgTable("pastures", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  area: decimal("area").notNull(), // in hectares
  location: text("location"), // ubicación
  soilType: text("soil_type"), // tipo de suelo: arcilloso, arenoso, limoso, etc.
  waterSource: text("water_source"), // disponibilidad de agua
  status: text("status").default("active"), // activa, barbecho, en preparación, inactiva
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertPastureSchema = createInsertSchema(pastures).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Pasture Financial Records
export const pastureFinances = pgTable("pasture_finances", {
  id: serial("id").primaryKey(),
  pastureId: integer("pasture_id").notNull(),
  date: timestamp("date").notNull(),
  type: text("type").notNull(), // expense, income
  concept: text("concept").notNull(), // seeds, weed_control, fertilizer, threads, parts, tractor_hours, rolls
  amount: decimal("amount").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPastureFinanceSchema = createInsertSchema(pastureFinances).omit({
  id: true,
  createdAt: true,
});

// Investment Table
export const investments = pgTable("investments", {
  id: serial("id").primaryKey(),
  date: timestamp("date").notNull(),
  type: text("type").notNull(), // machinery, fencing, construction, clearing, tools
  description: text("description").notNull(),
  details: json("details"), // For storing different details based on type
  amount: decimal("amount").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertInvestmentSchema = createInsertSchema(investments).omit({
  id: true,
  createdAt: true,
});

// Services Table
export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  date: timestamp("date").notNull(),
  type: text("type").notNull(), // edesal, consorcio_regantes, agua_potable, internet
  description: text("description").notNull(),
  amount: decimal("amount").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertServiceSchema = createInsertSchema(services).omit({
  id: true,
  createdAt: true,
});

// Tax Table
export const taxes = pgTable("taxes", {
  id: serial("id").primaryKey(),
  date: timestamp("date").notNull(),
  type: text("type").notNull(), // municipal, provincial
  code: text("code"),
  description: text("description").notNull(),
  amount: decimal("amount").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTaxSchema = createInsertSchema(taxes).omit({
  id: true,
  createdAt: true,
});

// Repair Table
export const repairs = pgTable("repairs", {
  id: serial("id").primaryKey(),
  date: timestamp("date").notNull(),
  type: text("type").notNull(), // construction, electrician, plumber, materials
  description: text("description").notNull(),
  amount: decimal("amount").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertRepairSchema = createInsertSchema(repairs).omit({
  id: true,
  createdAt: true,
});

// Salary Table
export const salaries = pgTable("salaries", {
  id: serial("id").primaryKey(),
  date: timestamp("date").notNull(),
  employee: text("employee").notNull(), // Pincheira, Lima, Alfredo, Ozan
  amount: decimal("amount").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSalarySchema = createInsertSchema(salaries).omit({
  id: true,
  createdAt: true,
});

// Capital Table
export const capital = pgTable("capital", {
  id: serial("id").primaryKey(),
  date: timestamp("date").notNull(),
  type: text("type").notNull(), // contribution, withdrawal
  partner: text("partner").notNull(), // Juan Carlos, Juan Alberto, Nacho
  amount: decimal("amount").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCapitalSchema = createInsertSchema(capital).omit({
  id: true,
  createdAt: true,
});

// Add export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Machine = typeof machines.$inferSelect;
export type InsertMachine = z.infer<typeof insertMachineSchema>;

export type Maintenance = typeof maintenance.$inferSelect;
export type InsertMaintenance = z.infer<typeof insertMaintenanceSchema>;

export type MachineFinance = typeof machineFinances.$inferSelect;
export type InsertMachineFinance = z.infer<typeof insertMachineFinanceSchema>;

export type Animal = typeof animals.$inferSelect;
export type InsertAnimal = z.infer<typeof insertAnimalSchema>;

export type AnimalVeterinary = typeof animalVeterinary.$inferSelect;
export type InsertAnimalVeterinary = z.infer<typeof insertAnimalVeterinarySchema>;

export type AnimalFinance = typeof animalFinances.$inferSelect;
export type InsertAnimalFinance = z.infer<typeof insertAnimalFinanceSchema>;

export type Pasture = typeof pastures.$inferSelect;
export type InsertPasture = z.infer<typeof insertPastureSchema>;

export type PastureFinance = typeof pastureFinances.$inferSelect;
export type InsertPastureFinance = z.infer<typeof insertPastureFinanceSchema>;

export type Investment = typeof investments.$inferSelect;
export type InsertInvestment = z.infer<typeof insertInvestmentSchema>;

export type Service = typeof services.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;

export type Tax = typeof taxes.$inferSelect;
export type InsertTax = z.infer<typeof insertTaxSchema>;

export type Repair = typeof repairs.$inferSelect;
export type InsertRepair = z.infer<typeof insertRepairSchema>;

export type Salary = typeof salaries.$inferSelect;
export type InsertSalary = z.infer<typeof insertSalarySchema>;

export type Capital = typeof capital.$inferSelect;
export type InsertCapital = z.infer<typeof insertCapitalSchema>;
