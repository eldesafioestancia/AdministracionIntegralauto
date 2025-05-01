import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { Request, Response, NextFunction } from "express";

// Secret key for JWT signature
const JWT_SECRET = process.env.JWT_SECRET || "agrogest_jwt_secret_dev";

// Generate JWT token
export const generateToken = (userId: number, username: string, role: string): string => {
  return jwt.sign(
    { 
      userId, 
      username,
      role
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// Verify password
export const verifyPassword = async (plainPassword: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

// Hash password
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Middleware to authenticate JWT token
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Acceso denegado. Token no proporcionado." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    (req as any).user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Token inválido o expirado." });
  }
};

// Middleware to check role permissions
export const checkRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({ message: "Acceso denegado. Usuario no autenticado." });
    }
    
    if (!roles.includes(user.role)) {
      return res.status(403).json({ message: "Acceso denegado. No tiene permisos suficientes." });
    }
    
    next();
  };
};
