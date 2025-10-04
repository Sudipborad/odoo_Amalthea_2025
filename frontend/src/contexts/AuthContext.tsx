import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Company {
  id: string;
  name: string;
  country: string;
  currency: string;
}

interface AuthContextType {
  user: User | null;
  company: Company | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: any) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      // Don't rely on stored user data, it might be outdated
      const storedUser = localStorage.getItem('user');
      const storedCompany = localStorage.getItem('company');
      if (storedUser && storedCompany) {
        setUser(JSON.parse(storedUser));
        setCompany(JSON.parse(storedCompany));
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authAPI.login(email, password);
    const { token, user, company } = response.data;
    
    setToken(token);
    setUser(user);
    setCompany(company);
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('company', JSON.stringify(company));
  };

  const signup = async (data: any) => {
    const response = await authAPI.signup(data);
    const { token, user, company } = response.data;
    
    setToken(token);
    setUser(user);
    setCompany(company);
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('company', JSON.stringify(company));
  };

  const logout = () => {
    setUser(null);
    setCompany(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('company');
  };

  // Debug log to check user role
  console.log('Current user:', user);

  return (
    <AuthContext.Provider value={{ user, company, token, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};