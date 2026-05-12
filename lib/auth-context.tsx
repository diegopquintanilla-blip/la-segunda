'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import type { User } from '@/lib/mock-data';
import { supabase } from '@/lib/supabase/client';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    gender?: 'male' | 'female' | 'neutral',
    city?: string
  ) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

type ProfileRow = {
  user_id?: string;
  full_name?: string | null;
  username?: string | null;
  email?: string | null;
  phone?: string | null;
  city?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
  gender?: 'male' | 'female' | 'neutral' | null;
  account_type?: 'buyer' | 'seller' | 'both' | null;
  verification_status?: 'pending' | 'verified' | 'rejected' | null;
  is_seller?: boolean | null;
  membership_type?: string | null;
  rating?: number | null;
  review_count?: number | null;
  created_at?: string | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs = 12000,
  message = 'La conexión demoró demasiado. Intenta nuevamente.'
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      window.setTimeout(() => {
        reject(new Error(message));
      }, timeoutMs);
    }),
  ]);
}

function saveCurrentUser(user: User | null) {
  if (typeof window === 'undefined') return;

  if (!user) {
    localStorage.removeItem('currentUser');
    return;
  }

  localStorage.setItem('currentUser', JSON.stringify(user));
}

function buildUser(authUser: any, profile?: ProfileRow | null): User {
  const metadata = authUser?.user_metadata || {};

  return {
    id: authUser.id,
    name:
      profile?.full_name ||
      metadata.full_name ||
      metadata.name ||
      authUser.email?.split('@')?.[0] ||
      'Usuario La Segunda',
    email: profile?.email || authUser.email || '',
    avatar: profile?.avatar_url || metadata.avatar_url || '',
    rating: Number(profile?.rating || 0),
    reviewCount: Number(profile?.review_count || 0),
    isSeller: Boolean(profile?.is_seller || false),
    joinDate:
      profile?.created_at?.split('T')?.[0] ||
      authUser.created_at?.split('T')?.[0] ||
      new Date().toISOString().split('T')[0],
    verificationStatus: profile?.verification_status || 'pending',
    gender: profile?.gender || metadata.gender || 'neutral',
    city: profile?.city || metadata.city || 'Lima',
    accountType: profile?.account_type || 'buyer',
    membershipType: profile?.membership_type || 'free',
  } as User;
}

async function getProfile(userId: string) {
  const { data, error } = await withTimeout(
    supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle(),
    12000,
    'No se pudo cargar el perfil desde Supabase.'
  );

  if (error) {
    console.warn('[La Segunda] No se pudo cargar profiles:', error.message);
    return null;
  }

  return data as ProfileRow | null;
}

async function upsertProfile(authUser: any, extra?: Partial<ProfileRow>) {
  const metadata = authUser?.user_metadata || {};

  const payload = {
    user_id: authUser.id,
    full_name:
      extra?.full_name ||
      metadata.full_name ||
      metadata.name ||
      authUser.email?.split('@')?.[0] ||
      'Usuario La Segunda',
    email: authUser.email || extra?.email || '',
    city: extra?.city || metadata.city || 'Lima',
    gender: extra?.gender || metadata.gender || 'neutral',
    account_type: extra?.account_type || 'buyer',
    verification_status: extra?.verification_status || 'pending',
    is_seller: extra?.is_seller || false,
    membership_type: extra?.membership_type || 'free',
    rating: 0,
    review_count: 0,
  };

  const { error } = await supabase
    .from('profiles')
    .upsert(payload, { onConflict: 'user_id' });

  if (error) {
    console.warn('[La Segunda] No se pudo crear/actualizar profile:', error.message);
  }
}

function mapUserPatchToProfile(userData: Partial<User>) {
  const patch: Record<string, any> = {};

  if ('name' in userData) patch.full_name = userData.name;
  if ('email' in userData) patch.email = userData.email;
  if ('avatar' in userData) patch.avatar_url = userData.avatar;
  if ('city' in userData) patch.city = userData.city;
  if ('gender' in userData) patch.gender = userData.gender;
  if ('accountType' in userData) patch.account_type = userData.accountType;
  if ('verificationStatus' in userData) {
    patch.verification_status = userData.verificationStatus;
  }
  if ('isSeller' in userData) patch.is_seller = userData.isSeller;
  if ('membershipType' in userData) patch.membership_type = userData.membershipType;
  if ('rating' in userData) patch.rating = userData.rating;
  if ('reviewCount' in userData) patch.review_count = userData.reviewCount;

  return patch;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadCurrentUser = useCallback(async () => {
    setIsLoading(true);

    try {
      const {
        data: { session },
      } = await withTimeout(
        supabase.auth.getSession(),
        12000,
        'No se pudo recuperar la sesión.'
      );

      if (!session?.user) {
        setUser(null);
        saveCurrentUser(null);
        return;
      }

      const profile = await getProfile(session.user.id);
      const mappedUser = buildUser(session.user, profile);

      setUser(mappedUser);
      saveCurrentUser(mappedUser);
    } catch (error) {
      console.warn('[La Segunda] Error cargando sesión:', error);

      try {
        const saved = localStorage.getItem('currentUser');
        if (saved) {
          setUser(JSON.parse(saved));
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCurrentUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session?.user) {
        setUser(null);
        saveCurrentUser(null);
        setIsLoading(false);
        return;
      }

      const profile = await getProfile(session.user.id);
      const mappedUser = buildUser(session.user, profile);

      setUser(mappedUser);
      saveCurrentUser(mappedUser);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [loadCurrentUser]);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);

    try {
      const { data, error } = await withTimeout(
        supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        }),
        12000,
        'La validación está demorando demasiado. Revisa Supabase o intenta nuevamente.'
      );

      if (error) throw error;

      if (!data.user || !data.session) {
        throw new Error('No se pudo iniciar sesión. Verifica tus credenciales.');
      }

      let profile = await getProfile(data.user.id);

      if (!profile) {
        await upsertProfile(data.user);
        profile = await getProfile(data.user.id);
      }

      const mappedUser = buildUser(data.user, profile);

      setUser(mappedUser);
      saveCurrentUser(mappedUser);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(
    async (
      name: string,
      email: string,
      password: string,
      gender: 'male' | 'female' | 'neutral' = 'neutral',
      city = 'Lima'
    ) => {
      setIsLoading(true);

      try {
        const { data, error } = await withTimeout(
          supabase.auth.signUp({
            email: email.trim().toLowerCase(),
            password,
            options: {
              data: {
                full_name: name,
                name,
                gender,
                city,
              },
            },
          }),
          12000,
          'El registro está demorando demasiado. Intenta nuevamente.'
        );

        if (error) throw error;

        if (!data.user) {
          throw new Error('No se pudo crear el usuario.');
        }

        await upsertProfile(data.user, {
          full_name: name,
          email,
          gender,
          city,
          account_type: 'buyer',
          verification_status: 'pending',
          is_seller: false,
          membership_type: 'free',
        });

        const profile = await getProfile(data.user.id);
        const mappedUser = buildUser(data.user, profile);

        setUser(mappedUser);
        saveCurrentUser(mappedUser);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const logout = useCallback(async () => {
    setIsLoading(true);

    try {
      await supabase.auth.signOut();
    } finally {
      setUser(null);
      saveCurrentUser(null);
      setIsLoading(false);
    }
  }, []);

  const updateUser = useCallback(
    (userData: Partial<User>) => {
      if (!user) return;

      const updatedUser = {
        ...user,
        ...userData,
      };

      setUser(updatedUser);
      saveCurrentUser(updatedUser);

      const profilePatch = mapUserPatchToProfile(userData);

      if (Object.keys(profilePatch).length > 0) {
        supabase
          .from('profiles')
          .update(profilePatch)
          .eq('user_id', user.id)
          .then(({ error }) => {
            if (error) {
              console.warn('[La Segunda] Error actualizando profile:', error.message);
            }
          });
      }
    },
    [user]
  );

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
