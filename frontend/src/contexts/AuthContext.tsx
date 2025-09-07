import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '../types';
import apiService from '../services/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Authentication context provider
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Initialize authentication state
   */
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');

      if (storedToken) {
        try {
          apiService.setToken(storedToken);
          const response = await apiService.getCurrentUser();
          setUser(response.user);
          setToken(storedToken);
        } catch (error) {
          // Token is invalid, clear it
          localStorage.removeItem('token');
          apiService.setToken(null);
          setToken(null);
          setUser(null);
        }
      }

      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  /**
   * Login user
   */
  const login = async (email: string, password: string): Promise<void> => {
    try {
      const response = await apiService.login(email, password);

      setUser(response.user);
      setToken(response.token);
      apiService.setToken(response.token);
    } catch (error) {
      throw error;
    }
  };

  /**
   * Register user
   */
  const register = async (email: string, password: string): Promise<void> => {
    try {
      const response = await apiService.register(email, password);

      setUser(response.user);
      setToken(response.token);
      apiService.setToken(response.token);
    } catch (error) {
      throw error;
    }
  };

  /**
   * Logout user
   */
  const logout = (): void => {
    setUser(null);
    setToken(null);
    apiService.setToken(null);
    localStorage.removeItem('token');
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook to use authentication context
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
