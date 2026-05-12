'use client';

import { Header } from '@/components/header';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { mockProducts, mockReviews, mockUsers } from '@/lib/mock-data';
import {
  Star,
  MapPin,
  Calendar,
  Edit2,
  CheckCircle,
  PackagePlus,
  Lock,
  Crown,
  MessageCircle,
  Heart,
  ShoppingBag,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Store,
  TrendingUp,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getAccountTypeLabel } from '@/lib/avatar-utils';

type MembershipPlan = {
  id: 'free' | 'plus' | 'premium';
  name: string;
  limit: number;
  commission: string;
  price: string;
  badgeClass: string;
};

const plans: Record<string, MembershipPlan> = {
  free: {
    id: 'free',
    name: 'Plan Gratis',
    limit: 3,
    commission: '8%',
    price: 'S/ 0',
    badgeClass: 'bg-slate-100 text-slate-800',
  },
  plus: {
    id: 'plus',
    name: 'La Segunda Plus',
    limit: 20,
    commission: '5%',
    price: 'S/ 19.90',
    badgeClass: 'bg-blue-100 text-blue-800',
  },
  premium: {
    id: 'premium',
    name: 'La Segunda Premium',
    limit: Infinity,
    commission: '2%',
    price: 'S/ 49.90',
    badgeClass: 'bg-amber-100 text-amber-800',
  },
};

export default function ProfilePage() {
  const { user, isAuthenticated, updateUser } = useAuth();
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState('');
  const [city, setCity] = useState('');
  const [localProducts, setLocalProducts] = useState<any[]>([]);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push('/auth/login');
      return;
    }

    setBio(user.bio || '');
    setCity(user.city || '');
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const possibleKeys = [
      'la-segunda-products',
      'products',
      'user-products',
      'seller-products',
    ];

    const loadedProducts: any[] = [];

    possibleKeys.forEach((key) => {
      const raw = localStorage.getItem(key);

      if (!raw) return;

      try {
        const parsed = JSON.parse(raw);

        if (Array.isArray(parsed)) {
          loadedProducts.push(...parsed);
        }
      } catch {
        console.warn(`No se pudo leer localStorage key: ${key}`);
      }
    });

    setLocalProducts(loadedProducts);
  }, []);

  if (!isAuthenticated || !user) {
    return null;
  }

  const currentUser = user as any;

  const getAvatarByGender = (gender?: string) => {
    if (gender === 'male') return '👨‍💼';
    if (gender === 'female') return '👩‍💼';
    return '🙂';
  };

  const getCurrentPlan = (): MembershipPlan => {
    const rawPlan = String(
      currentUser.membershipType ||
        currentUser.membership ||
        currentUser.plan ||
        currentUser.sellerBadge ||
        'free'
    ).toLowerCase();

    if (
      rawPlan.includes('premium') ||
      rawPlan.includes('elite') ||
      rawPlan === 'premium'
    ) {
      return plans.premium;
    }

    if (rawPlan.includes('plus')) {
      return plans.plus;
    }

    return plans.free;
  };

  const currentPlan = getCurrentPlan();

  const allProducts = useMemo(() => {
    const merged = [...mockProducts, ...localProducts];

    const unique = new Map();

    merged.forEach((product) => {
      if (product?.id) {
        unique.set(product.id, product);
      }
    });

    return Array.from(unique.values());
  }, [localProducts]);

  const userProducts = allProducts.filter((product: any) => {
    return (
      product.sellerId === user.id ||
      product.userId === user.id ||
      product.ownerId === user.id
    );
  });

  const receivedReviews = mockReviews.filter((review) => {
    const product = mockProducts.find((p) => p.id === review.productId);
    return product?.sellerId === user.id;
  });

  const userReviews = mockReviews.filter((review) => review.buyerId === user.id);

  const isVerified = user.verificationStatus === 'verified';

  const verificationLimit = isVerified ? currentPlan.limit : Math.min(currentPlan.limit, 2);

  const publishedCount = userProducts.length;

  const hasUnlimitedPosts = verificationLimit === Infinity;

  const remainingPosts = hasUnlimitedPosts
    ? Infinity
    : Math.max(verificationLimit - publishedCount, 0);

  const canPublish = hasUnlimitedPosts || publishedCount < verificationLimit;

  const progressPercent = hasUnlimitedPosts
    ? 100
    : Math.min((publishedCount / verificationLimit) * 100, 100);

  const publishUrl = canPublish ? '/seller/dashboard' : '/seller/membership';

  const badgeColors: Record<string, string> = {
    standard: 'bg-blue-100 text-blue-800',
    premium: 'bg-purple-100 text-purple-800',
    elite: 'bg-amber-100 text-amber-800',
  };

  const mockFavorites = [
    {
      id: 'fav-1',
      title: 'iPhone 13 Pro usado',
      price: 1850,
      city: 'Lima',
      status: 'Disponible',
    },
    {
      id: 'fav-2',
      title: 'Laptop Lenovo i5',
      price: 1200,
      city: 'Surco',
      status: 'En conversación',
    },
  ];

  const mockConversations = [
    {
      id: 'conv-1',
      product: 'PlayStation 5',
      seller: 'Carlos Mendoza',
      lastMessage: 'Hola, sí sigue disponible.',
      status: 'En conversación',
    },
    {
      id: 'conv-2',
      product: 'Bicicleta montañera',
      seller: 'María López',
      lastMessage: 'Podemos coordinar la entrega.',
      status: 'Reservado',
    },
  ];

  const handleProfileUpdate = () => {
    updateUser({ bio, city });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* DASHBOARD HEADER */}
        <div className="mb-8">
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-primary/10 bg-slate-100 shadow-sm">
                  <span className="text-5xl">{getAvatarByGender(user.gender)}</span>
                </div>

                <div>
                  <div className="mb-2 flex flex-wrap items-center gap-3">
                    <h1 className="text-3xl font-bold">{user.name}</h1>

                    {isVerified ? (
                      <Badge className="gap-1 bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3" />
                        Verificado
                      </Badge>
                    ) : (
                      <Badge className="gap-1 bg-yellow-100 text-yellow-800">
                        <AlertTriangle className="h-3 w-3" />
                        Verificación pendiente
                      </Badge>
                    )}

                    <Badge className={currentPlan.badgeClass}>
                      {currentPlan.name}
                    </Badge>
                  </div>

                  <div className="mb-3 flex flex-wrap gap-2">
                    {user.city && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {user.city}
                      </Badge>
                    )}

                    {user.accountType && (
                      <Badge variant="outline">
                        {getAccountTypeLabel(user.accountType)}
                      </Badge>
                    )}

                    <Badge variant="outline" className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Miembro desde{' '}
                      {new Date(user.joinDate).toLocaleDateString('es-PE', {
                        month: 'long',
                        year: 'numeric',
                      })}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{user.rating}</span>
                    <span className="text-sm text-muted-foreground">
                      ({user.reviewCount} calificaciones)
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href={publishUrl}>
                  <Button
                    className={`w-full sm:w-auto ${
                      canPublish ? '' : 'bg-amber-600 hover:bg-amber-700'
                    }`}
                  >
                    {canPublish ? (
                      <>
                        <PackagePlus className="mr-2 h-4 w-4" />
                        Publicar artículo
                      </>
                    ) : (
                      <>
                        <Lock className="mr-2 h-4 w-4" />
                        Mejorar membresía
                      </>
                    )}
                  </Button>
                </Link>

                <Link href="/messages">
                  <Button variant="outline" className="w-full sm:w-auto">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Mensajes
                  </Button>
                </Link>

                <Button
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <Edit2 className="mr-2 h-4 w-4" />
                  Editar perfil
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* LEFT COLUMN */}
          <div className="space-y-6 lg:col-span-2">
            {/* POSTING LIMIT CARD */}
            <Card className="border-2">
              <CardHeader>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Store className="h-5 w-5 text-primary" />
                      Publicaciones disponibles
                    </CardTitle>
                    <CardDescription>
                      Controla cuántos artículos puedes publicar según tu membresía.
                    </CardDescription>
                  </div>

                  <Badge className={currentPlan.badgeClass}>
                    {currentPlan.name}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent>
                <div className="mb-4 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-sm text-muted-foreground">Publicados</p>
                    <p className="text-3xl font-bold">{publishedCount}</p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-sm text-muted-foreground">Límite actual</p>
                    <p className="text-3xl font-bold">
                      {hasUnlimitedPosts ? '∞' : verificationLimit}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-sm text-muted-foreground">Disponibles</p>
                    <p className="text-3xl font-bold">
                      {hasUnlimitedPosts ? 'Ilimitado' : remainingPosts}
                    </p>
                  </div>
                </div>

                {!hasUnlimitedPosts && (
                  <div className="mb-4">
                    <div className="mb-2 flex justify-between text-sm">
                      <span>Uso de publicaciones</span>
                      <span>
                        {publishedCount}/{verificationLimit}
                      </span>
                    </div>

                    <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
                      <div
                        className={`h-full rounded-full ${
                          canPublish ? 'bg-primary' : 'bg-amber-500'
                        }`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                )}

                {!isVerified && (
                  <div className="mb-4 rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
                    <div className="mb-1 flex items-center gap-2 font-semibold">
                      <AlertTriangle className="h-4 w-4" />
                      Verificación pendiente
                    </div>
                    Los usuarios no verificados solo pueden publicar hasta 2 artículos.
                    Verifica tu identidad para desbloquear más publicaciones.
                  </div>
                )}

                {!canPublish && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <div className="mb-2 flex items-center gap-2 font-semibold text-amber-900">
                      <Lock className="h-4 w-4" />
                      Límite de publicaciones alcanzado
                    </div>

                    <p className="mb-4 text-sm text-amber-800">
                      Ya usaste todas tus publicaciones disponibles. Para seguir
                      publicando artículos, activa una membresía Plus o Premium.
                    </p>

                    <Link href="/seller/membership">
                      <Button className="bg-amber-600 hover:bg-amber-700">
                        <Crown className="mr-2 h-4 w-4" />
                        Ver planes de membresía
                      </Button>
                    </Link>
                  </div>
                )}

                {canPublish && (
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Link href="/seller/dashboard">
                      <Button>
                        <PackagePlus className="mr-2 h-4 w-4" />
                        Publicar nuevo artículo
                      </Button>
                    </Link>

                    <Link href="/seller/membership">
                      <Button variant="outline">
                        <Crown className="mr-2 h-4 w-4" />
                        Mejorar plan
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* EDIT PROFILE */}
            {isEditing && (
              <Card>
                <CardHeader>
                  <CardTitle>Editar perfil</CardTitle>
                  <CardDescription>
                    Actualiza tu información pública dentro de La Segunda.
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Ciudad</label>
                    <Input
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Ejemplo: Lima"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Sobre mí</label>
                    <Input
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Cuéntanos algo sobre ti"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleProfileUpdate}>Guardar cambios</Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancelar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* CONVERSATIONS */}
            <Card>
              <CardHeader>
                <CardTitle>Mis conversaciones recientes</CardTitle>
                <CardDescription>
                  Continúa negociando de forma segura dentro de La Segunda.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3">
                {mockConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className="flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-semibold">{conversation.product}</p>
                      <p className="text-sm text-muted-foreground">
                        Vendedor: {conversation.seller}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {conversation.lastMessage}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{conversation.status}</Badge>
                      <Link href="/messages">
                        <Button size="sm" variant="outline">
                          Abrir chat
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* FAVORITES */}
            <Card>
              <CardHeader>
                <CardTitle>Mis favoritos</CardTitle>
                <CardDescription>
                  Productos que guardaste para revisar después.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  {mockFavorites.map((item) => (
                    <div key={item.id} className="rounded-xl border p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <Heart className="h-5 w-5 text-red-500" />
                        <Badge variant="outline">{item.status}</Badge>
                      </div>

                      <h3 className="font-semibold">{item.title}</h3>

                      <p className="mt-1 text-xl font-bold text-primary">
                        S/ {item.price.toLocaleString()}
                      </p>

                      <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {item.city}
                      </p>

                      <Link href="/products">
                        <Button variant="outline" size="sm" className="mt-4 w-full">
                          Ver producto
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* REVIEWS */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {user.isSeller ? 'Reseñas recibidas' : 'Mis reseñas'}
                </CardTitle>
              </CardHeader>

              <CardContent>
                {receivedReviews.length > 0 || userReviews.length > 0 ? (
                  <div className="space-y-4">
                    {(user.isSeller ? receivedReviews : userReviews).map((review) => {
                      const reviewerName = mockUsers.find(
                        (u) => u.id === review.buyerId
                      )?.name;

                      return (
                        <div key={review.id} className="rounded-xl border p-4">
                          <div className="mb-2 flex items-center justify-between">
                            <div>
                              <p className="font-semibold">{reviewerName}</p>
                              <p className="text-sm text-muted-foreground">
                                {review.createdAt}
                              </p>
                            </div>

                            <div className="flex items-center gap-1">
                              {Array.from({ length: review.rating }).map((_, i) => (
                                <Star
                                  key={i}
                                  className="h-4 w-4 fill-yellow-400 text-yellow-400"
                                />
                              ))}
                            </div>
                          </div>

                          <p className="text-muted-foreground">{review.comment}</p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed p-8 text-center">
                    <p className="text-muted-foreground">
                      No tienes reseñas registradas todavía.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            {/* STATS */}
            <Card>
              <CardHeader>
                <CardTitle>Estadísticas</CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Productos activos</p>
                    <p className="text-2xl font-bold">{userProducts.length}</p>
                  </div>
                  <PackagePlus className="h-6 w-6 text-primary" />
                </div>

                <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Reseñas recibidas</p>
                    <p className="text-2xl font-bold">{receivedReviews.length}</p>
                  </div>
                  <Star className="h-6 w-6 text-yellow-500" />
                </div>

                <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Vistas totales</p>
                    <p className="text-2xl font-bold">
                      {userProducts.reduce(
                        (sum: number, product: any) => sum + (product.views || 0),
                        0
                      )}
                    </p>
                  </div>
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>

                <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Favoritos</p>
                    <p className="text-2xl font-bold">{mockFavorites.length}</p>
                  </div>
                  <Heart className="h-6 w-6 text-red-500" />
                </div>
              </CardContent>
            </Card>

            {/* QUICK ACTIONS */}
            <Card>
              <CardHeader>
                <CardTitle>Acciones rápidas</CardTitle>
              </CardHeader>

              <CardContent className="space-y-3">
                <Link href={publishUrl}>
                  <Button className="w-full justify-between">
                    {canPublish ? 'Publicar artículo' : 'Activar membresía'}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>

                <Link href="/products">
                  <Button variant="outline" className="w-full justify-between">
                    Explorar productos
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>

                <Link href="/messages">
                  <Button variant="outline" className="w-full justify-between">
                    Ver mensajes
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>

                <Link href="/seller/membership">
                  <Button variant="outline" className="w-full justify-between">
                    Ver membresías
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* SECURITY */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-green-600" />
                  Seguridad de cuenta
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-sm text-muted-foreground">Estado de identidad</p>
                  <p className="font-semibold">
                    {isVerified ? 'Identidad verificada' : 'Pendiente de verificación'}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-sm text-muted-foreground">Correo registrado</p>
                  <p className="truncate font-semibold">{user.email}</p>
                </div>

                <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
                  La Segunda protege el contacto entre comprador y vendedor mediante
                  chat interno seguro.
                </div>

                {!isVerified && (
                  <Button variant="outline" className="w-full">
                    Verificar identidad
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* BUSINESS CTA */}
            <Card className="border-amber-200 bg-amber-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-900">
                  <Crown className="h-5 w-5" />
                  Vende más con membresía
                </CardTitle>
                <CardDescription className="text-amber-800">
                  Desbloquea más publicaciones y paga menos comisión por venta.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="mb-4 space-y-2 text-sm text-amber-900">
                  <p>Plus: hasta 20 publicaciones y comisión de 5%.</p>
                  <p>Premium: publicaciones ilimitadas y comisión de 2%.</p>
                </div>

                <Link href="/seller/membership">
                  <Button className="w-full bg-amber-600 hover:bg-amber-700">
                    Ver planes
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
