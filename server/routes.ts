import { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  getPublicKey, 
  subscribe, 
  unsubscribe, 
  updateNotificationPreferences, 
  getNotificationPreferences,
  sendTestNotification, 
  sendCriticalAlert 
} from "./notifications";
import {
  insertUserSchema,
  insertMachineSchema,
  insertMaintenanceSchema,
  insertMachineFinanceSchema,
  insertAnimalSchema,
  insertAnimalVeterinarySchema,
  insertAnimalFinanceSchema,
  insertPastureSchema,
  insertPastureWorkSchema,
  insertPastureFinanceSchema,
  insertInvestmentSchema,
  insertCapitalSchema,
  insertAnimalWeightSchema,
} from "@shared/schema";
import { 
  getCurrentWeather, 
  getWeatherForecast, 
  evaluateCropRisks, 
  generateBasicRecommendations,
  getHistoricalPrecipitation 
} from './weather';
import { handleFileUpload, setupUploadRoutes } from './upload';

export async function registerRoutes(app: Express): Promise<Server> {
  // Configurar rutas para cargas de archivos
  setupUploadRoutes(app);
  
  // Ruta para subir archivos
  app.post("/api/upload", handleFileUpload);
  // Rutas de autenticación simuladas - sin verificación real
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { username } = req.body;
      
      // Simulamos un login exitoso con un usuario demo
      const demoUser = {
        id: 1,
        username: username || "usuario@ejemplo.com",
        fullName: "Usuario Demo",
        role: "admin"
      };
      
      // Token ficticio
      const demoToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoidXN1YXJpb0BlamVtcGxvLmNvbSIsInJvbGUiOiJhZG1pbiJ9.demo-token";
      
      res.json({
        token: demoToken,
        user: demoUser
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Error durante el proceso de login" });
    }
  });

  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const { username, fullName, role } = req.body;
      
      // Simulamos un registro exitoso con un usuario demo
      res.status(201).json({
        id: 1,
        username: username || "usuario@ejemplo.com",
        fullName: fullName || "Usuario Demo",
        role: role || "admin"
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Error durante el proceso de registro" });
    }
  });

  // Rutas (sin protección de autenticación)
  // Dashboard
  app.get("/api/dashboard", async (req: Request, res: Response) => {
    try {
      const stats = await storage.getDashboardStats();
      const upcomingMaintenances = await storage.getUpcomingMaintenances();
      const recentTransactions = await storage.getRecentTransactions();
      
      res.json({
        stats,
        upcomingMaintenances,
        recentTransactions,
      });
    } catch (error) {
      console.error("Dashboard error:", error);
      res.status(500).json({ message: "Error fetching dashboard data" });
    }
  });

  // Machines routes
  app.get("/api/machines", async (req: Request, res: Response) => {
    try {
      const machines = await storage.getMachines();
      res.json(machines);
    } catch (error) {
      console.error("Error fetching machines:", error);
      res.status(500).json({ message: "Error fetching machines" });
    }
  });
  
  app.get("/api/machines/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const machine = await storage.getMachine(id);
      
      if (!machine) {
        return res.status(404).json({ message: "Machine not found" });
      }
      
      res.json(machine);
    } catch (error) {
      console.error("Error fetching machine:", error);
      res.status(500).json({ message: "Error fetching machine" });
    }
  });
  
  app.post("/api/machines", async (req: Request, res: Response) => {
    try {
      const machineData = insertMachineSchema.parse(req.body);
      const newMachine = await storage.createMachine(machineData);
      res.status(201).json(newMachine);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid machine data", errors: error.errors });
      }
      
      console.error("Error creating machine:", error);
      res.status(500).json({ message: "Error creating machine" });
    }
  });
  
  app.put("/api/machines/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const machineData = insertMachineSchema.partial().parse(req.body);
      
      const updatedMachine = await storage.updateMachine(id, machineData);
      
      if (!updatedMachine) {
        return res.status(404).json({ message: "Machine not found" });
      }
      
      res.json(updatedMachine);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid machine data", errors: error.errors });
      }
      
      console.error("Error updating machine:", error);
      res.status(500).json({ message: "Error updating machine" });
    }
  });
  
  app.delete("/api/machines/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteMachine(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Machine not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting machine:", error);
      res.status(500).json({ message: "Error deleting machine" });
    }
  });

  // Machine Maintenance routes
  app.get("/api/maintenance", async (req: Request, res: Response) => {
    try {
      const machineId = req.query.machineId ? parseInt(req.query.machineId as string) : undefined;
      const maintenances = await storage.getMaintenances(machineId);
      res.json(maintenances);
    } catch (error) {
      console.error("Error fetching maintenance records:", error);
      res.status(500).json({ message: "Error fetching maintenance records" });
    }
  });
  
  app.get("/api/maintenance/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const maintenance = await storage.getMaintenance(id);
      
      if (!maintenance) {
        return res.status(404).json({ message: "Maintenance record not found" });
      }
      
      res.json(maintenance);
    } catch (error) {
      console.error("Error fetching maintenance record:", error);
      res.status(500).json({ message: "Error fetching maintenance record" });
    }
  });
  
  app.post("/api/maintenance", async (req: Request, res: Response) => {
    try {
      const maintenanceData = insertMaintenanceSchema.parse(req.body);
      const newMaintenance = await storage.createMaintenance(maintenanceData);
      
      // Actualizar el inventario si es un mantenimiento de tipo "oil_filter_change"
      if (maintenanceData.type === "oil_filter_change") {
        // Descontar productos usados
        if (maintenanceData.motorOil && maintenanceData.motorOilQuantity) {
          await storage.updateProductStock("Aceite de motor", -Number(maintenanceData.motorOilQuantity));
        }
        
        if (maintenanceData.hydraulicOil && maintenanceData.hydraulicOilQuantity) {
          await storage.updateProductStock("Aceite hidráulico", -Number(maintenanceData.hydraulicOilQuantity));
        }
        
        if (maintenanceData.coolant && maintenanceData.coolantQuantity) {
          await storage.updateProductStock("Refrigerante", -Number(maintenanceData.coolantQuantity));
        }
        
        if (maintenanceData.oilFilter) {
          await storage.updateProductStock("Filtro de aceite", -1);
        }
        
        if (maintenanceData.hydraulicFilter) {
          await storage.updateProductStock("Filtro hidráulico", -1);
        }
        
        if (maintenanceData.fuelFilter) {
          await storage.updateProductStock("Filtro de combustible", -1);
        }
        
        if (maintenanceData.airFilter) {
          await storage.updateProductStock("Filtro de aire", -1);
        }
      }
      
      res.status(201).json(newMaintenance);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid maintenance data", errors: error.errors });
      }
      
      console.error("Error creating maintenance record:", error);
      res.status(500).json({ message: "Error creating maintenance record" });
    }
  });
  
  app.put("/api/maintenance/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const maintenanceData = insertMaintenanceSchema.partial().parse(req.body);
      
      // Obtener el mantenimiento original para comparar cambios
      const originalMaintenance = await storage.getMaintenance(id);
      if (!originalMaintenance) {
        return res.status(404).json({ message: "Maintenance record not found" });
      }
      
      // Actualizar el registro de mantenimiento
      const updatedMaintenance = await storage.updateMaintenance(id, maintenanceData);
      
      // Si es mantenimiento tipo "oil_filter_change", actualizar inventario
      if (originalMaintenance.type === "oil_filter_change" || maintenanceData.type === "oil_filter_change") {
        // Productos que podrían haber cambiado
        
        // Aceite de motor
        if (maintenanceData.motorOil !== undefined && 
            maintenanceData.motorOilQuantity !== undefined &&
            (maintenanceData.motorOil !== originalMaintenance.motorOil || 
             maintenanceData.motorOilQuantity !== originalMaintenance.motorOilQuantity)) {
             
          // Si se quitó el producto
          if (originalMaintenance.motorOil && !maintenanceData.motorOil) {
            // Devolver al inventario
            await storage.updateProductStock("Aceite de motor", Number(originalMaintenance.motorOilQuantity));
          } 
          // Si se agregó el producto
          else if (!originalMaintenance.motorOil && maintenanceData.motorOil) {
            // Restar del inventario
            await storage.updateProductStock("Aceite de motor", -Number(maintenanceData.motorOilQuantity));
          }
          // Si se cambió la cantidad
          else if (originalMaintenance.motorOil && maintenanceData.motorOil && 
                   originalMaintenance.motorOilQuantity !== maintenanceData.motorOilQuantity) {
            // Actualizar diferencia
            const diff = Number(originalMaintenance.motorOilQuantity) - Number(maintenanceData.motorOilQuantity);
            await storage.updateProductStock("Aceite de motor", diff);
          }
        }
        
        // Aceite hidráulico (similar al aceite de motor)
        if (maintenanceData.hydraulicOil !== undefined && 
            maintenanceData.hydraulicOilQuantity !== undefined &&
            (maintenanceData.hydraulicOil !== originalMaintenance.hydraulicOil || 
             maintenanceData.hydraulicOilQuantity !== originalMaintenance.hydraulicOilQuantity)) {
             
          if (originalMaintenance.hydraulicOil && !maintenanceData.hydraulicOil) {
            await storage.updateProductStock("Aceite hidráulico", Number(originalMaintenance.hydraulicOilQuantity));
          } 
          else if (!originalMaintenance.hydraulicOil && maintenanceData.hydraulicOil) {
            await storage.updateProductStock("Aceite hidráulico", -Number(maintenanceData.hydraulicOilQuantity));
          }
          else if (originalMaintenance.hydraulicOil && maintenanceData.hydraulicOil && 
                   originalMaintenance.hydraulicOilQuantity !== maintenanceData.hydraulicOilQuantity) {
            const diff = Number(originalMaintenance.hydraulicOilQuantity) - Number(maintenanceData.hydraulicOilQuantity);
            await storage.updateProductStock("Aceite hidráulico", diff);
          }
        }
        
        // Refrigerante (similar a los anteriores)
        if (maintenanceData.coolant !== undefined && 
            maintenanceData.coolantQuantity !== undefined &&
            (maintenanceData.coolant !== originalMaintenance.coolant || 
             maintenanceData.coolantQuantity !== originalMaintenance.coolantQuantity)) {
             
          if (originalMaintenance.coolant && !maintenanceData.coolant) {
            await storage.updateProductStock("Refrigerante", Number(originalMaintenance.coolantQuantity));
          } 
          else if (!originalMaintenance.coolant && maintenanceData.coolant) {
            await storage.updateProductStock("Refrigerante", -Number(maintenanceData.coolantQuantity));
          }
          else if (originalMaintenance.coolant && maintenanceData.coolant && 
                   originalMaintenance.coolantQuantity !== maintenanceData.coolantQuantity) {
            const diff = Number(originalMaintenance.coolantQuantity) - Number(maintenanceData.coolantQuantity);
            await storage.updateProductStock("Refrigerante", diff);
          }
        }
        
        // Filtros (componentes unitarios)
        // Filtro de aceite
        if (maintenanceData.oilFilter !== undefined && 
            maintenanceData.oilFilter !== originalMaintenance.oilFilter) {
          if (originalMaintenance.oilFilter && !maintenanceData.oilFilter) {
            await storage.updateProductStock("Filtro de aceite", 1);
          } else if (!originalMaintenance.oilFilter && maintenanceData.oilFilter) {
            await storage.updateProductStock("Filtro de aceite", -1);
          }
        }
        
        // Filtro hidráulico
        if (maintenanceData.hydraulicFilter !== undefined && 
            maintenanceData.hydraulicFilter !== originalMaintenance.hydraulicFilter) {
          if (originalMaintenance.hydraulicFilter && !maintenanceData.hydraulicFilter) {
            await storage.updateProductStock("Filtro hidráulico", 1);
          } else if (!originalMaintenance.hydraulicFilter && maintenanceData.hydraulicFilter) {
            await storage.updateProductStock("Filtro hidráulico", -1);
          }
        }
        
        // Filtro de combustible
        if (maintenanceData.fuelFilter !== undefined && 
            maintenanceData.fuelFilter !== originalMaintenance.fuelFilter) {
          if (originalMaintenance.fuelFilter && !maintenanceData.fuelFilter) {
            await storage.updateProductStock("Filtro de combustible", 1);
          } else if (!originalMaintenance.fuelFilter && maintenanceData.fuelFilter) {
            await storage.updateProductStock("Filtro de combustible", -1);
          }
        }
        
        // Filtro de aire
        if (maintenanceData.airFilter !== undefined && 
            maintenanceData.airFilter !== originalMaintenance.airFilter) {
          if (originalMaintenance.airFilter && !maintenanceData.airFilter) {
            await storage.updateProductStock("Filtro de aire", 1);
          } else if (!originalMaintenance.airFilter && maintenanceData.airFilter) {
            await storage.updateProductStock("Filtro de aire", -1);
          }
        }
      }
      
      res.json(updatedMaintenance);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid maintenance data", errors: error.errors });
      }
      
      console.error("Error updating maintenance record:", error);
      res.status(500).json({ message: "Error updating maintenance record" });
    }
  });
  
  app.delete("/api/maintenance/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteMaintenance(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Maintenance record not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting maintenance record:", error);
      res.status(500).json({ message: "Error deleting maintenance record" });
    }
  });

  // Warehouse/Products routes
  app.get("/api/warehouse/products", async (req: Request, res: Response) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Error fetching products" });
    }
  });
  
  // Machine Finance routes
  app.get("/api/machine-finances", async (req: Request, res: Response) => {
    try {
      const machineId = req.query.machineId ? parseInt(req.query.machineId as string) : undefined;
      const finances = await storage.getMachineFinances(machineId);
      res.json(finances);
    } catch (error) {
      console.error("Error fetching machine finances:", error);
      res.status(500).json({ message: "Error fetching machine finances" });
    }
  });
  
  app.post("/api/machine-finances", async (req: Request, res: Response) => {
    try {
      const financeData = insertMachineFinanceSchema.parse(req.body);
      const newFinance = await storage.createMachineFinance(financeData);
      res.status(201).json(newFinance);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid finance data", errors: error.errors });
      }
      
      console.error("Error creating machine finance:", error);
      res.status(500).json({ message: "Error creating machine finance" });
    }
  });
  
  app.delete("/api/machine-finances/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteMachineFinance(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Finance record not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting finance record:", error);
      res.status(500).json({ message: "Error deleting finance record" });
    }
  });

  // Animal routes
  app.get("/api/animals", async (req: Request, res: Response) => {
    try {
      const animals = await storage.getAnimals();
      res.json(animals);
    } catch (error) {
      console.error("Error fetching animals:", error);
      res.status(500).json({ message: "Error fetching animals" });
    }
  });
  
  app.get("/api/animals/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const animal = await storage.getAnimal(id);
      
      if (!animal) {
        return res.status(404).json({ message: "Animal not found" });
      }
      
      res.json(animal);
    } catch (error) {
      console.error("Error fetching animal:", error);
      res.status(500).json({ message: "Error fetching animal" });
    }
  });
  
  app.post("/api/animals", async (req: Request, res: Response) => {
    try {
      const animalData = insertAnimalSchema.parse(req.body);
      const newAnimal = await storage.createAnimal(animalData);
      res.status(201).json(newAnimal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid animal data", errors: error.errors });
      }
      
      console.error("Error creating animal:", error);
      res.status(500).json({ message: "Error creating animal" });
    }
  });
  
  app.put("/api/animals/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const animalData = insertAnimalSchema.partial().parse(req.body);
      
      const updatedAnimal = await storage.updateAnimal(id, animalData);
      
      if (!updatedAnimal) {
        return res.status(404).json({ message: "Animal not found" });
      }
      
      res.json(updatedAnimal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid animal data", errors: error.errors });
      }
      
      console.error("Error updating animal:", error);
      res.status(500).json({ message: "Error updating animal" });
    }
  });
  
  app.delete("/api/animals/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteAnimal(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Animal not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting animal:", error);
      res.status(500).json({ message: "Error deleting animal" });
    }
  });

  // Animal Veterinary routes
  app.get("/api/animal-veterinary", async (req: Request, res: Response) => {
    try {
      const animalId = req.query.animalId ? parseInt(req.query.animalId as string) : undefined;
      const records = await storage.getAnimalVeterinary(animalId);
      res.json(records);
    } catch (error) {
      console.error("Error fetching veterinary records:", error);
      res.status(500).json({ message: "Error fetching veterinary records" });
    }
  });
  
  app.post("/api/animal-veterinary", async (req: Request, res: Response) => {
    try {
      const recordData = insertAnimalVeterinarySchema.parse(req.body);
      const newRecord = await storage.createAnimalVeterinary(recordData);
      res.status(201).json(newRecord);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid veterinary record data", errors: error.errors });
      }
      
      console.error("Error creating veterinary record:", error);
      res.status(500).json({ message: "Error creating veterinary record" });
    }
  });
  
  app.delete("/api/animal-veterinary/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteAnimalVeterinary(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Veterinary record not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting veterinary record:", error);
      res.status(500).json({ message: "Error deleting veterinary record" });
    }
  });

  // Animal Finance routes
  app.get("/api/animal-finances", async (req: Request, res: Response) => {
    try {
      const animalId = req.query.animalId ? parseInt(req.query.animalId as string) : undefined;
      const finances = await storage.getAnimalFinances(animalId);
      res.json(finances);
    } catch (error) {
      console.error("Error fetching animal finances:", error);
      res.status(500).json({ message: "Error fetching animal finances" });
    }
  });
  
  app.post("/api/animal-finances", async (req: Request, res: Response) => {
    try {
      const financeData = insertAnimalFinanceSchema.parse(req.body);
      const newFinance = await storage.createAnimalFinance(financeData);
      res.status(201).json(newFinance);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid finance data", errors: error.errors });
      }
      
      console.error("Error creating animal finance:", error);
      res.status(500).json({ message: "Error creating animal finance" });
    }
  });
  
  app.delete("/api/animal-finances/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteAnimalFinance(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Finance record not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting finance record:", error);
      res.status(500).json({ message: "Error deleting finance record" });
    }
  });
  
  // Animal Weight History routes
  app.get("/api/animal-weights", async (req: Request, res: Response) => {
    try {
      const animalId = req.query.animalId ? parseInt(req.query.animalId as string) : undefined;
      const weights = await storage.getAnimalWeights(animalId);
      res.json(weights);
    } catch (error) {
      console.error("Error fetching animal weights:", error);
      res.status(500).json({ message: "Error fetching animal weights" });
    }
  });
  
  app.post("/api/animal-weights", async (req: Request, res: Response) => {
    try {
      const weightData = insertAnimalWeightSchema.parse(req.body);
      const newWeight = await storage.createAnimalWeight(weightData);
      res.status(201).json(newWeight);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid weight data", errors: error.errors });
      }
      
      console.error("Error creating animal weight record:", error);
      res.status(500).json({ message: "Error creating animal weight record" });
    }
  });
  
  app.delete("/api/animal-weights/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteAnimalWeight(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Weight record not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting weight record:", error);
      res.status(500).json({ message: "Error deleting weight record" });
    }
  });
  
  // Rutas para eventos reproductivos
  app.get("/api/animals/:id/reproduction", async (req: Request, res: Response) => {
    try {
      const animalId = parseInt(req.params.id);
      const animal = await storage.getAnimal(animalId);
      
      if (!animal) {
        return res.status(404).json({ message: "Animal not found" });
      }
      
      // Aquí podrías implementar la recuperación de eventos reproductivos
      // Por ahora, simplemente devolvemos un array vacío
      res.json([]);
    } catch (error) {
      console.error("Error getting reproductive events:", error);
      res.status(500).json({ message: "Error getting reproductive events" });
    }
  });
  
  app.post("/api/animals/:id/reproduction", async (req: Request, res: Response) => {
    try {
      const animalId = parseInt(req.params.id);
      const animal = await storage.getAnimal(animalId);
      
      if (!animal) {
        return res.status(404).json({ message: "Animal not found" });
      }
      
      // Aquí podrías implementar la creación de eventos reproductivos
      // Por ahora, simplemente devolvemos un objeto con estado exitoso
      res.status(201).json({ success: true, animalId, eventData: req.body });
    } catch (error) {
      console.error("Error creating reproductive event:", error);
      res.status(500).json({ message: "Error creating reproductive event" });
    }
  });

  // Pasture routes
  app.get("/api/pastures", async (req: Request, res: Response) => {
    try {
      const pastures = await storage.getPastures();
      res.json(pastures);
    } catch (error) {
      console.error("Error fetching pastures:", error);
      res.status(500).json({ message: "Error fetching pastures" });
    }
  });
  
  app.get("/api/pastures/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const pasture = await storage.getPasture(id);
      
      if (!pasture) {
        return res.status(404).json({ message: "Pasture not found" });
      }
      
      res.json(pasture);
    } catch (error) {
      console.error("Error fetching pasture:", error);
      res.status(500).json({ message: "Error fetching pasture" });
    }
  });
  
  app.post("/api/pastures", async (req: Request, res: Response) => {
    try {
      const pastureData = insertPastureSchema.parse(req.body);
      const newPasture = await storage.createPasture(pastureData);
      res.status(201).json(newPasture);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid pasture data", errors: error.errors });
      }
      
      console.error("Error creating pasture:", error);
      res.status(500).json({ message: "Error creating pasture" });
    }
  });
  
  app.put("/api/pastures/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const pastureData = insertPastureSchema.partial().parse(req.body);
      
      const updatedPasture = await storage.updatePasture(id, pastureData);
      
      if (!updatedPasture) {
        return res.status(404).json({ message: "Pasture not found" });
      }
      
      res.json(updatedPasture);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid pasture data", errors: error.errors });
      }
      
      console.error("Error updating pasture:", error);
      res.status(500).json({ message: "Error updating pasture" });
    }
  });
  
  app.delete("/api/pastures/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deletePasture(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Pasture not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting pasture:", error);
      res.status(500).json({ message: "Error deleting pasture" });
    }
  });
  
  // Pasture Work routes (Trabajos agrícolas)
  app.get("/api/pasture-works", async (req: Request, res: Response) => {
    try {
      const pastureId = req.query.pastureId ? parseInt(req.query.pastureId as string) : undefined;
      const works = await storage.getPastureWorks(pastureId);
      res.json(works);
    } catch (error) {
      console.error("Error fetching pasture works:", error);
      res.status(500).json({ message: "Error fetching pasture works" });
    }
  });
  
  app.get("/api/pasture-works/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const work = await storage.getPastureWork(id);
      
      if (!work) {
        return res.status(404).json({ message: "Pasture work not found" });
      }
      
      res.json(work);
    } catch (error) {
      console.error("Error fetching pasture work:", error);
      res.status(500).json({ message: "Error fetching pasture work" });
    }
  });
  
  app.post("/api/pasture-works", async (req: Request, res: Response) => {
    try {
      const workData = insertPastureWorkSchema.parse(req.body);
      const newWork = await storage.createPastureWork(workData);
      res.status(201).json(newWork);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid work data", errors: error.errors });
      }
      
      console.error("Error creating pasture work:", error);
      res.status(500).json({ message: "Error creating pasture work" });
    }
  });
  
  app.delete("/api/pasture-works/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deletePastureWork(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Pasture work not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting pasture work:", error);
      res.status(500).json({ message: "Error deleting pasture work" });
    }
  });

  // Pasture Finance routes
  app.get("/api/pasture-finances", async (req: Request, res: Response) => {
    try {
      const pastureId = req.query.pastureId ? parseInt(req.query.pastureId as string) : undefined;
      const finances = await storage.getPastureFinances(pastureId);
      res.json(finances);
    } catch (error) {
      console.error("Error fetching pasture finances:", error);
      res.status(500).json({ message: "Error fetching pasture finances" });
    }
  });
  
  app.post("/api/pasture-finances", async (req: Request, res: Response) => {
    try {
      const financeData = insertPastureFinanceSchema.parse(req.body);
      const newFinance = await storage.createPastureFinance(financeData);
      res.status(201).json(newFinance);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid finance data", errors: error.errors });
      }
      
      console.error("Error creating pasture finance:", error);
      res.status(500).json({ message: "Error creating pasture finance" });
    }
  });
  
  app.delete("/api/pasture-finances/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deletePastureFinance(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Finance record not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting finance record:", error);
      res.status(500).json({ message: "Error deleting finance record" });
    }
  });

  // Rutas para inversiones
  app.get("/api/investments", async (req: Request, res: Response) => {
    try {
      const investments = await storage.getInvestments();
      res.json(investments);
    } catch (error) {
      console.error("Error fetching investments:", error);
      res.status(500).json({ message: "Error fetching investments" });
    }
  });
  
  app.get("/api/investments/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const investment = await storage.getInvestment(id);
      
      if (!investment) {
        return res.status(404).json({ message: "Investment not found" });
      }
      
      res.json(investment);
    } catch (error) {
      console.error("Error fetching investment:", error);
      res.status(500).json({ message: "Error fetching investment" });
    }
  });
  
  app.post("/api/investments", async (req: Request, res: Response) => {
    try {
      const investmentData = insertInvestmentSchema.parse(req.body);
      const newInvestment = await storage.createInvestment(investmentData);
      res.status(201).json(newInvestment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid investment data", errors: error.errors });
      }
      
      console.error("Error creating investment:", error);
      res.status(500).json({ message: "Error creating investment" });
    }
  });
  
  app.delete("/api/investments/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteInvestment(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Investment not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting investment:", error);
      res.status(500).json({ message: "Error deleting investment" });
    }
  });

  // Capital routes
  app.get("/api/capital", async (req: Request, res: Response) => {
    try {
      const capital = await storage.getCapital();
      res.json(capital);
    } catch (error) {
      console.error("Error fetching capital records:", error);
      res.status(500).json({ message: "Error fetching capital records" });
    }
  });
  
  app.post("/api/capital", async (req: Request, res: Response) => {
    try {
      const capitalData = insertCapitalSchema.parse(req.body);
      const newRecord = await storage.createCapital(capitalData);
      res.status(201).json(newRecord);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid capital data", errors: error.errors });
      }
      
      console.error("Error creating capital record:", error);
      res.status(500).json({ message: "Error creating capital record" });
    }
  });
  
  app.delete("/api/capital/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteCapital(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Capital record not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting capital record:", error);
      res.status(500).json({ message: "Error deleting capital record" });
    }
  });

  // Weather API routes
  app.get("/api/weather/current", async (req: Request, res: Response) => {
    try {
      const { lat, lon } = req.query;
      
      if (!lat || !lon) {
        return res.status(400).json({ 
          message: "Latitude and longitude are required query parameters" 
        });
      }
      
      const weather = await getCurrentWeather(
        parseFloat(lat as string), 
        parseFloat(lon as string)
      );
      
      res.json(weather);
    } catch (error) {
      console.error("Error fetching current weather:", error);
      res.status(500).json({ 
        message: "Error fetching current weather data", 
        error: (error as Error).message 
      });
    }
  });

  app.get("/api/weather/forecast", async (req: Request, res: Response) => {
    try {
      const { lat, lon } = req.query;
      
      if (!lat || !lon) {
        return res.status(400).json({ 
          message: "Latitude and longitude are required query parameters" 
        });
      }
      
      const forecast = await getWeatherForecast(
        parseFloat(lat as string), 
        parseFloat(lon as string)
      );
      
      res.json(forecast);
    } catch (error) {
      console.error("Error fetching weather forecast:", error);
      res.status(500).json({ 
        message: "Error fetching weather forecast data", 
        error: (error as Error).message 
      });
    }
  });

  app.get("/api/weather/crop-risks", async (req: Request, res: Response) => {
    try {
      const { lat, lon } = req.query;
      
      if (!lat || !lon) {
        return res.status(400).json({ 
          message: "Latitude and longitude are required query parameters" 
        });
      }
      
      // Obtener datos meteorológicos actuales y pronóstico
      const [currentWeather, forecast] = await Promise.all([
        getCurrentWeather(parseFloat(lat as string), parseFloat(lon as string)),
        getWeatherForecast(parseFloat(lat as string), parseFloat(lon as string))
      ]);
      
      // Evaluar riesgos para cultivos
      const riskAssessment = evaluateCropRisks(currentWeather, forecast);
      
      res.json({
        currentWeather,
        forecast: forecast.list.slice(0, 8), // Solo las próximas 24 horas (8 periodos de 3 horas)
        riskAssessment
      });
    } catch (error) {
      console.error("Error in crop risk assessment:", error);
      res.status(500).json({ 
        message: "Error assessing crop risks", 
        error: (error as Error).message 
      });
    }
  });
  
  // Historial de precipitaciones
  app.get("/api/weather/historical-precipitation", async (req: Request, res: Response) => {
    try {
      const { lat, lon, period, startYear, endYear } = req.query;
      
      if (!lat || !lon) {
        return res.status(400).json({ 
          message: "Latitude and longitude are required query parameters" 
        });
      }
      
      // Procesar el periodo solicitado
      let yearsToFetch = 20; // Valor por defecto: 20 años
      let customRange = false;
      let customStart: number | undefined;
      let customEnd: number | undefined;
      
      if (period) {
        switch(period) {
          case '10years':
            yearsToFetch = 10;
            break;
          case '20years':
            yearsToFetch = 20;
            break;
          case '30years':
            yearsToFetch = 30;
            break;
          case '50years':
            yearsToFetch = 50;
            break;
          case 'custom':
            customRange = true;
            if (startYear && endYear) {
              customStart = parseInt(startYear as string);
              customEnd = parseInt(endYear as string);
            }
            break;
        }
      }
      
      // Obtener datos históricos de precipitaciones
      const historicalData = await getHistoricalPrecipitation(
        parseFloat(lat as string), 
        parseFloat(lon as string),
        customRange ? undefined : yearsToFetch,
        customStart,
        customEnd
      );
      
      res.json(historicalData);
    } catch (error) {
      console.error("Error fetching historical precipitation data:", error);
      res.status(500).json({ 
        message: "Error fetching historical precipitation data", 
        error: (error as Error).message 
      });
    }
  });

  // Rutas para notificaciones push
  app.get("/api/notifications/vapid-public-key", getPublicKey);
  app.post("/api/notifications/subscribe", subscribe);
  app.post("/api/notifications/unsubscribe", unsubscribe);
  app.post("/api/notifications/preferences", updateNotificationPreferences);
  app.get("/api/notifications/preferences", getNotificationPreferences);
  app.post("/api/notifications/test", sendTestNotification);
  app.post("/api/notifications/alert", sendCriticalAlert);

  const httpServer = createServer(app);
  return httpServer;
}