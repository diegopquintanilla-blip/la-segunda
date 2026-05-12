'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from 'react';
import { User, mockUsers } from '@/lib/mock-data';
import { getAvatarByGender } from '@/lib/avatar-utils';

type Gender = 'male' | 'female' | 'neutral';

type ExtendedUser = User & {
  membershipType?: 'free' | 'plus' | 'premium' | string;
  membership?: 'free' | 'plus' | 'premium' | string;
  plan?: 'free' | 'plus' | 'premium' | string;
  sellerBadge?: string;
  subscriptionStatus?: string;
  subscriptionStartedAt?: string;
  commissionRate?: number;
  monthlyListingLimit?: number;
};

interface AuthContextType {
  user: ExtendedUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    gender?: Gender,
    city?: string
  ) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<ExtendedUser>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEYS = [
  'currentUser',
  'la-segunda-user',
  'la_segunda_user',
  'auth-user',
];

function saveUserToStorage(user: ExtendedUser) {
  if (typeof window === 'undefined') return;

  STORAGE_KEYS.forEach((key) => {
    localStorage.setItem(key, JSON.stringify(user));
  });

  localStorage.setItem('la-segunda-auth', 'true');
}

function removeUserFromStorage() {
  if (typeof window === 'undefined') return;

  STORAGE_KEYS.forEach((key) => {
    localStorage.removeItem(key);
  });

  localStorage.removeItem('la-segunda-auth');
}

function getSavedUserFromStorage(): ExtendedUser | null {
  if (typeof window === 'undefined') return null;

  for (const key of STORAGE_KEYS) {
    const saved = localStorage.getItem(key);

    if (!saved) continue;

    try {
      return JSON.parse(saved) as ExtendedUser;
    } catch {
      console.log(`[La Segunda] No se pudo leer el usuario guardado en ${key}`);
    }
  }

  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = getSavedUserFromStorage();

    if (savedUser) {
      setUser(savedUser);
    }

    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 500));

    const foundUser = mockUsers.find((mockUser) => mockUser.email === email);

    if (!foundUser) {
      setIsLoading(false);
      throw new Error('Usuario o contraseña incorrectos');
    }

    const normalizedUser: ExtendedUser = {
      ...foundUser,
      membershipType:
        (foundUser as ExtendedUser).membershipType ||
        (foundUser as ExtendedUser).membership ||
        (foundUser as ExtendedUser).plan ||
        'free',
      membership:
        (foundUser as ExtendedUser).membership ||
        (foundUser as ExtendedUser).membershipType ||
        'free',
      plan:
        (foundUser as ExtendedUser).plan ||
        (foundUser as ExtendedUser).membershipType ||
        'free',
      sellerBadge: foundUser.sellerBadge || 'standard',
      subscriptionStatus:
        (foundUser as ExtendedUser).subscriptionStatus || 'free',
      commissionRate: (foundUser as ExtendedUser).commissionRate || 8,
      monthlyListingLimit:
        (foundUser as ExtendedUser).monthlyListingLimit || 3,
    };

    setUser(normalizedUser);
    saveUserToStorage(normalizedUser);
    setIsLoading(false);
  }, []);

  const register = useCallback(
    async (
      name: string,
      email: string,
      password: string,
      gender: Gender = 'neutral',
      city = ''
    ) => {
      setIsLoading(true);

      await new Promise((resolve) => setTimeout(resolve, 500));

      const newUser: ExtendedUser = {
        id: Date.now().toString(),
        name,
        email,
        avatar: getAvatarByGender(name, gender),
        rating: 0,
        reviewCount: 0,
        isSeller: false,
        joinDate: new Date().toISOString().split('T')[0],
        verificationStatus: 'pending',
        gender,
        city,
        accountType: 'buyer',

        membershipType: 'free',
        membership: 'free',
        plan: 'free',
        sellerBadge: 'standard',
        subscriptionStatus: 'free',
        commissionRate: 8,
        monthlyListingLimit: 3,
      };

      setUser(newUser);
      saveUserToStorage(newUser);
      setIsLoading(false);
    },
    []
  );

  const logout = useCallback(() => {
    setUser(null);
    removeUserFromStorage();
  }, []);

  const updateUser = useCallback(
    (userData: Partial<ExtendedUser>) => {
      setUser((currentUser) => {
        if (!currentUser) return currentUser;

        const updatedUser: ExtendedUser = {
          ...currentUser,
          ...userData,
        };

        saveUserToStorage(updatedUser);

        return updatedUser;
      });
    },
    []
  );

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
