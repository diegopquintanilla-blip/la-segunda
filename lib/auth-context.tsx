'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { User, mockUsers } from '@/lib/mock-data';
import { getAvatarByGender } from '@/lib/avatar-utils';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, gender?: 'male' | 'female' | 'neutral', city?: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Find user by email (mock)
    const foundUser = mockUsers.find(u => u.email === email);
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('currentUser', JSON.stringify(foundUser));
    } else {
      throw new Error('Usuario o contraseña incorrectos');
    }
    setIsLoading(false);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string, gender?: 'male' | 'female' | 'neutral', city?: string) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Create new user (mock)
    const newUser: User = {
      id: Date.now().toString(),
      name,
      email,
      avatar: getAvatarByGender(name, gender),
      rating: 0,
      reviewCount: 0,
      isSeller: false,
      joinDate: new Date().toISOString().split('T')[0],
      verificationStatus: 'pending',
      gender: gender || 'neutral',
      city: city || '',
      accountType: 'buyer',
    };
    
    setUser(newUser);
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    setIsLoading(false);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('currentUser');
  }, []);

  const updateUser = useCallback((userData: Partial<User>) => {
    if (user) {
      const updated = { ...user, ...userData };
      setUser(updated);
      localStorage.setItem('currentUser', JSON.stringify(updated));
    }
  }, [user]);

  // Check for saved user on mount
  React.useEffect(() => {
    const saved = localStorage.getItem('currentUser');
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch (e) {
        console.log('[v0] Failed to parse saved user');
      }
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateUser,
      }}
    >
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
