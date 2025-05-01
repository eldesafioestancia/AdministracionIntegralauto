import { createContext, ReactNode } from 'react';

interface User {
  id: number;
  username: string;
  fullName: string;
  role: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
}

// Datos de usuario por defecto para acceso sin login
const defaultUser: User = {
  id: 1,
  username: 'usuario@ejemplo.com',
  fullName: 'Usuario Demo',
  role: 'admin'
};

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: true, // Siempre autenticado
  user: defaultUser,
  token: 'demo-token',
  login: () => {},
  logout: () => {},
  checkAuth: async () => true
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  // Funciones simuladas que no hacen nada 
  const login = (_newToken: string, _userData: User) => {
    // No hace nada, siempre estamos "autenticados"
    console.log('Login simulado (desactivado)');
  };

  const logout = () => {
    // No hace nada, siempre estamos "autenticados"
    console.log('Logout simulado (desactivado)');
  };

  const checkAuth = async (): Promise<boolean> => {
    // Siempre retorna true, para simular que estamos autenticados
    return true;
  };

  const value = {
    isAuthenticated: true, // Siempre autenticado
    user: defaultUser, // Usuario predeterminado
    token: 'demo-token', // Token ficticio
    login,
    logout,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
