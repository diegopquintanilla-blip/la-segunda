'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from 'react';
import { User } from '@/lib/mock-data';
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
  const fullName =
    metadata.full_name ||
    metadata.name ||
    authUser?.email?.split('@')?.[0] ||
    'Usuario La Segunda';

  const gender = (metadata.gender || 'neutral') as Gender;

  return {
    id: authUser.id,
    name: fullName,
    email: authUser.email || '',
    avatar: getAvatarByGender(fullName, gender),
    rating: 0,
    reviewCount: 0,
    isSeller: false,
    joinDate: new Date().toISOString().split('T')[0],
    verificationStatus: 'pending',
    gender,
    city: metadata.city || '',
    accountType: 'buyer',

    username: metadata.username || authUser?.email?.split('@')?.[0] || '',
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
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', authUser.id)
    .maybeSingle();

  if (error) {
    console.error('[La Segunda] Error leyendo profiles:', error.message);
    return buildFallbackUserFromAuth(authUser);
  }

  if (!profile) {
    return buildFallbackUserFromAuth(authUser);
  }

  return normalizeProfileToUser(profile as ProfileRow);
}

function getUsernameFromEmail(email: string) {
  return (
    email
      .split('@')[0]
      ?.toLowerCase()
      .replace(/[^a-z0-9._-]/g, '') || ''
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadSession = async () => {
      setIsLoading(true);

      const { data, error } = await supabase.auth.getSession();

      if (error || !data.session?.user) {
        if (mounted) {
          setUser(null);
          removeUserFromStorage();
          setIsLoading(false);
        }
        return;
      }

      const profileUser = await fetchProfileUser(data.session.user);

      if (mounted) {
        setUser(profileUser);
        saveUserToStorage(profileUser);
        setIsLoading(false);
      }
    };

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session?.user) {
        setUser(null);
        removeUserFromStorage();
        return;
      }

      const profileUser = await fetchProfileUser(session.user);
      setUser(profileUser);
      saveUserToStorage(profileUser);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

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

      if (!data.user) {
        throw new Error('No se pudo iniciar sesión.');
      }

      const profileUser = await fetchProfileUser(data.user);

      setUser(profileUser);
      saveUserToStorage(profileUser);
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
        const cleanCity = city.trim();
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

        /*
          El perfil se debe crear automáticamente por el trigger:
          public.handle_new_user()

          Si Supabase entrega sesión inmediata, cargamos el perfil.
          Si requiere confirmación de email, el usuario aparecerá en Authentication
          y podrá iniciar sesión luego de confirmar.
        */

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
      await supabase.auth.signOut();
      setUser(null);
      removeUserFromStorage();
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

      void (async () => {
        const { data } = await supabase.auth.getUser();

        if (!data.user) return;

        const profileUpdates: Record<string, any> = {};

        if (userData.name !== undefined) {
          profileUpdates.full_name = userData.name;
        }

        if (userData.city !== undefined) {
          profileUpdates.city = userData.city;
        }

        if (userData.bio !== undefined) {
          profileUpdates.bio = userData.bio;
        }

        if (userData.gender !== undefined) {
          profileUpdates.gender = userData.gender;
        }

        if (userData.accountType !== undefined) {
          profileUpdates.account_type = userData.accountType;
        }

        if (userData.isSeller !== undefined) {
          profileUpdates.is_seller = userData.isSeller;
        }

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

        if (Object.keys(profileUpdates).length === 0) return;

        const { error } = await supabase
          .from('profiles')
          .update(profileUpdates)
          .eq('user_id', data.user.id);

        if (error) {
          console.error('[La Segunda] Error actualizando profile:', error.message);
        }
      })();

      return updatedUser;
    });
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
