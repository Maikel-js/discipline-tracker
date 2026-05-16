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

const STORAGE_INDEX = 'discipline_users_index';

function generateId() {
  return crypto.randomUUID();
}

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return 'sha256_' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function userStorageKey(id: string): string {
  return `discipline_user_${id}`;
}

function loadProfile(userId: string): User | null {
  try {
    const raw = localStorage.getItem(userStorageKey(userId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveProfile(user: User): void {
  localStorage.setItem(userStorageKey(user.id), JSON.stringify(user));
}

interface IndexEntry {
  id: string;
  email: string;
  passwordHash: string;
}

function loadIndex(): IndexEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_INDEX);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveIndex(entries: IndexEntry[]): void {
  localStorage.setItem(STORAGE_INDEX, JSON.stringify(entries));
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
        if (new Date(session.expiresAt) > new Date()) {
          const profile = loadProfile(session.userId);
          if (profile) {
            setUser(profile);
          }
        }
      } catch (e) {
        localStorage.removeItem('discipline_session');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);

    const index = loadIndex();
    const entry = index.find(e => e.email.toLowerCase() === email.toLowerCase());

    if (!entry) {
      setIsLoading(false);
      return false;
    }

    const passwordHash = await hashPassword(password);
    if (passwordHash !== entry.passwordHash) {
      setIsLoading(false);
      return false;
    }

    const profile = loadProfile(entry.id);
    if (!profile) {
      setIsLoading(false);
      return false;
    }

    profile.lastLogin = new Date().toISOString();
    saveProfile(profile);

    const token = generateId();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const session: AuthSession = { userId: profile.id, token, expiresAt };
    localStorage.setItem('discipline_session', JSON.stringify(session));

    setUser(profile);
    setIsLoading(false);
    return true;
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    setIsLoading(true);

    const index = loadIndex();
    if (index.find(e => e.email.toLowerCase() === email.toLowerCase())) {
      setIsLoading(false);
      return false;
    }

    const passwordHash = await hashPassword(password);
    const id = generateId();

    const newUser: User = {
      id,
      email,
      passwordHash,
      name,
      createdAt: new Date().toISOString(),
      disciplineLevel: 1,
      totalScore: 0,
      settings: { ...settings }
    };

    index.push({ id, email, passwordHash });
    saveIndex(index);
    saveProfile(newUser);

    const token = generateId();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const session: AuthSession = { userId: id, token, expiresAt };
    localStorage.setItem('discipline_session', JSON.stringify(session));

    setUser(newUser);
    addDisciplineScore(10, 'Registro completado');
    setIsLoading(false);
    return true;
  };

  const logout = () => {
    localStorage.removeItem('discipline_session');
    setUser(null);
  };

  const updateProfile = (updates: Partial<User>) => {
    if (!user) return;

    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    saveProfile(updatedUser);

    if (updates.email) {
      const index = loadIndex();
      const entry = index.find(e => e.id === user.id);
      if (entry) {
        entry.email = updates.email;
        saveIndex(index);
      }
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
