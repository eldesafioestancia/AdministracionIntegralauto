import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { apiRequest } from '@/lib/queryClient';

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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      await context.checkAuth();
      setIsLoading(false);
    };
    
    checkAuthStatus();
  }, [context]);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const response = await apiRequest('POST', '/api/auth/login', credentials);
      const data = await response.json();
      context.login(data.token, data.user);
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: {
    username: string;
    password: string;
    fullName: string;
    role: string;
  }) => {
    setIsLoading(true);
    try {
      const response = await apiRequest('POST', '/api/auth/register', userData);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    context.logout();
  };

  return {
    isAuthenticated: context.isAuthenticated,
    user: context.user,
    login,
    register,
    logout,
    isLoading
  };
}
