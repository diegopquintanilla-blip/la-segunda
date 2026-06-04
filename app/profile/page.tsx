'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  Camera,
  CheckCircle,
  Edit3,
  Eye,
  Heart,
  Loader2,
  Mail,
  MapPin,
  PackagePlus,
  Phone,
  Save,
  ShieldCheck,
  Star,
  Trash2,
  Upload,
  User,
  X,
} from 'lucide-react';

import { Header } from '@/components/header';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

type ProfileData = {
  id?: string | null;
  user_id?: string | null;
  full_name?: string | null;
  username?: string | null;
  email?: string | null;
  phone?: string | null;
  city?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
  gender?: 'male' | 'female' | 'neutral' | string | null;
  account_type?: 'buyer' | 'seller' | 'both' | string | null;
  verification_status?: 'pending' | 'verified' | 'rejected' | string | null;
  is_seller?: boolean | null;
  membership_type?: string | null;
  seller_badge?: string | null;
  subscription_status?: string | null;
  commission_rate?: number | null;
  monthly_listing_limit?: number | null;
  rating?: number | null;
  review_count?: number | null;
  created_at?: string | null;
};

type ProductRow = {
  id: string;

  seller_id?: string | null;
  user_id?: string | null;
  owner_id?: string | null;

  sellerId?: string | null;
  userId?: string | null;
  ownerId?: string | null;

  title?: string | null;
  name?: string | null;
  description?: string | null;
  category?: string | null;
  condition?: string | null;
  price?: number | string | null;
  city?: string | null;
  status?: string | null;

  images?: string[] | string | null;
  image?: string | null;
  image_url?: string | null;
  thumbnail_url?: string | null;

  views?: number | string | null;
  view_count?: number | string | null;
  views_count?: number | string | null;

  favorite_count?: number | string | null;
  favorites_count?: number | string | null;
  favoriteCount?: number | string | null;

  created_at?: string | null;
  createdAt?: string | null;
};

const DEFAULT_PRODUCT_IMAGE = 'https://placehold.co/700x520?text=La+Segunda';
const DEFAULT_AVATAR = 'https://placehold.co/180x180?text=LS';

function isValidImageUrl(value?: string | null) {
  if (!value) return false;

  const cleanValue = String(value).trim();

  return (
    cleanValue.startsWith('http://') ||
    cleanValue.startsWith('https://') ||
    cleanValue.startsWith('/') ||
    cleanValue.startsWith('data:image') ||
    cleanValue.startsWith('blob:')
  );
}

function parseImages(value?: string[] | string | null): string[] {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  if (typeof value === 'string') {
    const cleanValue = value.trim();

    if (!cleanValue) return [];

    try {
      const parsed = JSON.parse(cleanValue);

      if (Array.isArray(parsed)) {
        return parsed.filter(Boolean);
      }
    } catch {
      return [cleanValue];
    }

    return [cleanValue];
  }

  return [];
}

function getAvatarEmoji(gender?: string | null) {
  if (gender === 'male') return '👨‍💼';
  if (gender === 'female') return '👩‍💼';
  return '🙂';
}

function getAccountTypeLabel(accountType?: string | null) {
  if (accountType === 'seller') return 'Vendedor';
  if (accountType === 'both') return 'Comprador + Vendedor';
  return 'Comprador';
}

function getProductOwnerId(product: ProductRow) {
  return (
    product.seller_id ||
    product.user_id ||
    product.owner_id ||
    product.sellerId ||
    product.userId ||
    product.ownerId ||
    ''
  );
}

function getProductTitle(product: ProductRow) {
  return product.title || product.name || 'Producto sin nombre';
}

function getProductImage(product: ProductRow) {
  const images = parseImages(product.images);

  const image =
    product.image_url ||
    images[0] ||
    product.image ||
    product.thumbnail_url ||
    '';

  return isValidImageUrl(image) ? image : DEFAULT_PRODUCT_IMAGE;
}

function getProductPrice(product: ProductRow) {
  return Number(product.price || 0);
}

function getProductViews(product: ProductRow) {
  return Number(product.views ?? product.views_count ?? product.view_count ?? 0);
}

function getProductFavorites(product: ProductRow) {
  return Number(
    product.favorite_count ??
      product.favorites_count ??
      product.favoriteCount ??
      0
  );
}

function getProductStatus(product: ProductRow) {
  return String(product.status || 'active').toLowerCase();
}

function getStatusLabel(status?: string | null) {
  const value = String(status || 'active').toLowerCase();

  if (value === 'active') return 'Disponible';
  if (value === 'published') return 'Disponible';
  if (value === 'available') return 'Disponible';
  if (value === 'reserved') return 'Reservado';
  if (value === 'sold') return 'Vendido';
  if (value === 'pending') return 'Pendiente';
  if (value === 'inactive') return 'Inactivo';

  return 'Disponible';
}

function getStatusClass(status?: string | null) {
  const value = String(status || 'active').toLowerCase();

  if (value === 'reserved') {
    return 'bg-amber-100 text-amber-800 hover:bg-amber-100';
  }

  if (value === 'sold') {
    return 'bg-slate-700 text-white hover:bg-slate-700';
  }

  if (value === 'pending') {
    return 'bg-slate-100 text-slate-700 hover:bg-slate-100';
  }

  return 'bg-blue-950 text-white hover:bg-blue-950';
}

function sortProductsByDate(products: ProductRow[]) {
  return [...products].sort((a, b) => {
    const dateA = new Date(a.created_at || a.createdAt || 0).getTime();
    const dateB = new Date(b.created_at || b.createdAt || 0).getTime();

    return dateB - dateA;
  });
}

function formatDate(date?: string | null) {
  if (!date) return 'Fecha no disponible';

  try {
    return new Date(date).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return 'Fecha no disponible';
  }
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, updateUser } = useAuth();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const currentUser = user as any;

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const [fullNameText, setFullNameText] = useState('');
  const [emailText, setEmailText] = useState('');
  const [phoneText, setPhoneText] = useState('');
  const [cityText, setCityText] = useState('');
  const [bioText, setBioText] = useState('');

  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');
  const [profileError, setProfileError] = useState('');

  const [avatarLoadError, setAvatarLoadError] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarMessage, setAvatarMessage] = useState('');
  const [avatarError, setAvatarError] = useState('');

  const [products, setProducts] = useState<ProductRow[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [productMessage, setProductMessage] = useState('');
  const [productError, setProductError] = useState('');
  const [isDeletingProductId, setIsDeletingProductId] = useState<string | null>(
    null
  );

  const loadProfile = useCallback(async () => {
    if (!user?.id) return;

    setProfileError('');

    try {
      const columns = ['user_id', 'id'];
      let loadedProfile: ProfileData | null = null;

      for (const column of columns) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq(column, user.id)
          .maybeSingle();

        if (!error && data) {
          loadedProfile = data as ProfileData;
          break;
        }
      }

      if (!loadedProfile) {
        setFullNameText(currentUser?.name || '');
        setEmailText(currentUser?.email || '');
        setPhoneText(currentUser?.phone || '');
        setCityText(currentUser?.city || '');
        setBioText(currentUser?.bio || '');
        return;
      }

      setProfile(loadedProfile);
      setFullNameText(loadedProfile.full_name || currentUser?.name || '');
      setEmailText(loadedProfile.email || currentUser?.email || '');
      setPhoneText(loadedProfile.phone || currentUser?.phone || '');
      setCityText(loadedProfile.city || currentUser?.city || '');
      setBioText(loadedProfile.bio || currentUser?.bio || '');
      setAvatarLoadError(false);
    } catch (error: any) {
      setProfileError(error?.message || 'No se pudo cargar el perfil.');
    }
  }, [
    user?.id,
    currentUser?.name,
    currentUser?.email,
    currentUser?.phone,
    currentUser?.city,
    currentUser?.bio,
  ]);

  const updateProfileInSupabase = async (payload: Record<string, any>) => {
    if (!user?.id) {
      throw new Error('Debes iniciar sesión para actualizar tu perfil.');
    }

    const columns = ['user_id', 'id'];
    let updated = false;
    let lastError: any = null;

    for (const column of columns) {
      const { error } = await supabase
        .from('profiles')
        .update(payload)
        .eq(column, user.id);

      if (!error) {
        updated = true;
        break;
      }

      lastError = error;
    }

    if (updated) return;

    const upsertById = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        ...payload,
      });

    if (!upsertById.error) return;

    const upsertByUserId = await supabase
      .from('profiles')
      .upsert({
        user_id: user.id,
        ...payload,
      });

    if (upsertByUserId.error) {
      throw lastError || upsertByUserId.error;
    }
  };

  const loadProducts = useCallback(async () => {
    if (!user?.id) return;

    setIsLoadingProducts(true);
    setProductError('');

    try {
      const ownerColumns = ['seller_id', 'user_id', 'owner_id'];
      const combinedProducts: ProductRow[] = [];
      let hadValidColumn = false;

      for (const column of ownerColumns) {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq(column, user.id);

        if (!error && Array.isArray(data)) {
          hadValidColumn = true;
          combinedProducts.push(...(data as ProductRow[]));
        }
      }

      if (hadValidColumn) {
        const uniqueProducts = Array.from(
          new Map(combinedProducts.map((product) => [product.id, product])).values()
        );

        setProducts(sortProductsByDate(uniqueProducts));
        return;
      }

      const { data, error } = await supabase.from('products').select('*');

      if (error) throw error;

      const rows = Array.isArray(data) ? (data as ProductRow[]) : [];

      const filteredProducts = rows.filter((product) => {
        const ownerId = getProductOwnerId(product);
        return ownerId === user.id;
      });

      setProducts(sortProductsByDate(filteredProducts));
    } catch (error: any) {
      setProducts([]);
      setProductError(
        error?.message || 'No se pudieron cargar tus publicaciones.'
      );
    } finally {
      setIsLoadingProducts(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;

    loadProfile();
    loadProducts();
  }, [isAuthenticated, user?.id, loadProfile, loadProducts]);

  const displayName =
    profile?.full_name ||
    currentUser?.name ||
    currentUser?.email?.split('@')?.[0] ||
    'Usuario La Segunda';

  const displayEmail = profile?.email || currentUser?.email || '';
  const displayPhone = profile?.phone || currentUser?.phone || '';
  const displayCity = profile?.city || currentUser?.city || 'Perú';
  const displayBio =
    profile?.bio ||
    currentUser?.bio ||
    'Completa tu descripción para generar mayor confianza en tus publicaciones.';

  const accountType = profile?.account_type || currentUser?.accountType || 'buyer';

  const verificationStatus =
    profile?.verification_status ||
    currentUser?.verificationStatus ||
    'pending';

  const membershipType = String(
    profile?.membership_type ||
      currentUser?.membershipType ||
      currentUser?.membership ||
      currentUser?.plan ||
      'free'
  ).toLowerCase();

  const gender = profile?.gender || currentUser?.gender || 'neutral';
  const rating = Number(profile?.rating || currentUser?.rating || 0);
  const reviewCount = Number(
    profile?.review_count || currentUser?.reviewCount || 0
  );

  const safeAvatarUrl =
    profile?.avatar_url && isValidImageUrl(profile.avatar_url)
      ? profile.avatar_url
      : currentUser?.avatar && isValidImageUrl(currentUser.avatar)
        ? currentUser.avatar
        : '';

  const shouldShowImageAvatar = Boolean(safeAvatarUrl) && !avatarLoadError;

  const userProducts = useMemo(() => {
    if (!user?.id) return [];

    return products.filter((product) => {
      const ownerId = getProductOwnerId(product);

      if (!ownerId) return true;

      return ownerId === user.id;
    });
  }, [products, user?.id]);

  const publishedProducts = userProducts.filter((product) => {
    const status = getProductStatus(product);

    return !['sold', 'deleted', 'inactive', 'archived'].includes(status);
  });

  const activeProducts = userProducts.filter((product) => {
    const status = getProductStatus(product);

    return status === 'active' || status === 'published' || status === 'available';
  });

  const totalViews = userProducts.reduce(
    (sum, product) => sum + getProductViews(product),
    0
  );

  const totalFavorites = userProducts.reduce(
    (sum, product) => sum + getProductFavorites(product),
    0
  );

  const profileLimit = Number(profile?.monthly_listing_limit || 0);
  const planLimit = 2;
  const postingLimit = profileLimit > 0 ? profileLimit : planLimit;

  const remainingPosts = Math.max(postingLimit - publishedProducts.length, 0);
  const canPublish = remainingPosts > 0;

  const hasPublicContact = Boolean(displayName && displayEmail && displayPhone);

  const handleSelectAvatar = () => {
    fileInputRef.current?.click();
  };

  const handleUploadAvatar = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setAvatarMessage('');
    setAvatarError('');

    const file = event.target.files?.[0];
    if (!file) return;

    if (!user?.id) {
      setAvatarError('Debes iniciar sesión para subir una imagen.');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setAvatarError('Solo puedes subir archivos de imagen.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setAvatarError('La imagen no debe superar los 2 MB.');
      return;
    }

    setIsUploadingAvatar(true);

    try {
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `avatar-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData.publicUrl;

      await updateProfileInSupabase({
        avatar_url: publicUrl,
      });

      setProfile((currentProfile) => ({
        ...(currentProfile || {}),
        id: currentProfile?.id || user.id,
        user_id: currentProfile?.user_id || user.id,
        avatar_url: publicUrl,
      }));

      updateUser({ avatar: publicUrl } as any);

      setAvatarLoadError(false);
      setAvatarMessage('Foto de perfil actualizada correctamente.');
    } catch (error: any) {
      setAvatarError(
        error?.message || 'No se pudo subir la imagen. Intenta nuevamente.'
      );
    } finally {
      setIsUploadingAvatar(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSaveProfile = async () => {
    setProfileMessage('');
    setProfileError('');

    if (!user?.id) {
      setProfileError('Debes iniciar sesión para editar tu perfil.');
      return;
    }

    if (!fullNameText.trim()) {
      setProfileError('Ingresa tu nombre visible.');
      return;
    }

    if (!emailText.trim()) {
      setProfileError('Ingresa tu correo visible.');
      return;
    }

    if (!phoneText.trim()) {
      setProfileError('Ingresa tu teléfono visible.');
      return;
    }

    setIsSavingProfile(true);

    try {
      const payload = {
        full_name: fullNameText.trim(),
        email: emailText.trim(),
        phone: phoneText.trim(),
        city: cityText.trim(),
        bio: bioText.trim(),
      };

      await updateProfileInSupabase(payload);

      setProfile((currentProfile) => ({
        ...(currentProfile || {}),
        id: currentProfile?.id || user.id,
        user_id: currentProfile?.user_id || user.id,
        ...payload,
      }));

      updateUser({
        name: payload.full_name,
        email: payload.email,
        phone: payload.phone,
        city: payload.city,
        bio: payload.bio,
      } as any);

      setIsEditingProfile(false);
      setProfileMessage('Perfil actualizado correctamente.');
    } catch (error: any) {
      setProfileError(
        error?.message || 'No se pudo actualizar el perfil. Intenta nuevamente.'
      );
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleCancelEditProfile = () => {
    setIsEditingProfile(false);
    setFullNameText(profile?.full_name || currentUser?.name || '');
    setEmailText(profile?.email || currentUser?.email || '');
    setPhoneText(profile?.phone || currentUser?.phone || '');
    setCityText(profile?.city || currentUser?.city || '');
    setBioText(profile?.bio || currentUser?.bio || '');
    setProfileError('');
  };

  const handleDeleteProduct = async (productId: string) => {
    const confirmed = window.confirm(
      '¿Seguro que deseas eliminar esta publicación?'
    );

    if (!confirmed) return;

    setIsDeletingProductId(productId);
    setProductMessage('');
    setProductError('');

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      setProducts((currentProducts) =>
        currentProducts.filter((product) => product.id !== productId)
      );

      setProductMessage('Publicación eliminada correctamente.');
    } catch (error: any) {
      setProductError(
        error?.message || 'No se pudo eliminar la publicación.'
      );
    } finally {
      setIsDeletingProductId(null);
    }
  };

  const getVerificationBadge = () => {
    if (verificationStatus === 'verified') {
      return (
        <Badge className="border-green-200 bg-green-50 text-green-700 hover:bg-green-50">
          <ShieldCheck className="mr-1 h-3 w-3" />
          Verificado
        </Badge>
      );
    }

    if (verificationStatus === 'rejected') {
      return (
        <Badge className="border-red-200 bg-red-50 text-red-700 hover:bg-red-50">
          <AlertCircle className="mr-1 h-3 w-3" />
          Rechazado
        </Badge>
      );
    }

    return (
      <Badge className="border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-50">
        <AlertCircle className="mr-1 h-3 w-3" />
        Pendiente
      </Badge>
    );
  };

  const getPlanBadge = () => {
    if (membershipType === 'premium') {
      return (
        <Badge className="border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-50">
          Premium
        </Badge>
      );
    }

    if (membershipType === 'plus') {
      return (
        <Badge className="border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-50">
          Plus
        </Badge>
      );
    }

    return (
      <Badge className="border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-50">
        Básico
      </Badge>
    );
  };

  if (isLoading || !isAuthenticated || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F8FB]">
        <div className="text-center">
          <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-blue-950" />
          <p className="text-sm text-slate-500">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F8FB] text-slate-950">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-6">
        {/* HERO PERFIL */}
        <section className="mb-6 overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white shadow-xl">
          <div className="h-3 bg-gradient-to-r from-blue-700 via-blue-500 to-orange-500" />

          <div className="p-6 md:p-10">
            <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-end">
              <div className="flex flex-col gap-5 md:flex-row md:items-end">
                <div className="relative h-28 w-28 flex-shrink-0">
                  <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-[2rem] border-4 border-white/20 bg-white/10 shadow-xl backdrop-blur">
                    {shouldShowImageAvatar ? (
                      <img
                        src={safeAvatarUrl}
                        alt="Foto de perfil"
                        className="h-full w-full object-cover"
                        onError={() => setAvatarLoadError(true)}
                      />
                    ) : (
                      <span className="text-5xl">
                        {getAvatarEmoji(gender)}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleSelectAvatar}
                    disabled={isUploadingAvatar}
                    className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-600 text-white shadow-lg transition hover:bg-orange-700 disabled:opacity-60"
                  >
                    {isUploadingAvatar ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Camera className="h-4 w-4" />
                    )}
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleUploadAvatar}
                  />
                </div>

                <div>
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    {getVerificationBadge()}
                    {getPlanBadge()}
                  </div>

                  <h1 className="text-3xl font-black leading-tight md:text-5xl">
                    {displayName}
                  </h1>

                  <p className="mt-3 max-w-2xl text-slate-200">
                    {displayBio}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2 text-sm text-slate-200">
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1">
                      <MapPin className="h-4 w-4" />
                      {displayCity}
                    </span>

                    <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1">
                      <User className="h-4 w-4" />
                      {getAccountTypeLabel(accountType)}
                    </span>

                    <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      {rating} / {reviewCount} reseñas
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
                <p className="mb-4 text-sm font-medium text-slate-200">
                  Resumen de actividad
                </p>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-2xl bg-white/10 p-4">
                    <p className="text-2xl font-black">
                      {publishedProducts.length}
                    </p>
                    <p className="mt-1 text-xs text-slate-300">Publicados</p>
                  </div>

                  <div className="rounded-2xl bg-white/10 p-4">
                    <p className="text-2xl font-black">{totalViews}</p>
                    <p className="mt-1 text-xs text-slate-300">Vistas</p>
                  </div>

                  <div className="rounded-2xl bg-white/10 p-4">
                    <p className="text-2xl font-black">{totalFavorites}</p>
                    <p className="mt-1 text-xs text-slate-300">Favoritos</p>
                  </div>
                </div>

                <Button
                  className="mt-4 h-11 w-full rounded-xl bg-orange-600 hover:bg-orange-700"
                  onClick={() => setIsEditingProfile(true)}
                >
                  <Edit3 className="mr-2 h-4 w-4" />
                  Editar perfil
                </Button>
              </div>
            </div>
          </div>
        </section>

        {avatarMessage && (
          <div className="mb-5 flex items-center gap-2 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            <CheckCircle className="h-4 w-4" />
            {avatarMessage}
          </div>
        )}

        {avatarError && (
          <div className="mb-5 flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle className="h-4 w-4" />
            {avatarError}
          </div>
        )}

        {/* PERFIL Y CONTACTO */}
        <section className="mb-6 grid items-start gap-6 lg:grid-cols-[1fr_390px]">
          <Card className="rounded-[2rem] border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle className="text-2xl font-black text-slate-950">
                    Perfil público
                  </CardTitle>

                  <CardDescription>
                    Estos datos ayudan a que los compradores confíen y puedan
                    contactarte.
                  </CardDescription>
                </div>

                {!isEditingProfile && (
                  <Button
                    variant="outline"
                    className="rounded-xl bg-white"
                    onClick={() => setIsEditingProfile(true)}
                  >
                    <Edit3 className="mr-2 h-4 w-4" />
                    Editar
                  </Button>
                )}
              </div>
            </CardHeader>

            <CardContent>
              {profileMessage && (
                <div className="mb-5 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                  {profileMessage}
                </div>
              )}

              {profileError && (
                <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {profileError}
                </div>
              )}

              {isEditingProfile ? (
                <div className="space-y-5">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">
                        Nombre visible
                      </label>

                      <input
                        value={fullNameText}
                        onChange={(event) => setFullNameText(event.target.value)}
                        placeholder="Ejemplo: Diego Palomino"
                        className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-blue-950 focus:bg-white focus:ring-2 focus:ring-blue-100"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">
                        Ciudad
                      </label>

                      <input
                        value={cityText}
                        onChange={(event) => setCityText(event.target.value)}
                        placeholder="Ejemplo: Lima"
                        className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-blue-950 focus:bg-white focus:ring-2 focus:ring-blue-100"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">
                        Correo visible
                      </label>

                      <input
                        type="email"
                        value={emailText}
                        onChange={(event) => setEmailText(event.target.value)}
                        placeholder="Ejemplo: vendedor@email.com"
                        className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-blue-950 focus:bg-white focus:ring-2 focus:ring-blue-100"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">
                        Teléfono visible
                      </label>

                      <input
                        value={phoneText}
                        onChange={(event) => setPhoneText(event.target.value)}
                        placeholder="Ejemplo: 929676542"
                        className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-blue-950 focus:bg-white focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">
                      Descripción
                    </label>

                    <textarea
                      value={bioText}
                      onChange={(event) => setBioText(event.target.value)}
                      placeholder="Cuenta qué vendes, dónde entregas o qué tipo de productos publicas..."
                      className="min-h-32 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-950 focus:bg-white focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div className="rounded-3xl border border-blue-100 bg-blue-50/70 p-4 text-sm text-blue-900">
                    Tus compradores verán tu nombre, teléfono, correo y ciudad
                    en el detalle de tus publicaciones.
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button
                      onClick={handleSaveProfile}
                      disabled={isSavingProfile}
                      className="h-12 rounded-xl bg-blue-950 px-6 text-base hover:bg-blue-900"
                    >
                      {isSavingProfile ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-5 w-5" />
                          Guardar cambios
                        </>
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      className="h-12 rounded-xl bg-white px-6 text-base"
                      onClick={handleCancelEditProfile}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="rounded-3xl bg-slate-50 p-5">
                    <h3 className="mb-2 text-lg font-black text-slate-950">
                      Sobre mí
                    </h3>

                    <p className="leading-relaxed text-slate-600">
                      {displayBio}
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-3xl border bg-white p-5">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Nombre
                      </p>

                      <p className="font-black text-slate-950">
                        {displayName}
                      </p>
                    </div>

                    <div className="rounded-3xl border bg-white p-5">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Correo
                      </p>

                      <p className="break-all font-black text-slate-950">
                        {displayEmail || 'No registrado'}
                      </p>
                    </div>

                    <div className="rounded-3xl border bg-white p-5">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Teléfono
                      </p>

                      <p className="font-black text-slate-950">
                        {displayPhone || 'No registrado'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <aside className="space-y-5">
            <Card className="rounded-[2rem] border-slate-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl font-black text-slate-950">
                  Datos de contacto
                </CardTitle>

                <CardDescription>
                  Información que aparece en tus productos.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="rounded-3xl bg-slate-50 p-4">
                  <p className="mb-1 text-sm text-slate-500">Nombre</p>
                  <p className="flex items-center gap-2 font-semibold text-slate-950">
                    <User className="h-4 w-4 text-blue-950" />
                    {displayName}
                  </p>
                </div>

                <div className="rounded-3xl bg-slate-50 p-4">
                  <p className="mb-1 text-sm text-slate-500">Correo</p>
                  <p className="flex items-center gap-2 break-all font-semibold text-slate-950">
                    <Mail className="h-4 w-4 flex-shrink-0 text-blue-950" />
                    {displayEmail || 'No registrado'}
                  </p>
                </div>

                <div className="rounded-3xl bg-slate-50 p-4">
                  <p className="mb-1 text-sm text-slate-500">Teléfono</p>
                  <p className="flex items-center gap-2 font-semibold text-slate-950">
                    <Phone className="h-4 w-4 text-blue-950" />
                    {displayPhone || 'No registrado'}
                  </p>
                </div>

                <div
                  className={`rounded-3xl border p-4 text-sm ${
                    hasPublicContact
                      ? 'border-green-100 bg-green-50 text-green-800'
                      : 'border-amber-100 bg-amber-50 text-amber-800'
                  }`}
                >
                  {hasPublicContact ? (
                    <div className="flex gap-2">
                      <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                      <p>
                        Tu perfil está listo para recibir consultas de
                        compradores.
                      </p>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                      <p>
                        Completa nombre, correo y teléfono antes de publicar.
                      </p>
                    </div>
                  )}
                </div>

                <Button
                  variant="outline"
                  className="h-11 w-full rounded-xl bg-white"
                  onClick={() => setIsEditingProfile(true)}
                >
                  <Edit3 className="mr-2 h-4 w-4" />
                  Editar datos
                </Button>
              </CardContent>
            </Card>

            <Card className="rounded-[2rem] border-slate-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl font-black text-slate-950">
                  Publicaciones disponibles
                </CardTitle>

                <CardDescription>
                  Control de publicaciones actuales.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-2xl font-black text-blue-950">
                      {publishedProducts.length}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">Publicados</p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-2xl font-black text-blue-950">
                      {postingLimit}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">Límite</p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-2xl font-black text-blue-950">
                      {remainingPosts}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">Libres</p>
                  </div>
                </div>

                <Button
                  className="mt-4 h-11 w-full rounded-xl bg-blue-950 hover:bg-blue-900"
                  disabled={!canPublish}
                  onClick={() => router.push('/seller/dashboard')}
                >
                  <PackagePlus className="mr-2 h-4 w-4" />
                  Publicar producto
                </Button>
              </CardContent>
            </Card>
          </aside>
        </section>

        {/* ESTADÍSTICAS */}
        <section className="mb-6 grid gap-5 md:grid-cols-4">
          <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
            <CardContent className="p-5">
              <p className="text-3xl font-black text-blue-950">
                {activeProducts.length}
              </p>
              <p className="mt-1 text-sm text-slate-500">Productos activos</p>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
            <CardContent className="p-5">
              <p className="text-3xl font-black text-blue-950">
                {totalViews}
              </p>
              <p className="mt-1 text-sm text-slate-500">Vistas totales</p>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
            <CardContent className="p-5">
              <p className="text-3xl font-black text-blue-950">
                {totalFavorites}
              </p>
              <p className="mt-1 text-sm text-slate-500">Favoritos</p>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
            <CardContent className="p-5">
              <p className="text-3xl font-black text-blue-950">
                {reviewCount}
              </p>
              <p className="mt-1 text-sm text-slate-500">Reseñas recibidas</p>
            </CardContent>
          </Card>
        </section>

        {productMessage && (
          <div className="mb-5 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            {productMessage}
          </div>
        )}

        {productError && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {productError}
          </div>
        )}

        {/* MIS PUBLICACIONES */}
        <section>
          <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-2xl font-black text-slate-950 md:text-3xl">
                Mis publicaciones
              </h2>

              <p className="text-sm text-slate-500">
                Administra los productos que has publicado.
              </p>
            </div>

            <Link href="/seller/dashboard">
              <Button className="rounded-xl bg-blue-950 hover:bg-blue-900">
                <PackagePlus className="mr-2 h-4 w-4" />
                Nueva publicación
              </Button>
            </Link>
          </div>

          {isLoadingProducts ? (
            <div className="flex min-h-[35vh] items-center justify-center rounded-[2rem] border border-dashed bg-white">
              <div className="text-center">
                <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-blue-950" />
                <p className="text-sm text-slate-500">
                  Cargando publicaciones...
                </p>
              </div>
            </div>
          ) : userProducts.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {userProducts.map((product) => {
                const status = getProductStatus(product);

                return (
                  <Card
                    key={product.id}
                    className="overflow-hidden rounded-3xl border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="relative h-52 bg-slate-100">
                      <img
                        src={getProductImage(product)}
                        alt={getProductTitle(product)}
                        className="h-full w-full object-cover"
                      />

                      <Badge
                        className={`absolute left-4 top-4 ${getStatusClass(
                          status
                        )}`}
                      >
                        {getStatusLabel(status)}
                      </Badge>
                    </div>

                    <CardContent className="p-5">
                      <h3 className="line-clamp-1 text-lg font-black text-slate-950">
                        {getProductTitle(product)}
                      </h3>

                      <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                        {product.description ||
                          'Producto publicado en La Segunda Market.'}
                      </p>

                      <p className="mt-4 text-2xl font-black text-blue-950">
                        S/{' '}
                        {getProductPrice(product).toLocaleString('es-PE', {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 2,
                        })}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {product.city || 'Perú'}
                        </span>

                        <span className="inline-flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {getProductViews(product)}
                        </span>

                        <span>{formatDate(product.created_at || product.createdAt)}</span>
                      </div>

                      <div className="mt-5 grid grid-cols-[1fr_auto] gap-2">
                        <Link href={`/product/${product.id}`}>
                          <Button className="w-full rounded-xl bg-blue-950 hover:bg-blue-900">
                            Ver producto
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>

                        <Button
                          variant="outline"
                          disabled={isDeletingProductId === product.id}
                          className="rounded-xl bg-white px-3 text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          {isDeletingProductId === product.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="rounded-[2rem] border-slate-200 bg-white shadow-sm">
              <CardContent className="p-10 text-center">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-500">
                  <PackagePlus className="h-8 w-8" />
                </div>

                <h3 className="mb-2 text-2xl font-black text-slate-950">
                  Aún no tienes publicaciones
                </h3>

                <p className="mx-auto mb-6 max-w-md text-slate-500">
                  Publica tu primer producto para empezar a recibir consultas de
                  compradores interesados.
                </p>

                <Link href="/seller/dashboard">
                  <Button className="rounded-xl bg-blue-950 hover:bg-blue-900">
                    Crear publicación
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </section>
      </main>
    </div>
  );
}
