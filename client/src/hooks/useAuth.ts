import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface User {
  id: number;
  username: string;
  fullName: string;
  role: string;
}

export function useAuth() {
  const context = useContext(AuthContext);
  // Siempre establecemos isLoading en false después de un breve retraso
  // para simular una carga rápida sin autenticación real
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulamos una breve carga
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  // Funciones simplificadas que no hacen llamadas reales a la API
  const login = async (credentials: LoginCredentials) => {
    console.log('Login simulado con:', credentials);
    return { success: true, message: 'Login simulado' };
  };

  const register = async (userData: {
    username: string;
    password: string;
    fullName: string;
    role: string;
  }) => {
    console.log('Registro simulado con:', userData);
    return { success: true, message: 'Registro simulado' };
  };

  const logout = () => {
    console.log('Logout simulado');
  };

  return {
    // Siempre retornamos que estamos autenticados
    isAuthenticated: true,
    user: context.user,
    login,
    register,
    logout,
    isLoading
  };
}
