import { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateToken, verifyPassword, hashPassword, authenticateToken, checkRole } from "./auth";
import { z } from "zod";
import {
  insertUserSchema,
  insertMachineSchema,
  insertMaintenanceSchema,
  insertMachineFinanceSchema,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      const user = await storage.getUserByUsername(username);
      
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      const isPasswordValid = await verifyPassword(password, user.password);
      
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      const token = generateToken(user.id, user.username, user.role);
      
      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Error during login process" });
    }
  });

  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      // Hash password
      const hashedPassword = await hashPassword(userData.password);
      
      // Create user with hashed password
      const newUser = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });
      
      res.status(201).json({
        id: newUser.id,
        username: newUser.username,
        fullName: newUser.fullName,
        role: newUser.role,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      
      console.error("Registration error:", error);
      res.status(500).json({ message: "Error during registration process" });
    }
  });

  // Protected routes
  // Dashboard
  app.get("/api/dashboard", authenticateToken, async (req: Request, res: Response) => {
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
  app.get("/api/machines", authenticateToken, async (req: Request, res: Response) => {
    try {
      const machines = await storage.getMachines();
      res.json(machines);
    } catch (error) {
      console.error("Error fetching machines:", error);
      res.status(500).json({ message: "Error fetching machines" });
    }
  });
  
  app.get("/api/machines/:id", authenticateToken, async (req: Request, res: Response) => {
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
  
  app.post("/api/machines", authenticateToken, async (req: Request, res: Response) => {
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
  
  app.put("/api/machines/:id", authenticateToken, async (req: Request, res: Response) => {
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
  
  app.delete("/api/machines/:id", authenticateToken, checkRole(["admin", "supervisor"]), async (req: Request, res: Response) => {
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
  app.get("/api/maintenance", authenticateToken, async (req: Request, res: Response) => {
    try {
      const machineId = req.query.machineId ? parseInt(req.query.machineId as string) : undefined;
      const maintenances = await storage.getMaintenances(machineId);
      res.json(maintenances);
    } catch (error) {
      console.error("Error fetching maintenance records:", error);
      res.status(500).json({ message: "Error fetching maintenance records" });
    }
  });
  
  app.get("/api/maintenance/:id", authenticateToken, async (req: Request, res: Response) => {
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
  
  app.post("/api/maintenance", authenticateToken, async (req: Request, res: Response) => {
    try {
      const maintenanceData = insertMaintenanceSchema.parse(req.body);
      const newMaintenance = await storage.createMaintenance(maintenanceData);
      res.status(201).json(newMaintenance);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid maintenance data", errors: error.errors });
      }
      
      console.error("Error creating maintenance record:", error);
      res.status(500).json({ message: "Error creating maintenance record" });
    }
  });
  
  app.put("/api/maintenance/:id", authenticateToken, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const maintenanceData = insertMaintenanceSchema.partial().parse(req.body);
      
      const updatedMaintenance = await storage.updateMaintenance(id, maintenanceData);
      
      if (!updatedMaintenance) {
        return res.status(404).json({ message: "Maintenance record not found" });
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
  
  app.delete("/api/maintenance/:id", authenticateToken, async (req: Request, res: Response) => {
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

  // Machine Finance routes
  app.get("/api/machine-finances", authenticateToken, async (req: Request, res: Response) => {
    try {
      const machineId = req.query.machineId ? parseInt(req.query.machineId as string) : undefined;
      const finances = await storage.getMachineFinances(machineId);
      res.json(finances);
    } catch (error) {
      console.error("Error fetching machine finances:", error);
      res.status(500).json({ message: "Error fetching machine finances" });
    }
  });
  
  app.post("/api/machine-finances", authenticateToken, async (req: Request, res: Response) => {
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
  
  app.delete("/api/machine-finances/:id", authenticateToken, checkRole(["admin", "supervisor"]), async (req: Request, res: Response) => {
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

  const httpServer = createServer(app);
  return httpServer;
}
