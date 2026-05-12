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
  Heart,
  Loader2,
  Lock,
  Mail,
  MapPin,
  PackagePlus,
  ShieldCheck,
  Star,
  Upload,
  User,
} from 'lucide-react';

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
  price?: number;
  city?: string;
  status?: string;
  images?: string[];
  views?: number;
  favoriteCount?: number;
};

const PLAN_LIMITS: Record<string, number> = {
  free: 3,
  plus: 20,
  premium: Infinity,
};

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

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, updateUser } = useAuth();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [products, setProducts] = useState<LocalProduct[]>([]);
  const [avatarLoadError, setAvatarLoadError] = useState(false);

  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarMessage, setAvatarMessage] = useState('');
  const [avatarError, setAvatarError] = useState('');

  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioText, setBioText] = useState('');
  const [cityText, setCityText] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');
  const [profileError, setProfileError] = useState('');

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

  const currentUser = user as any;

  const displayName =
    profile?.full_name ||
    currentUser?.name ||
    currentUser?.email?.split('@')?.[0] ||
    'Usuario La Segunda';

  const displayEmail = profile?.email || currentUser?.email || '';
  const displayCity = profile?.city || currentUser?.city || 'Lima';

  const accountType =
    profile?.account_type || currentUser?.accountType || 'buyer';

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

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData.publicUrl;

      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          avatar_url: publicUrl,
        })
        .eq('user_id', user.id);

      if (profileError) {
        throw profileError;
      }

      setProfile((currentProfile) => {
        if (!currentProfile) return currentProfile;

        return {
          ...currentProfile,
          avatar_url: publicUrl,
        };
      });

      updateUser({
        avatar: publicUrl,
      } as any);

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

      if (error) {
        throw error;
      }

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

  const getVerificationBadge = () => {
    if (verificationStatus === 'verified') {
      return (
        <Badge className="bg-green-100 text-green-800">
          <ShieldCheck className="mr-1 h-3 w-3" />
          Verificado
        </Badge>
      );
    }

    if (verificationStatus === 'rejected') {
      return (
        <Badge className="bg-red-100 text-red-800">
          <AlertCircle className="mr-1 h-3 w-3" />
          Rechazado
        </Badge>
      );
    }

    return (
      <Badge className="bg-yellow-100 text-yellow-800">
        <AlertCircle className="mr-1 h-3 w-3" />
        Verificación pendiente
      </Badge>
    );
  };

  const getPlanBadge = () => {
    if (membershipType === 'premium') {
      return <Badge className="bg-amber-100 text-amber-800">Plan Premium</Badge>;
    }

    if (membershipType === 'plus') {
      return <Badge className="bg-blue-100 text-blue-800">Plan Plus</Badge>;
    }

    return <Badge className="bg-slate-100 text-slate-800">Plan Gratis</Badge>;
  };

  if (isLoading || !isAuthenticated || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <Card className="mb-8 overflow-hidden rounded-2xl">
          <CardContent className="p-0">
            <div className="h-28 bg-gradient-to-r from-primary via-blue-700 to-blue-800" />

            <div className="px-6 pb-6">
              <div className="-mt-14 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
                  <div className="relative h-32 w-32 flex-shrink-0">
                    <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-slate-100 shadow-xl">
                      {shouldShowImageAvatar ? (
                        <img
                          src={safeAvatarUrl}
                          alt="Avatar del usuario"
                          className="block h-full w-full object-cover"
                          onError={() => setAvatarLoadError(true)}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                          <span className="select-none text-6xl leading-none">
                            {getAvatarEmoji(gender)}
                          </span>
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handleSelectAvatar}
                      disabled={isUploadingAvatar}
                      className="absolute bottom-2 right-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition hover:bg-primary/90 disabled:opacity-60"
                    >
                      {isUploadingAvatar ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Camera className="h-5 w-5" />
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

                  <div className="pb-2">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <h1 className="text-3xl font-bold leading-tight text-foreground">
                        {displayName}
                      </h1>
                      {getVerificationBadge()}
                      {getPlanBadge()}
                    </div>

                    <div className="mb-3 flex flex-wrap gap-2">
                      <Badge variant="outline" className="gap-1 bg-white">
                        <MapPin className="h-3 w-3" />
                        {displayCity}
                      </Badge>

                      <Badge variant="outline" className="gap-1 bg-white">
                        <User className="h-3 w-3" />
                        {getAccountTypeLabel(accountType)}
                      </Badge>

                      <Badge variant="outline" className="gap-1 bg-white">
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

                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      <span className="text-lg font-semibold text-foreground">
                        {rating}
                      </span>
                      <span>({reviewCount} calificaciones)</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    variant="outline"
                    onClick={handleSelectAvatar}
                    disabled={isUploadingAvatar}
                    className="bg-white"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Cambiar avatar
                  </Button>

                  <Button onClick={() => setIsEditingBio(!isEditingBio)}>
                    <Edit3 className="mr-2 h-4 w-4" />
                    Editar perfil
                  </Button>
                </div>
              </div>

              {avatarMessage && (
                <div className="mt-5 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                  <CheckCircle className="h-4 w-4" />
                  {avatarMessage}
                </div>
              )}

              {avatarError && (
                <div className="mt-5 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  <AlertCircle className="h-4 w-4" />
                  {avatarError}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="mb-8 grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle>Sobre mí</CardTitle>
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

            <CardContent>
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
                      className="min-h-32 w-full rounded-md border bg-background px-3 py-2 text-sm"
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
                <p className="leading-relaxed text-muted-foreground">
                  {profile?.bio ||
                    currentUser?.bio ||
                    'Sin información de perfil. Agrega una descripción para generar más confianza en tus compras y ventas.'}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Seguridad de cuenta</CardTitle>
              <CardDescription>Estado actual de tu cuenta.</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="rounded-xl bg-slate-100 p-4">
                <p className="mb-1 text-sm text-muted-foreground">
                  Estado de identidad
                </p>
                <div>{getVerificationBadge()}</div>
              </div>

              <div className="rounded-xl bg-slate-100 p-4">
                <p className="mb-1 text-sm text-muted-foreground">
                  Correo registrado
                </p>
                <p className="flex items-center gap-2 break-all text-sm font-medium">
                  <Mail className="h-4 w-4" />
                  {displayEmail}
                </p>
              </div>

              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
                La Segunda protege el contacto entre comprador y vendedor mediante
                chat interno seguro.
              </div>

              <Button variant="outline" className="w-full">
                <ShieldCheck className="mr-2 h-4 w-4" />
                Verificar identidad
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mb-8 grid gap-6 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Publicaciones disponibles</CardTitle>
              <CardDescription>
                Controla cuántos artículos puedes publicar.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl bg-slate-100 p-3">
                  <p className="text-xs text-muted-foreground">Publicados</p>
                  <p className="text-2xl font-bold">{activeProducts.length}</p>
                </div>

                <div className="rounded-xl bg-slate-100 p-3">
                  <p className="text-xs text-muted-foreground">Límite</p>
                  <p className="text-2xl font-bold">
                    {postingLimit === Infinity ? '∞' : postingLimit}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-100 p-3">
                  <p className="text-xs text-muted-foreground">Disponibles</p>
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
                  <Button variant="outline" className="w-full">
                    <Lock className="mr-2 h-4 w-4" />
                    Mejorar plan
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Estadísticas</CardTitle>
              <CardDescription>Resumen de tu actividad.</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="rounded-xl bg-slate-100 p-4">
                <p className="text-2xl font-bold">{activeProducts.length}</p>
                <p className="text-sm text-muted-foreground">Productos activos</p>
              </div>

              <div className="rounded-xl bg-slate-100 p-4">
                <p className="text-2xl font-bold">{reviewCount}</p>
                <p className="text-sm text-muted-foreground">Reseñas recibidas</p>
              </div>

              <div className="rounded-xl bg-slate-100 p-4">
                <p className="text-2xl font-bold">{totalViews}</p>
                <p className="text-sm text-muted-foreground">Vistas totales</p>
              </div>

              <div className="rounded-xl bg-slate-100 p-4">
                <p className="text-2xl font-bold">{totalFavorites}</p>
                <p className="text-sm text-muted-foreground">Favoritos</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-200 bg-amber-50">
            <CardHeader>
              <CardTitle>Vende más con membresía</CardTitle>
              <CardDescription>
                Desbloquea más publicaciones y paga menos comisión.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="space-y-2 text-sm text-amber-900">
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
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Mis productos</CardTitle>
            <CardDescription>Productos publicados desde tu cuenta.</CardDescription>
          </CardHeader>

          <CardContent>
            {userProducts.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {userProducts.slice(0, 4).map((product) => {
                  const imageUrl =
                    product.images?.[0] ||
                    'https://placehold.co/300x200?text=La+Segunda';

                  return (
                    <div
                      key={product.id}
                      className="flex gap-4 rounded-xl border bg-white p-4"
                    >
                      <img
                        src={imageUrl}
                        alt={product.title || product.name || 'Producto'}
                        className="h-20 w-20 rounded-lg object-cover"
                      />

                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-center justify-between gap-2">
                          <h3 className="truncate font-semibold">
                            {product.title || product.name}
                          </h3>

                          <Badge variant="outline">
                            {product.status || 'active'}
                          </Badge>
                        </div>

                        <p className="text-lg font-bold text-primary">
                          S/ {Number(product.price || 0).toLocaleString('es-PE')}
                        </p>

                        <p className="mt-1 text-sm text-muted-foreground">
                          {product.city || 'Perú'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed p-10 text-center">
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

        <Card>
          <CardHeader>
            <CardTitle>Mis reseñas</CardTitle>
            <CardDescription>
              Opiniones recibidas por tus compras y ventas.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
              No tienes reseñas registradas todavía.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
