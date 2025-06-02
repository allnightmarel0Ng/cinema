import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService } from '../services/api.ts';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-hot-toast';

interface JwtPayload {
  sub: string;
  id: number;
  exp: number;
}

interface AuthContextType {
  isAuthenticated: boolean;
  userId: number | null;
  username: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      setUserId(localStorage.getItem('id'));
      setUsername(localStorage.getItem('user_name'));
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await apiService.login(username, password);
      localStorage.setItem('token', response.token);
      localStorage.setItem('id', response.id.toString());
      localStorage.setItem('user_name', username);

      
      setIsAuthenticated(true);
      setUserId(response.id);
      setUsername(username);
      toast.success('Login successful');
      return true;
    } catch (error) {
      toast.error('Login failed. Please check your credentials.');
      return false;
    }
  };

  const register = async (username: string, password: string): Promise<boolean> => {
    try {
      await apiService.register(username, password);
      toast.success('Registration successful! Please log in.');
      return true;
    } catch (error) {
      toast.error('Registration failed. Please try a different username.');
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await apiService.logout();
    } finally {
      localStorage.removeItem('token');
      setIsAuthenticated(false);
      setUserId(null);
      setUsername(null);
      toast.success('Logged out successfully');
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      userId, 
      username, 
      login, 
      register, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};