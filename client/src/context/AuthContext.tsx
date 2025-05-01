import { createContext, useState, useEffect, ReactNode } from 'react';

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

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  token: null,
  login: () => {},
  logout: () => {},
  checkAuth: async () => false
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const login = (newToken: string, userData: User) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  const checkAuth = async (): Promise<boolean> => {
    try {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (!storedToken || !storedUser) {
        logout();
        setAuthChecked(true);
        return false;
      }
      
      console.log("Verificando token guardado:", storedToken);
      
      // Intentar hacer una solicitud a un endpoint protegido para validar el token
      try {
        const response = await fetch('/api/dashboard', {
          headers: {
            'Authorization': `Bearer ${storedToken}`
          }
        });
        
        if (!response.ok) {
          console.log("Token inválido o expirado, respuesta:", response.status);
          logout();
          setAuthChecked(true);
          return false;
        }
        
        console.log("Token verificado con éxito");
      } catch (fetchError) {
        console.error("Error al verificar token:", fetchError);
        // Si hay un error de conexión, permitimos continuar con el token almacenado
        // para mantener la funcionalidad offline
      }
      
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
      setAuthChecked(true);
      return true;
    } catch (error) {
      console.error("Auth check error:", error);
      logout();
      setAuthChecked(true);
      return false;
    }
  };

  const value = {
    isAuthenticated,
    user,
    token,
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
