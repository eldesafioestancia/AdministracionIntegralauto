import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { setupUploadRoutes } from "./upload";
import { applyPermanentDeletions } from "./deletePermanently";
// Import sample data
import "../sample-data";
// Import pastures data loader
import "../load-pastures";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Aplicar eliminaciones permanentes al iniciar el servidor
// IMPORTANTE: Necesitamos aplicar las eliminaciones después de que los datos de muestra se carguen
// pero antes de que los endpoints estén disponibles para los usuarios
async function initializeServer() {
  // Primero esperamos que se carguen los datos de muestra
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Luego aplicamos las eliminaciones permanentes
  try {
    await applyPermanentDeletions();
    console.log('[Sistema] Eliminaciones permanentes aplicadas con éxito');
    
    // Por último, verificamos si hay elementos que deberían estar eliminados pero no lo están
    const fs = require('fs');
    const path = require('path');
    const deletedRecordsFile = path.join(process.cwd(), 'deleted_records.json');
    
    if (fs.existsSync(deletedRecordsFile)) {
      const deletedRecords = JSON.parse(fs.readFileSync(deletedRecordsFile, 'utf-8'));
      
      // Re-aplicar eliminaciones específicas en caso de que no hayan sido efectivas la primera vez
      for (const id of deletedRecords.machines || []) {
        try {
          const { storage } = require('./storage');
          await storage.deleteMachine(id);
          console.log(`[Sistema] Re-eliminada máquina ID: ${id}`);
        } catch (err) {
          // Es posible que el elemento ya no exista, lo cual está bien
        }
      }
      
      // Similar para animales y pasturas
      for (const id of deletedRecords.animals || []) {
        try {
          const { storage } = require('./storage');
          await storage.deleteAnimal(id);
          console.log(`[Sistema] Re-eliminado animal ID: ${id}`);
        } catch (err) {
          // Es posible que el elemento ya no exista, lo cual está bien
        }
      }
      
      for (const id of deletedRecords.pastures || []) {
        try {
          const { storage } = require('./storage');
          await storage.deletePasture(id);
          console.log(`[Sistema] Re-eliminada pastura ID: ${id}`);
        } catch (err) {
          // Es posible que el elemento ya no exista, lo cual está bien
        }
      }
    }
    
  } catch (error) {
    console.error('[Sistema] Error al aplicar eliminaciones permanentes:', error);
  }
}

// Iniciar la secuencia de inicialización
initializeServer();

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Configurar rutas para servir archivos subidos
  setupUploadRoutes(app);
  
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
