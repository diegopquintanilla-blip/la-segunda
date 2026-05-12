
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
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

type LocalProduct = {
  id: string;
  sellerId?: string;
  userId?: string;
  ownerId?: string;
  title?: string;
  name?: string;
  description?: string;
  category?: string;
  condition?: string;
  price?: number;
  city?: string;
  status?: string;
  images?: string[];
  image?: string;
  views?: number;
  favoriteCount?: number;
  createdAt?: string;
};

// ============================================================
// CONFIGURACIÓN
// ============================================================

const PLAN_LIMITS: Record<string, number> = {
  free: 3,
  plus: 20,
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

function getProductImage(product: LocalProduct) {
  const image = product.images?.[0] || product.image || '';
  return isValidImageUrl(image) ? image : DEFAULT_PRODUCT_IMAGE;
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

  const [products, setProducts] = useState<LocalProduct[]>([]);
  const [editingProduct, setEditingProduct] = useState<LocalProduct | null>(null);
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
    if (typeof window === 'undefined') return;

    try {
      const rawProducts = localStorage.getItem('la-segunda-products');

      if (!rawProducts) {
        setProducts([]);
        return;
      }

      const parsedProducts = JSON.parse(rawProducts);

      if (Array.isArray(parsedProducts)) {
        setProducts(parsedProducts);
      }
    } catch {
      setProducts([]);
    }
  }, []);

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
    profile?.verification_status || currentUser?.verificationStatus || 'pending';

  const membershipType = String(
    profile?.membership_type ||
      currentUser?.membershipType ||
      currentUser?.membership ||
      currentUser?.plan ||
      'free'
  ).toLowerCase();

  const gender = profile?.gender || currentUser?.gender || 'neutral';
  const rating = Number(profile?.rating || currentUser?.rating || 0);
  const reviewCount = Number(profile?.review_count || currentUser?.reviewCount || 0);

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
      return (
        product.sellerId === user.id ||
        product.userId === user.id ||
        product.ownerId === user.id
      );
    });
  }, [products, user?.id]);

  const activeProducts = userProducts.filter((product) => {
    return product.status === 'active' || !product.status;
  });

  const totalViews = userProducts.reduce(
    (sum, product) => sum + Number(product.views || 0),
    0
  );

  const totalFavorites = userProducts.reduce(
    (sum, product) => sum + Number(product.favoriteCount || 0),
    0
  );

  const isVerified = verificationStatus === 'verified';
  const planLimit = PLAN_LIMITS[membershipType] ?? 3;
  const postingLimit = isVerified ? planLimit : Math.min(planLimit, 2);

  const remainingPosts =
    postingLimit === Infinity
      ? Infinity
      : Math.max(postingLimit - activeProducts.length, 0);

  // ============================================================
  // FUNCIONES: STORAGE LOCAL
  // ============================================================

  const saveProductsToLocalStorage = (updatedProducts: LocalProduct[]) => {
    setProducts(updatedProducts);

    if (typeof window !== 'undefined') {
      localStorage.setItem('la-segunda-products', JSON.stringify(updatedProducts));
    }
  };

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

  const openEditProduct = (product: LocalProduct) => {
    setProductMessage('');
    setProductError('');

    setEditingProduct(product);
    setEditTitle(product.title || product.name || '');
    setEditDescription(product.description || '');
    setEditPrice(String(product.price || ''));
    setEditCity(product.city || '');
    setEditCondition(product.condition || 'Bueno');
    setEditImage(product.images?.[0] || product.image || '');
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

  const handleSaveProduct = () => {
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

    const updatedProducts = products.map((product) => {
      if (product.id !== editingProduct.id) return product;

      const finalImage = editImage.trim() || product.images?.[0] || product.image || DEFAULT_PRODUCT_IMAGE;

      return {
        ...product,
        title: editTitle.trim(),
        name: editTitle.trim(),
        description: editDescription.trim(),
        price: Number(editPrice),
        city: editCity.trim(),
        condition: editCondition,
        status: editStatus,
        images: [finalImage],
        image: finalImage,
      };
    });

    saveProductsToLocalStorage(updatedProducts);
    setProductMessage('Producto actualizado correctamente.');
    closeEditProduct();
  };

  const handleDeleteProduct = (productId: string) => {
    const confirmed = window.confirm(
      '¿Seguro que deseas eliminar este producto publicado?'
    );

    if (!confirmed) return;

    const updatedProducts = products.filter((product) => product.id !== productId);

    saveProductsToLocalStorage(updatedProducts);
    setProductMessage('Producto eliminado correctamente.');

    if (editingProduct?.id === productId) {
      closeEditProduct();
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
                      <span className="font-semibold text-slate-900">{rating}</span>
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
                  <p className="text-2xl font-bold">{activeProducts.length}</p>
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
                <Link href="/seller/dashboard" className="w-full">
                  <Button className="w-full">
                    <PackagePlus className="mr-2 h-4 w-4" />
                    Publicar artículo
                  </Button>
                </Link>

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
                <p>Plus: hasta 20 publicaciones y comisión 5%.</p>
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
                    <label className="text-sm font-medium">Nombre del producto</label>
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
                    <label className="text-sm font-medium">Estado de publicación</label>
                    <select
                      value={editStatus}
                      onChange={(event) => setEditStatus(event.target.value)}
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                    >
                      <option value="active">Activo</option>
                      <option value="reserved">Reservado</option>
                      <option value="sold">Vendido</option>
                      <option value="pending">Pendiente</option>
                    </select>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">Subir foto del producto</label>
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
                <Button onClick={handleSaveProduct}>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar cambios
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
            <CardTitle className="text-lg">Mis productos</CardTitle>
            <CardDescription>
              Productos publicados desde tu cuenta. Puedes editar precio,
              descripción, foto y estado.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-0">
            {userProducts.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {userProducts.map((product) => {
                  const imageUrl = getProductImage(product);

                  return (
                    <div
                      key={product.id}
                      className="flex flex-col gap-4 rounded-xl border bg-white p-4 shadow-sm sm:flex-row"
                    >
                      <img
                        src={imageUrl}
                        alt={product.title || product.name || 'Producto'}
                        className="h-28 w-full rounded-lg object-cover sm:w-32"
                      />

                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex items-start justify-between gap-3">
                          <div>
                            <h3 className="line-clamp-1 font-semibold">
                              {product.title || product.name}
                            </h3>

                            <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                              {product.description || 'Sin descripción'}
                            </p>
                          </div>

                          <Badge variant="outline" className="bg-slate-50">
                            {product.status || 'active'}
                          </Badge>
                        </div>

                        <p className="text-lg font-bold text-primary">
                          S/ {Number(product.price || 0).toLocaleString('es-PE')}
                        </p>

                        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {product.city || 'Perú'}
                          </span>

                          <span>{product.condition || 'Bueno'}</span>

                          <span className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {product.views || 0}
                          </span>

                          <span className="flex items-center gap-1">
                            <Heart className="h-4 w-4" />
                            {product.favoriteCount || 0}
                          </span>
                        </div>

                        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                          <Button
                            size="sm"
                            onClick={() => openEditProduct(product)}
                          >
                            <Edit3 className="mr-2 h-4 w-4" />
                            Editar
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-white text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
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
