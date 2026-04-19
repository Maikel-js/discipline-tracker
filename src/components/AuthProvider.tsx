'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useStore } from '@/store/useStore';
import type { User, AuthSession } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

function hashPassword(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return 'hashed_' + Math.abs(hash).toString(16);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { 
    settings, 
    updateSettings, 
    stats, 
    addDisciplineScore,
    toggleExtremeMode,
    togglePunishmentMode
  } = useStore();
  
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedSession = localStorage.getItem('discipline_session');
    if (storedSession) {
      try {
        const session: AuthSession = JSON.parse(storedSession);
        const storedUser = localStorage.getItem('discipline_user');
        if (storedUser && new Date(session.expiresAt) > new Date()) {
          setUser(JSON.parse(storedUser));
        }
      } catch (e) {
        localStorage.removeItem('discipline_session');
        localStorage.removeItem('discipline_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    const storedUsers = localStorage.getItem('discipline_users');
    const users: User[] = storedUsers ? JSON.parse(storedUsers) : [];
    const existingUser = users.find(u => u.email === email);
    
    if (!existingUser) {
      setIsLoading(false);
      return false;
    }
    
    const token = generateId() + '_' + Date.now();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    
    const session: AuthSession = { userId: existingUser.id, token, expiresAt };
    localStorage.setItem('discipline_session', JSON.stringify(session));
    localStorage.setItem('discipline_user', JSON.stringify(existingUser));
    
    existingUser.lastLogin = new Date().toISOString();
    const updatedUsers = users.map(u => u.id === existingUser.id ? existingUser : u);
    localStorage.setItem('discipline_users', JSON.stringify(updatedUsers));
    
    setUser(existingUser);
    setIsLoading(false);
    return true;
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    setIsLoading(true);
    
    const storedUsers = localStorage.getItem('discipline_users');
    const users: User[] = storedUsers ? JSON.parse(storedUsers) : [];
    
    if (users.find(u => u.email === email)) {
      setIsLoading(false);
      return false;
    }
    
    const newUser: User = {
      id: generateId(),
      email,
      name,
      createdAt: new Date().toISOString(),
      disciplineLevel: 1,
      totalScore: 0,
      settings: { ...settings }
    };
    
    users.push(newUser);
    localStorage.setItem('discipline_users', JSON.stringify(users));
    
    const token = generateId() + '_' + Date.now();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    
    const session: AuthSession = { userId: newUser.id, token, expiresAt };
    localStorage.setItem('discipline_session', JSON.stringify(session));
    localStorage.setItem('discipline_user', JSON.stringify(newUser));
    
    setUser(newUser);
    addDisciplineScore(10, 'Registro completado');
    setIsLoading(false);
    return true;
  };

  const logout = () => {
    localStorage.removeItem('discipline_session');
    localStorage.removeItem('discipline_user');
    setUser(null);
  };

  const updateProfile = (updates: Partial<User>) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('discipline_user', JSON.stringify(updatedUser));
    
    const storedUsers = localStorage.getItem('discipline_users');
    if (storedUsers) {
      const users: User[] = JSON.parse(storedUsers);
      const updatedUsers = users.map(u => u.id === user.id ? updatedUser : u);
      localStorage.setItem('discipline_users', JSON.stringify(updatedUsers));
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      register,
      logout,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}