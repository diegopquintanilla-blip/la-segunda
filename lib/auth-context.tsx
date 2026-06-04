'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from 'react';
import type { User } from '@/lib/mock-data';
import { getAvatarByGender } from '@/lib/avatar-utils';
import { supabase } from '@/lib/supabase/client';

type Gender = 'male' | 'female' | 'neutral';
type AccountType = 'buyer' | 'seller' | 'both';
type VerificationStatus = 'pending' | 'verified' | 'rejected';

type ExtendedUser = User & {
  username?: string;
  bio?: string;
  phone?: string;
  membershipType?: string;
  membership?: string;
  plan?: string;
  sellerBadge?: string;
  subscriptionStatus?: string;
  commissionRate?: number;
  monthlyListingLimit?: number;
};

type ProfileRow = {
  id?: string;
  user_id: string;
  full_name: string | null;
  username: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  bio: string | null;
  avatar_url: string | null;
  gender: Gender | null;
  account_type: AccountType | null;
  verification_status: VerificationStatus | null;
  is_seller: boolean | null;
  membership_type: string | null;
  seller_badge: string | null;
  subscription_status: string | null;
  commission_rate: number | null;
  monthly_listing_limit: number | null;
  rating: number | null;
  review_count: number | null;
  created_at: string | null;
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

function loadUserFromStorage(): ExtendedUser | null {
  if (typeof window === 'undefined') return null;

  for (const key of STORAGE_KEYS) {
    const saved = localStorage.getItem(key);

    if (!saved) continue;

    try {
      return JSON.parse(saved) as ExtendedUser;
    } catch {
      continue;
    }
  }

  return null;
}

function getUsernameFromEmail(email: string) {
  return (
    email
      .split('@')[0]
      ?.toLowerCase()
      .replace(/[^a-z0-9._-]/g, '') || ''
  );
}

function normalizeProfileToUser(profile: ProfileRow): ExtendedUser {
  const fullName = profile.full_name || 'Usuario La Segunda';
  const gender = profile.gender || 'neutral';

  return {
    id: profile.user_id,
    name: fullName,
    email: profile.email || '',
    avatar: profile.avatar_url || getAvatarByGender(fullName, gender),
    rating: Number(profile.rating || 0),
    reviewCount: Number(profile.review_count || 0),
    isSeller: Boolean(profile.is_seller),
    joinDate: profile.created_at
      ? profile.created_at.split('T')[0]
      : new Date().toISOString().split('T')[0],
    verificationStatus: profile.verification_status || 'pending',
    gender,
    city: profile.city || '',
    accountType: profile.account_type || 'buyer',

    username: profile.username || '',
    bio: profile.bio || '',
    phone: profile.phone || '',
    membershipType: profile.membership_type || 'free',
    membership: profile.membership_type || 'free',
    plan: profile.membership_type || 'free',
    sellerBadge: profile.seller_badge || 'standard',
    subscriptionStatus: profile.subscription_status || 'free',
    commissionRate: Number(profile.commission_rate || 8),
    monthlyListingLimit: Number(profile.monthly_listing_limit || 3),
  } as ExtendedUser;
}

function buildFallbackUserFromAuth(authUser: any): ExtendedUser {
  const metadata = authUser?.user_metadata || {};
  const email = authUser?.email || '';

  const fullName =
    metadata.full_name ||
    metadata.name ||
    email.split('@')?.[0] ||
    'Usuario La Segunda';

  const gender = (metadata.gender || 'neutral') as Gender;

  return {
    id: authUser.id,
    name: fullName,
    email,
    avatar: metadata.avatar_url || getAvatarByGender(fullName, gender),
    rating: 0,
    reviewCount: 0,
    isSeller: false,
    joinDate:
      authUser.created_at?.split('T')?.[0] ||
      new Date().toISOString().split('T')[0],
    verificationStatus: 'pending',
    gender,
    city: metadata.city || 'Lima',
    accountType: 'buyer',

    username: metadata.username || getUsernameFromEmail(email),
    bio: '',
    phone: '',
    membershipType: 'free',
    membership: 'free',
    plan: 'free',
    sellerBadge: 'standard',
    subscriptionStatus: 'free',
    commissionRate: 8,
    monthlyListingLimit: 3,
  } as ExtendedUser;
}

async function fetchProfileUser(authUser: any): Promise<ExtendedUser> {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', authUser.id)
      .maybeSingle();

    if (error) {
      console.warn('[La Segunda] Error leyendo profiles:', error.message);
      return buildFallbackUserFromAuth(authUser);
    }

    if (!profile) {
      return buildFallbackUserFromAuth(authUser);
    }

    return normalizeProfileToUser(profile as ProfileRow);
  } catch (error) {
    console.warn('[La Segunda] Error cargando profile:', error);
    return buildFallbackUserFromAuth(authUser);
  }
}

async function upsertProfileFromAuth(
  authUser: any,
  extra?: {
    name?: string;
    city?: string;
    gender?: Gender;
    accountType?: AccountType;
  }
) {
  const metadata = authUser?.user_metadata || {};
  const email = authUser.email || '';

  const fullName =
    extra?.name ||
    metadata.full_name ||
    metadata.name ||
    email.split('@')[0] ||
    'Usuario La Segunda';

  const gender = extra?.gender || metadata.gender || 'neutral';
  const city = extra?.city || metadata.city || 'Lima';

  try {
    const { error } = await supabase.from('profiles').upsert(
      {
        user_id: authUser.id,
        full_name: fullName,
        username: metadata.username || getUsernameFromEmail(email),
        email,
        phone: '',
        city,
        bio: '',
        avatar_url: metadata.avatar_url || null,
        gender,
        account_type: extra?.accountType || 'buyer',
        verification_status: 'pending',
        is_seller: false,
        membership_type: 'free',
        seller_badge: 'standard',
        subscription_status: 'free',
        commission_rate: 8,
        monthly_listing_limit: 3,
        rating: 0,
        review_count: 0,
      },
      {
        onConflict: 'user_id',
      }
    );

    if (error) {
      console.warn('[La Segunda] Error creando profile:', error.message);
    }
  } catch (error) {
    console.warn('[La Segunda] Error creando profile:', error);
  }
}

function mapUserDataToProfileUpdates(userData: Partial<ExtendedUser>) {
  const profileUpdates: Record<string, any> = {};

  if (userData.name !== undefined) profileUpdates.full_name = userData.name;
  if (userData.email !== undefined) profileUpdates.email = userData.email;
  if (userData.avatar !== undefined) profileUpdates.avatar_url = userData.avatar;
  if (userData.city !== undefined) profileUpdates.city = userData.city;
  if (userData.bio !== undefined) profileUpdates.bio = userData.bio;
  if (userData.phone !== undefined) profileUpdates.phone = userData.phone;
  if (userData.username !== undefined) profileUpdates.username = userData.username;
  if (userData.gender !== undefined) profileUpdates.gender = userData.gender;
  if (userData.accountType !== undefined) {
    profileUpdates.account_type = userData.accountType;
  }
  if (userData.isSeller !== undefined) profileUpdates.is_seller = userData.isSeller;
  if (userData.verificationStatus !== undefined) {
    profileUpdates.verification_status = userData.verificationStatus;
  }
  if (userData.membershipType !== undefined) {
    profileUpdates.membership_type = userData.membershipType;
  }
  if (userData.sellerBadge !== undefined) {
    profileUpdates.seller_badge = userData.sellerBadge;
  }
  if (userData.subscriptionStatus !== undefined) {
    profileUpdates.subscription_status = userData.subscriptionStatus;
  }
  if (userData.commissionRate !== undefined) {
    profileUpdates.commission_rate = userData.commissionRate;
  }
  if (userData.monthlyListingLimit !== undefined) {
    profileUpdates.monthly_listing_limit = userData.monthlyListingLimit;
  }
  if (userData.rating !== undefined) profileUpdates.rating = userData.rating;
  if (userData.reviewCount !== undefined) {
    profileUpdates.review_count = userData.reviewCount;
  }

  return profileUpdates;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadSession = useCallback(async () => {
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.getSession();

      if (error || !data.session?.user) {
        setUser(null);
        removeUserFromStorage();
        return;
      }

      const profileUser = await fetchProfileUser(data.session.user);

      setUser(profileUser);
      saveUserToStorage(profileUser);
    } catch (error) {
      console.warn('[La Segunda] Error cargando sesión:', error);

      const savedUser = loadUserFromStorage();

      if (savedUser) {
        setUser(savedUser);
      } else {
        setUser(null);
        removeUserFromStorage();
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;

      if (!session?.user) {
        setUser(null);
        removeUserFromStorage();
        setIsLoading(false);
        return;
      }

      const fallbackUser = buildFallbackUserFromAuth(session.user);

      setUser(fallbackUser);
      saveUserToStorage(fallbackUser);
      setIsLoading(false);

      window.setTimeout(async () => {
        if (!mounted) return;

        const profileUser = await fetchProfileUser(session.user);

        if (!mounted) return;

        setUser(profileUser);
        saveUserToStorage(profileUser);
      }, 0);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadSession]);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);

    try {
      const cleanEmail = email.trim().toLowerCase();

      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        throw error;
      }

      if (!data.user || !data.session) {
        throw new Error('No se pudo iniciar sesión.');
      }

      const fallbackUser = buildFallbackUserFromAuth(data.user);

      setUser(fallbackUser);
      saveUserToStorage(fallbackUser);
      setIsLoading(false);

      window.setTimeout(async () => {
        await upsertProfileFromAuth(data.user);
        const profileUser = await fetchProfileUser(data.user);

        setUser(profileUser);
        saveUserToStorage(profileUser);
      }, 0);
    } finally {
      setIsLoading(false);
    }
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

      try {
        const cleanName = name.trim();
        const cleanEmail = email.trim().toLowerCase();
        const cleanCity = city.trim() || 'Lima';
        const username = getUsernameFromEmail(cleanEmail);

        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              full_name: cleanName,
              name: cleanName,
              username,
              gender,
              city: cleanCity,
              account_type: 'buyer',
            },
          },
        });

        if (error) {
          throw error;
        }

        if (!data.user) {
          throw new Error('No se pudo crear el usuario en Supabase.');
        }

        await upsertProfileFromAuth(data.user, {
          name: cleanName,
          city: cleanCity,
          gender,
          accountType: 'buyer',
        });

        if (data.session) {
          const profileUser = await fetchProfileUser(data.user);

          setUser(profileUser);
          saveUserToStorage(profileUser);
        } else {
          setUser(null);
          removeUserFromStorage();
        }
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const logout = useCallback(() => {
    void (async () => {
      setIsLoading(true);

      try {
        await supabase.auth.signOut();
      } finally {
        setUser(null);
        removeUserFromStorage();
        setIsLoading(false);
      }
    })();
  }, []);

  const updateUser = useCallback((userData: Partial<ExtendedUser>) => {
    setUser((currentUser) => {
      if (!currentUser) return currentUser;

      const updatedUser: ExtendedUser = {
        ...currentUser,
        ...userData,
      };

      saveUserToStorage(updatedUser);

      window.setTimeout(async () => {
        const { data } = await supabase.auth.getUser();

        if (!data.user) return;

        const profileUpdates = mapUserDataToProfileUpdates(userData);

        if (Object.keys(profileUpdates).length === 0) return;

        const { error } = await supabase
          .from('profiles')
          .update(profileUpdates)
          .eq('user_id', data.user.id);

        if (error) {
          console.error('[La Segunda] Error actualizando profile:', error.message);
        }
      }, 0);

      return updatedUser;
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: Boolean(user),
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
