import { Request, Response } from 'express';
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { nanoid } from 'nanoid';

// Configurar directorios para subida de archivos
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

// Asegurar que el directorio de subidas existe
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Configuración de multer para almacenamiento
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Determinar el subdirectorio según el tipo de entidad
    const entityType = req.body.entityType || 'general';
    const entityDir = path.join(UPLOAD_DIR, entityType);
    
    // Crear subdirectorio si no existe
    if (!fs.existsSync(entityDir)) {
      fs.mkdirSync(entityDir, { recursive: true });
    }
    
    cb(null, entityDir);
  },
  filename: function (req, file, cb) {
    // Generar nombre único para evitar colisiones
    const uniqueId = nanoid(10);
    const fileExt = path.extname(file.originalname).toLowerCase();
    const sanitizedName = path.basename(file.originalname, fileExt)
      .replace(/[^a-z0-9]/gi, '_')
      .toLowerCase();
    
    cb(null, `${sanitizedName}_${uniqueId}${fileExt}`);
  }
});

// Validador de tipos de archivos
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'application/pdf'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido. Solo se aceptan imágenes (JPG, PNG, WebP) y PDFs.'));
  }
};

// Configuración de límites
const limits = {
  fileSize: 10 * 1024 * 1024, // 10MB
  files: 1 // máximo 1 archivo por solicitud
};

// Middleware de multer configurado
export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits
}).single('file');

// Controlador para manejar la subida de archivos
export const handleFileUpload = (req: Request, res: Response) => {
  uploadMiddleware(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        // Error de multer
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            message: 'El archivo es demasiado grande. El tamaño máximo permitido es 10MB.'
          });
        }
        
        return res.status(400).json({
          message: `Error en la carga: ${err.message}`
        });
      }
      
      // Error general
      return res.status(500).json({
        message: err.message
      });
    }
    
    if (!req.file) {
      return res.status(400).json({
        message: 'No se ha proporcionado ningún archivo.'
      });
    }
    
    // Crear URL relativa del archivo
    const entityType = req.body.entityType || 'general';
    const fileUrl = `/uploads/${entityType}/${req.file.filename}`;
    
    // Devolver URL del archivo
    return res.status(200).json({
      message: 'Archivo subido correctamente',
      fileUrl,
      fileName: req.file.filename,
      mimeType: req.file.mimetype,
      size: req.file.size
    });
  });
};

// Exponer rutas estáticas para servir los archivos subidos
export const setupUploadRoutes = (app: any) => {
  app.use('/uploads', express.static(UPLOAD_DIR));
};