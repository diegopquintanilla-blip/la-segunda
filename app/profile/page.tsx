'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/header';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertCircle,
  Calendar,
  Camera,
  CheckCircle,
  Edit3,
  Eye,
  Heart,
  Loader2,
  Lock,
  Mail,
  MapPin,
  MoreVertical,
  PackagePlus,
  Save,
  ShieldCheck,
  Star,
  Trash2,
  Upload,
  User,
  X,
} from 'lucide-react';

// ============================================================
// TIPOS
// ============================================================

type ProfileData = {
  user_id: string;
  full_name: string | null;
  username: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  bio: string | null;
  avatar_url: string | null;
  gender: 'male' | 'female' | 'neutral' | null;
  account_type: 'buyer' | 'seller' | 'both' | null;
  verification_status: 'pending' | 'verified' | 'rejected' | null;
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
  views_count?: number | string | null;
  view_count?: number | string | null;

  favoriteCount?: number | string | null;
  favorite_count?: number | string | null;
  favorites_count?: number | string | null;

  created_at?: string | null;
  createdAt?: string | null;
  updated_at?: string | null;
};

// ============================================================
// CONFIGURACIÓN
// ============================================================

const PLAN_LIMITS: Record<string, number> = {
  free: 2,
  plus: 5,
  premium: Infinity,
};

const DEFAULT_PRODUCT_IMAGE = 'https://placehold.co/400x300?text=La+Segunda';

// ============================================================
// HELPERS
// ============================================================

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

function getProductTitle(product: ProductRow) {
  return product.title || product.name || 'Producto sin nombre';
}

function getProductPrice(product: ProductRow) {
  return Number(product.price || 0);
}

function getProductViews(product: ProductRow) {
  return Number(product.views ?? product.views_count ?? product.view_count ?? 0);
}

function getProductFavorites(product: ProductRow) {
  return Number(
    product.favoriteCount ??
      product.favorite_count ??
      product.favorites_count ??
      0
  );
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

function getProductStatus(product: ProductRow) {
  return String(product.status || 'active').toLowerCase();
}

function getStatusLabel(status?: string | null) {
  const value = String(status || 'active').toLowerCase();

  if (value === 'active') return 'Activo';
  if (value === 'reserved') return 'Reservado';
  if (value === 'sold') return 'Vendido';
  if (value === 'pending') return 'Pendiente';
  if (value === 'inactive') return 'Inactivo';

  return value;
}

function sortProductsByDate(products: ProductRow[]) {
  return [...products].sort((a, b) => {
    const dateA = new Date(a.created_at || a.createdAt || 0).getTime();
    const dateB = new Date(b.created_at || b.createdAt || 0).getTime();

    return dateB - dateA;
  });
}

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, updateUser } = useAuth();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // ----------------------------------------------------------
  // Estado: perfil
  // ----------------------------------------------------------

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioText, setBioText] = useState('');
  const [cityText, setCityText] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');
  const [profileError, setProfileError] = useState('');

  // ----------------------------------------------------------
  // Estado: avatar
  // ----------------------------------------------------------

  const [avatarLoadError, setAvatarLoadError] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarMessage, setAvatarMessage] = useState('');
  const [avatarError, setAvatarError] = useState('');

  // ----------------------------------------------------------
  // Estado: productos
  // ----------------------------------------------------------

  const [products, setProducts] = useState<ProductRow[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductRow | null>(null);
  const [productMessage, setProductMessage] = useState('');
  const [productError, setProductError] = useState('');

  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editCondition, setEditCondition] = useState('Bueno');
  const [editImage, setEditImage] = useState('');
  const [editStatus, setEditStatus] = useState('active');
  const [isUploadingProductImage, setIsUploadingProductImage] = useState(false);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [isDeletingProductId, setIsDeletingProductId] = useState<string | null>(
    null
  );

  // ============================================================
  // FUNCIONES: CARGA DE PRODUCTOS DESDE SUPABASE
  // ============================================================

  const loadProducts = useCallback(async () => {
    if (!user?.id) return;

    setIsLoadingProducts(true);
    setProductError('');

    try {
      const ownerColumns = ['seller_id', 'user_id', 'owner_id'];
      let loadedProducts: ProductRow[] | null = null;
      let lastErrorMessage = '';

      for (const column of ownerColumns) {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq(column, user.id);

        if (!error && Array.isArray(data)) {
          loadedProducts = data as ProductRow[];
          break;
        }

        if (error?.message) {
          lastErrorMessage = error.message;
        }
      }

      if (!loadedProducts) {
        const { data, error } = await supabase.from('products').select('*');

        if (error) {
          throw error;
        }

        const rows = Array.isArray(data) ? (data as ProductRow[]) : [];

        loadedProducts = rows.filter((product) => {
          const ownerId = getProductOwnerId(product);

          if (!ownerId) return true;

          return ownerId === user.id;
        });
      }

      setProducts(sortProductsByDate(loadedProducts));
    } catch (err: any) {
      console.error('[La Segunda] Error cargando productos:', err?.message);
      setProducts([]);
      setProductError(
        err?.message ||
          'No se pudieron cargar tus productos desde Supabase.'
      );
    } finally {
      setIsLoadingProducts(false);
    }
  }, [user?.id]);

  // ============================================================
  // EFECTOS
  // ============================================================

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('[La Segunda] Error cargando profile:', error.message);
        return;
      }

      if (data) {
        setProfile(data as ProfileData);
        setBioText(data.bio || '');
        setCityText(data.city || '');
        setAvatarLoadError(false);
      }
    };

    loadProfile();
  }, [user?.id]);

  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;

    loadProducts();
  }, [isAuthenticated, user?.id, loadProducts]);

  // ============================================================
  // DATOS DERIVADOS
  // ============================================================

  const currentUser = user as any;

  const displayName =
    profile?.full_name ||
    currentUser?.name ||
    currentUser?.email?.split('@')?.[0] ||
    'Usuario La Segunda';

  const displayEmail = profile?.email || currentUser?.email || '';
  const displayCity = profile?.city || currentUser?.city || 'Lima';
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

    return status === 'active' || !status;
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
  const planLimit = PLAN_LIMITS[membershipType] ?? 2;

  const postingLimit = profileLimit > 0 ? profileLimit : planLimit;

  const remainingPosts =
    postingLimit === Infinity
      ? Infinity
      : Math.max(postingLimit - publishedProducts.length, 0);

  const canPublish =
    remainingPosts === Infinity || Number(remainingPosts || 0) > 0;

  // ============================================================
  // FUNCIONES: AVATAR
  // ============================================================

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

      const { error: profileError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      setProfile((currentProfile) => {
        if (!currentProfile) return currentProfile;
        return { ...currentProfile, avatar_url: publicUrl };
      });

      updateUser({ avatar: publicUrl } as any);

      setAvatarLoadError(false);
      setAvatarMessage('Avatar actualizado correctamente.');
    } catch (err: any) {
      setAvatarError(
        err?.message || 'No se pudo subir la imagen. Intenta nuevamente.'
      );
    } finally {
      setIsUploadingAvatar(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // ============================================================
  // FUNCIONES: PERFIL
  // ============================================================

  const handleSaveProfile = async () => {
    setProfileMessage('');
    setProfileError('');

    if (!user?.id) {
      setProfileError('Debes iniciar sesión para editar tu perfil.');
      return;
    }

    setIsSavingProfile(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          bio: bioText.trim(),
          city: cityText.trim(),
        })
        .eq('user_id', user.id);

      if (error) throw error;

      setProfile((currentProfile) => {
        if (!currentProfile) return currentProfile;

        return {
          ...currentProfile,
          bio: bioText.trim(),
          city: cityText.trim(),
        };
      });

      updateUser({
        bio: bioText.trim(),
        city: cityText.trim(),
      } as any);

      setIsEditingBio(false);
      setProfileMessage('Perfil actualizado correctamente.');
    } catch (err: any) {
      setProfileError(
        err?.message || 'No se pudo actualizar el perfil. Intenta nuevamente.'
      );
    } finally {
      setIsSavingProfile(false);
    }
  };

  // ============================================================
  // FUNCIONES: PRODUCTOS
  // ============================================================

  const openEditProduct = (product: ProductRow) => {
    setProductMessage('');
    setProductError('');

    setEditingProduct(product);
    setEditTitle(getProductTitle(product));
    setEditDescription(product.description || '');
    setEditPrice(String(product.price || ''));
    setEditCity(product.city || '');
    setEditCondition(product.condition || 'Bueno');
    setEditImage(getProductImage(product));
    setEditStatus(product.status || 'active');

    setTimeout(() => {
      document
        .getElementById('editar-producto')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const closeEditProduct = () => {
    setEditingProduct(null);
    setEditTitle('');
    setEditDescription('');
    setEditPrice('');
    setEditCity('');
    setEditCondition('Bueno');
    setEditImage('');
    setEditStatus('active');
    setProductError('');
  };

  const handleUploadProductImage = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setProductError('');
    setProductMessage('');

    const file = event.target.files?.[0];
    if (!file) return;

    if (!user?.id) {
      setProductError('Debes iniciar sesión para subir una foto.');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setProductError('Solo puedes subir archivos de imagen.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setProductError('La imagen no debe superar los 5 MB.');
      return;
    }

    setIsUploadingProductImage(true);

    try {
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `product-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      setEditImage(publicUrlData.publicUrl);
      setProductMessage('Foto cargada correctamente. Ahora guarda los cambios.');
    } catch (err: any) {
      setProductError(
        err?.message ||
          'No se pudo subir la foto. Verifica el bucket product-images en Supabase.'
      );
    } finally {
      setIsUploadingProductImage(false);
      event.target.value = '';
    }
  };

  const buildProductUpdatePayload = (
    product: ProductRow,
    finalImage: string
  ) => {
    const payload: Record<string, any> = {};

    if ('title' in product || !('name' in product)) {
      payload.title = editTitle.trim();
    }

    if ('name' in product) {
      payload.name = editTitle.trim();
    }

    if ('description' in product) {
      payload.description = editDescription.trim();
    }

    if ('price' in product) {
      payload.price = Number(editPrice);
    }

    if ('city' in product) {
      payload.city = editCity.trim();
    }

    if ('condition' in product) {
      payload.condition = editCondition;
    }

    if ('status' in product) {
      payload.status = editStatus;
    }

    if ('image_url' in product) {
      payload.image_url = finalImage;
    }

    if ('images' in product) {
      payload.images = [finalImage];
    }

    if ('image' in product) {
      payload.image = finalImage;
    }

    if ('updated_at' in product) {
      payload.updated_at = new Date().toISOString();
    }

    return payload;
  };

  const updateProductInSupabase = async (
    productId: string,
    payload: Record<string, any>
  ) => {
    if (!user?.id) {
      throw new Error('Debes iniciar sesión para editar el producto.');
    }

    const ownerColumns = ['seller_id', 'user_id', 'owner_id'];

    for (const column of ownerColumns) {
      const { data, error } = await supabase
        .from('products')
        .update(payload)
        .eq('id', productId)
        .eq(column, user.id)
        .select('*')
        .maybeSingle();

      if (!error && data) {
        return data as ProductRow;
      }
    }

    const { data, error } = await supabase
      .from('products')
      .update(payload)
      .eq('id', productId)
      .select('*')
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      throw new Error('No se pudo actualizar el producto.');
    }

    return data as ProductRow;
  };

  const handleSaveProduct = async () => {
    setProductMessage('');
    setProductError('');

    if (!editingProduct) return;

    if (!editTitle.trim()) {
      setProductError('Ingresa el nombre del producto.');
      return;
    }

    if (!editPrice || Number(editPrice) <= 0) {
      setProductError('Ingresa un precio válido.');
      return;
    }

    if (!editCity.trim()) {
      setProductError('Ingresa la ciudad del producto.');
      return;
    }

    setIsSavingProduct(true);

    try {
      const finalImage =
        editImage.trim() || getProductImage(editingProduct) || DEFAULT_PRODUCT_IMAGE;

      const payload = buildProductUpdatePayload(editingProduct, finalImage);

      await updateProductInSupabase(editingProduct.id, payload);
      await loadProducts();

      setProductMessage('Producto actualizado correctamente.');
      closeEditProduct();
    } catch (err: any) {
      setProductError(
        err?.message || 'No se pudo actualizar el producto en Supabase.'
      );
    } finally {
      setIsSavingProduct(false);
    }
  };

  const deleteProductInSupabase = async (productId: string) => {
    if (!user?.id) {
      throw new Error('Debes iniciar sesión para eliminar el producto.');
    }

    const ownerColumns = ['seller_id', 'user_id', 'owner_id'];

    for (const column of ownerColumns) {
      const { data, error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)
        .eq(column, user.id)
        .select('id')
        .maybeSingle();

      if (!error && data) {
        return;
      }
    }

    const { error } = await supabase.from('products').delete().eq('id', productId);

    if (error) throw error;
  };

  const handleDeleteProduct = async (productId: string) => {
    const confirmed = window.confirm(
      '¿Seguro que deseas eliminar este producto publicado?'
    );

    if (!confirmed) return;

    setIsDeletingProductId(productId);
    setProductMessage('');
    setProductError('');

    try {
      await deleteProductInSupabase(productId);
      await loadProducts();

      setProductMessage('Producto eliminado correctamente.');

      if (editingProduct?.id === productId) {
        closeEditProduct();
      }
    } catch (err: any) {
      setProductError(
        err?.message || 'No se pudo eliminar el producto en Supabase.'
      );
    } finally {
      setIsDeletingProductId(null);
    }
  };

  // ============================================================
  // BADGES
  // ============================================================

  const getVerificationBadge = () => {
    if (verificationStatus === 'verified') {
      return (
        <Badge className="border-green-200 bg-green-50 text-green-700">
          <ShieldCheck className="mr-1 h-3 w-3" />
          Verificado
        </Badge>
      );
    }

    if (verificationStatus === 'rejected') {
      return (
        <Badge className="border-red-200 bg-red-50 text-red-700">
          <AlertCircle className="mr-1 h-3 w-3" />
          Rechazado
        </Badge>
      );
    }

    return (
      <Badge className="border-amber-200 bg-amber-50 text-amber-700">
        <AlertCircle className="mr-1 h-3 w-3" />
        Verificación pendiente
      </Badge>
    );
  };

  const getPlanBadge = () => {
    if (membershipType === 'premium') {
      return (
        <Badge className="border-amber-200 bg-amber-50 text-amber-700">
          Plan Premium
        </Badge>
      );
    }

    if (membershipType === 'plus') {
      return (
        <Badge className="border-blue-200 bg-blue-50 text-blue-700">
          Plan Plus
        </Badge>
      );
    }

    return (
      <Badge className="border-slate-200 bg-slate-50 text-slate-700">
        Plan Gratis
      </Badge>
    );
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (isLoading || !isAuthenticated || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F8FB]">
        <div className="text-center">
          <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="min-h-screen bg-[#F7F8FB]">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-5">
        {/* HEADER DE PERFIL */}
        <Card className="mb-5 overflow-hidden rounded-2xl border-slate-200 bg-white shadow-sm">
          <CardContent className="p-0">
            <div className="h-20 bg-gradient-to-r from-slate-100 via-blue-50 to-indigo-100" />

            <div className="px-5 pb-5">
              <div className="-mt-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                  <div className="relative h-24 w-24 flex-shrink-0">
                    <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-slate-100 shadow-md">
                      {shouldShowImageAvatar ? (
                        <img
                          src={safeAvatarUrl}
                          alt="Avatar del usuario"
                          className="block h-full w-full object-cover"
                          onError={() => setAvatarLoadError(true)}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                          <span className="select-none text-5xl leading-none">
                            {getAvatarEmoji(gender)}
                          </span>
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handleSelectAvatar}
                      disabled={isUploadingAvatar}
                      className="absolute bottom-1 right-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md transition hover:bg-primary/90 disabled:opacity-60"
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

                  <div className="pb-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <h1 className="text-2xl font-bold leading-tight text-slate-950 md:text-3xl">
                        {displayName}
                      </h1>

                      {getVerificationBadge()}
                      {getPlanBadge()}
                    </div>

                    <div className="mb-2 flex flex-wrap gap-2">
                      <Badge variant="outline" className="gap-1 bg-white text-xs">
                        <MapPin className="h-3 w-3" />
                        {displayCity}
                      </Badge>

                      <Badge variant="outline" className="gap-1 bg-white text-xs">
                        <User className="h-3 w-3" />
                        {getAccountTypeLabel(accountType)}
                      </Badge>

                      <Badge variant="outline" className="gap-1 bg-white text-xs">
                        <Calendar className="h-3 w-3" />
                        Miembro desde{' '}
                        {profile?.created_at
                          ? new Date(profile.created_at).toLocaleDateString(
                              'es-PE',
                              {
                                month: 'long',
                                year: 'numeric',
                              }
                            )
                          : currentUser?.joinDate || '2026'}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold text-slate-900">
                        {rating}
                      </span>
                      <span>({reviewCount} calificaciones)</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAvatar}
                    disabled={isUploadingAvatar}
                    className="bg-white"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Cambiar avatar
                  </Button>

                  <Button size="sm" onClick={() => setIsEditingBio(!isEditingBio)}>
                    <Edit3 className="mr-2 h-4 w-4" />
                    Editar perfil
                  </Button>
                </div>
              </div>

              {avatarMessage && (
                <div className="mt-4 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                  <CheckCircle className="h-4 w-4" />
                  {avatarMessage}
                </div>
              )}

              {avatarError && (
                <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  <AlertCircle className="h-4 w-4" />
                  {avatarError}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* SOBRE MI + SEGURIDAD */}
        <section className="mb-5 grid items-start gap-5 lg:grid-cols-[1fr_360px]">
          <Card className="h-fit rounded-2xl border-slate-200 bg-white shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-lg">Sobre mí</CardTitle>
                  <CardDescription>
                    Información pública visible para compradores y vendedores.
                  </CardDescription>
                </div>

                {!isEditingBio && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditingBio(true)}
                  >
                    <Edit3 className="mr-2 h-4 w-4" />
                    Editar
                  </Button>
                )}
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              {profileMessage && (
                <div className="mb-4 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                  {profileMessage}
                </div>
              )}

              {profileError && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {profileError}
                </div>
              )}

              {isEditingBio ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Ciudad</label>
                    <input
                      value={cityText}
                      onChange={(event) => setCityText(event.target.value)}
                      placeholder="Ejemplo: Lima"
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Descripción</label>
                    <textarea
                      value={bioText}
                      onChange={(event) => setBioText(event.target.value)}
                      placeholder="Cuenta algo sobre ti, qué vendes o qué tipo de productos buscas..."
                      className="min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm"
                    />
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button onClick={handleSaveProfile} disabled={isSavingProfile}>
                      {isSavingProfile ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Guardar cambios
                        </>
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditingBio(false);
                        setBioText(profile?.bio || '');
                        setCityText(profile?.city || '');
                      }}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="leading-relaxed text-slate-600">
                  {profile?.bio ||
                    currentUser?.bio ||
                    'Sin información de perfil. Agrega una descripción para generar más confianza en tus compras y ventas.'}
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="h-fit rounded-2xl border-slate-200 bg-white shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Seguridad de cuenta</CardTitle>
              <CardDescription>Estado actual de tu cuenta.</CardDescription>
            </CardHeader>

            <CardContent className="space-y-3 pt-0">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="mb-1 text-sm text-slate-500">Estado de identidad</p>
                <div>{getVerificationBadge()}</div>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="mb-1 text-sm text-slate-500">Correo registrado</p>
                <p className="flex items-center gap-2 break-all text-sm font-medium">
                  <Mail className="h-4 w-4" />
                  {displayEmail}
                </p>
              </div>

              <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-4 text-sm text-blue-700">
                La Segunda protege el contacto entre comprador y vendedor mediante
                chat interno seguro.
              </div>

              <Button variant="outline" className="w-full bg-white">
                <ShieldCheck className="mr-2 h-4 w-4" />
                Verificar identidad
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* PUBLICACIONES + ESTADISTICAS + MEMBRESIA */}
        <section className="mb-5 grid items-start gap-5 lg:grid-cols-3">
          <Card className="h-fit rounded-2xl border-slate-200 bg-white shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Publicaciones disponibles</CardTitle>
              <CardDescription>
                Controla cuántos artículos puedes publicar.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 pt-0">
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Publicados</p>
                  <p className="text-2xl font-bold">
                    {publishedProducts.length}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Límite</p>
                  <p className="text-2xl font-bold">
                    {postingLimit === Infinity ? '∞' : postingLimit}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Disponibles</p>
                  <p className="text-2xl font-bold">
                    {remainingPosts === Infinity ? '∞' : remainingPosts}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  className="w-full"
                  disabled={!canPublish}
                  onClick={() => {
                    if (canPublish) {
                      router.push('/seller/dashboard');
                    }
                  }}
                >
                  <PackagePlus className="mr-2 h-4 w-4" />
                  Publicar artículo
                </Button>

                <Link href="/seller/membership" className="w-full">
                  <Button variant="outline" className="w-full bg-white">
                    <Lock className="mr-2 h-4 w-4" />
                    Mejorar plan
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="h-fit rounded-2xl border-slate-200 bg-white shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Estadísticas</CardTitle>
              <CardDescription>Resumen de tu actividad.</CardDescription>
            </CardHeader>

            <CardContent className="grid gap-3 pt-0 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-2xl font-bold">{activeProducts.length}</p>
                <p className="text-sm text-slate-500">Productos activos</p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-2xl font-bold">{reviewCount}</p>
                <p className="text-sm text-slate-500">Reseñas recibidas</p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-2xl font-bold">{totalViews}</p>
                <p className="text-sm text-slate-500">Vistas totales</p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-2xl font-bold">{totalFavorites}</p>
                <p className="text-sm text-slate-500">Favoritos</p>
              </div>
            </CardContent>
          </Card>

          <Card className="h-fit rounded-2xl border-amber-100 bg-amber-50/70 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Vende más con membresía</CardTitle>
              <CardDescription>
                Desbloquea más publicaciones y paga menos comisión.
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="space-y-2 text-sm text-amber-800">
                <p>Plus: hasta 5 publicaciones y comisión 5%.</p>
                <p>Premium: publicaciones ilimitadas y comisión 2%.</p>
              </div>

              <Link href="/seller/membership">
                <Button className="mt-5 w-full bg-amber-600 hover:bg-amber-700">
                  Ver planes
                </Button>
              </Link>
            </CardContent>
          </Card>
        </section>

        {/* MENSAJES DE PRODUCTO */}
        {productMessage && (
          <div className="mb-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            {productMessage}
          </div>
        )}

        {productError && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {productError}
          </div>
        )}

        {/* FORMULARIO EDITAR PRODUCTO */}
        {editingProduct && (
          <Card
            id="editar-producto"
            className="mb-5 rounded-2xl border-primary/20 bg-white shadow-sm"
          >
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle>Editar producto publicado</CardTitle>
                  <CardDescription>
                    Cambia descripción, precio, foto, ciudad o estado del producto.
                  </CardDescription>
                </div>

                <Button variant="ghost" size="icon" onClick={closeEditProduct}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-5">
              <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
                <div className="rounded-xl border bg-slate-50 p-3">
                  <p className="mb-2 text-sm font-medium">Vista previa</p>

                  <img
                    src={
                      isValidImageUrl(editImage)
                        ? editImage
                        : DEFAULT_PRODUCT_IMAGE
                    }
                    alt="Vista previa"
                    className="h-40 w-full rounded-lg object-cover"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">
                      Nombre del producto
                    </label>
                    <input
                      value={editTitle}
                      onChange={(event) => setEditTitle(event.target.value)}
                      placeholder="Ejemplo: iPhone 12 Pro"
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">Descripción</label>
                    <textarea
                      value={editDescription}
                      onChange={(event) => setEditDescription(event.target.value)}
                      placeholder="Describe detalles, estado, accesorios, uso y condiciones..."
                      className="min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Precio</label>
                    <input
                      type="number"
                      value={editPrice}
                      onChange={(event) => setEditPrice(event.target.value)}
                      placeholder="Ejemplo: 900"
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Ciudad</label>
                    <input
                      value={editCity}
                      onChange={(event) => setEditCity(event.target.value)}
                      placeholder="Ejemplo: Lima"
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Estado físico</label>
                    <select
                      value={editCondition}
                      onChange={(event) => setEditCondition(event.target.value)}
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                    >
                      <option value="Nuevo">Nuevo</option>
                      <option value="Como nuevo">Como nuevo</option>
                      <option value="Bueno">Bueno</option>
                      <option value="Regular">Regular</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Estado de publicación
                    </label>
                    <select
                      value={editStatus}
                      onChange={(event) => setEditStatus(event.target.value)}
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                    >
                      <option value="active">Activo</option>
                      <option value="reserved">Reservado</option>
                      <option value="sold">Vendido</option>
                      <option value="pending">Pendiente</option>
                      <option value="inactive">Inactivo</option>
                    </select>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">
                      Subir foto del producto
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadProductImage}
                      disabled={isUploadingProductImage}
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                    />

                    {isUploadingProductImage && (
                      <p className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Subiendo imagen...
                      </p>
                    )}
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">URL de imagen</label>
                    <input
                      value={editImage}
                      onChange={(event) => setEditImage(event.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button onClick={handleSaveProduct} disabled={isSavingProduct}>
                  {isSavingProduct ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Guardar cambios
                    </>
                  )}
                </Button>

                <Button variant="outline" onClick={closeEditProduct}>
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* MIS PRODUCTOS */}
        <Card className="mb-5 rounded-2xl border-slate-200 bg-white shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle className="text-lg">Mis productos</CardTitle>
                <CardDescription>
                  Mis productos publicados en Supabase.
                </CardDescription>
              </div>

              <Link href="/seller/membership">
                <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                  <Lock className="mr-2 h-4 w-4" />
                  Plan
                </Button>
              </Link>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            {isLoadingProducts ? (
              <div className="flex items-center justify-center rounded-xl border border-dashed p-10">
                <div className="text-center">
                  <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">
                    Cargando productos desde Supabase...
                  </p>
                </div>
              </div>
            ) : userProducts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px] border-collapse text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="px-2 py-3 font-semibold text-slate-900">
                        Producto
                      </th>
                      <th className="px-2 py-3 font-semibold text-slate-900">
                        Precio
                      </th>
                      <th className="px-2 py-3 font-semibold text-slate-900">
                        Vistas
                      </th>
                      <th className="px-2 py-3 font-semibold text-slate-900">
                        Favoritos
                      </th>
                      <th className="px-2 py-3 font-semibold text-slate-900">
                        Estado
                      </th>
                      <th className="px-2 py-3 font-semibold text-slate-900">
                        Acciones
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {userProducts.map((product) => {
                      const status = getProductStatus(product);

                      return (
                        <tr key={product.id} className="border-b">
                          <td className="px-2 py-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={getProductImage(product)}
                                alt={getProductTitle(product)}
                                className="h-12 w-12 rounded-md object-cover"
                              />

                              <div className="min-w-0">
                                <p className="line-clamp-1 font-medium text-slate-950">
                                  {getProductTitle(product)}
                                </p>
                                <p className="line-clamp-1 text-xs text-slate-500">
                                  {product.city || 'Perú'}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-2 py-3">
                            S/{' '}
                            {getProductPrice(product).toLocaleString('es-PE', {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 2,
                            })}
                          </td>

                          <td className="px-2 py-3">
                            <span className="inline-flex items-center gap-1">
                              <Eye className="h-4 w-4 text-slate-500" />
                              {getProductViews(product)}
                            </span>
                          </td>

                          <td className="px-2 py-3">
                            <span className="inline-flex items-center gap-1">
                              <Heart className="h-4 w-4 text-slate-500" />
                              {getProductFavorites(product)}
                            </span>
                          </td>

                          <td className="px-2 py-3">
                            <Badge
                              className={
                                status === 'active'
                                  ? 'bg-blue-900 text-white'
                                  : status === 'sold'
                                    ? 'bg-slate-700 text-white'
                                    : status === 'reserved'
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-slate-100 text-slate-700'
                              }
                            >
                              {getStatusLabel(status)}
                            </Badge>
                          </td>

                          <td className="px-2 py-3">
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="bg-white"
                                onClick={() => openEditProduct(product)}
                              >
                                <Edit3 className="mr-2 h-4 w-4" />
                                Editar
                              </Button>

                              <Button
                                size="sm"
                                variant="outline"
                                disabled={isDeletingProductId === product.id}
                                className="bg-white text-red-600 hover:text-red-700"
                                onClick={() => handleDeleteProduct(product.id)}
                              >
                                {isDeletingProductId === product.id ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="mr-2 h-4 w-4" />
                                )}
                                Eliminar
                              </Button>

                              <MoreVertical className="h-4 w-4 text-slate-400" />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed p-8 text-center">
                <PackagePlus className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />

                <h3 className="mb-2 text-xl font-bold">
                  Aún no tienes productos publicados
                </h3>

                <p className="mb-5 text-muted-foreground">
                  Publica tu primer artículo para empezar a vender.
                </p>

                <Link href="/seller/dashboard">
                  <Button>Publicar producto</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* RESEÑAS */}
        <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Mis reseñas</CardTitle>
            <CardDescription>
              Opiniones recibidas por tus compras y ventas.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-0">
            <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
              No tienes reseñas registradas todavía.
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
