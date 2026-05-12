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
import { mockProducts, mockOrders } from '@/lib/mock-data';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import {
  ShoppingBag,
  Eye,
  Heart,
  Plus,
  MoreVertical,
  Lock,
  Crown,
  PackagePlus,
  AlertTriangle,
  CheckCircle,
  Edit3,
  Trash2,
  BadgeCheck,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

type PlanType = 'free' | 'plus' | 'premium';

type ProductItem = {
  id: string;
  sellerId?: string;
  userId?: string;
  ownerId?: string;
  title: string;
  description?: string;
  category?: string;
  condition?: string;
  price: number;
  city?: string;
  images?: string[];
  status?: string;
  views?: number;
  favoriteCount?: number;
  createdAt?: string;
};

type PlanConfig = {
  name: string;
  limit: number;
  commissionRate: number;
  price: string;
  badgeClass: string;
};

const PLAN_CONFIG: Record<PlanType, PlanConfig> = {
  free: {
    name: 'Plan Gratis',
    limit: 3,
    commissionRate: 8,
    price: 'S/ 0',
    badgeClass: 'bg-slate-100 text-slate-800',
  },
  plus: {
    name: 'La Segunda Plus',
    limit: 20,
    commissionRate: 5,
    price: 'S/ 19.90/mes',
    badgeClass: 'bg-blue-100 text-blue-800',
  },
  premium: {
    name: 'La Segunda Premium',
    limit: Infinity,
    commissionRate: 2,
    price: 'S/ 49.90/mes',
    badgeClass: 'bg-amber-100 text-amber-800',
  },
};

export default function SellerDashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  const [localProducts, setLocalProducts] = useState<ProductItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const [openActionsId, setOpenActionsId] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<ProductItem | null>(null);

  const [productTitle, setProductTitle] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productCategory, setProductCategory] = useState('Electrónica');
  const [productCondition, setProductCondition] = useState('Bueno');
  const [productPrice, setProductPrice] = useState('');
  const [productCity, setProductCity] = useState('');
  const [productImage, setProductImage] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const rawProducts = localStorage.getItem('la-segunda-products');

    if (!rawProducts) return;

    try {
      const parsedProducts = JSON.parse(rawProducts);

      if (Array.isArray(parsedProducts)) {
        setLocalProducts(parsedProducts);
      }
    } catch {
      setLocalProducts([]);
    }
  }, []);

  if (!isAuthenticated || !user) {
    return null;
  }

  const currentUser = user as any;

  const getCurrentPlan = (): PlanType => {
    const rawPlan = String(
      currentUser.membershipType ||
        currentUser.membership ||
        currentUser.plan ||
        currentUser.sellerBadge ||
        'free'
    ).toLowerCase();

    if (rawPlan.includes('premium') || rawPlan.includes('elite')) {
      return 'premium';
    }

    if (rawPlan.includes('plus')) {
      return 'plus';
    }

    return 'free';
  };

  const currentPlanType = getCurrentPlan();
  const currentPlan = PLAN_CONFIG[currentPlanType];

  const allProducts = useMemo(() => {
    const merged = [...mockProducts, ...localProducts];
    const uniqueProducts = new Map<string, ProductItem>();

    merged.forEach((product: any) => {
      if (product?.id) {
        uniqueProducts.set(product.id, product);
      }
    });

    return Array.from(uniqueProducts.values());
  }, [localProducts]);

  const sellerProducts = allProducts.filter((product: any) => {
    return (
      product.sellerId === user.id ||
      product.userId === user.id ||
      product.ownerId === user.id
    );
  });

  const sellerOrders = mockOrders.filter((order) => order.sellerId === user.id);

  const isVerified = user.verificationStatus === 'verified';

  const postingLimit = isVerified
    ? currentPlan.limit
    : Math.min(currentPlan.limit, 2);

  const publishedCount = sellerProducts.length;
  const hasUnlimitedPosts = postingLimit === Infinity;
  const remainingPosts = hasUnlimitedPosts
    ? Infinity
    : Math.max(postingLimit - publishedCount, 0);

  const canPublish = hasUnlimitedPosts || publishedCount < postingLimit;

  const progressPercent = hasUnlimitedPosts
    ? 100
    : Math.min((publishedCount / postingLimit) * 100, 100);

  const totalRevenue = sellerOrders.reduce((sum, order) => sum + order.amount, 0);
  const totalSales = sellerOrders.filter((order) => order.status === 'completed').length;
  const totalViews = sellerProducts.reduce(
    (sum: number, product: any) => sum + (product.views || 0),
    0
  );
  const totalFavorites = sellerProducts.reduce(
    (sum: number, product: any) => sum + (product.favoriteCount || 0),
    0
  );

  const commissionEarnings = (totalRevenue * currentPlan.commissionRate) / 100;
  const netEarnings = totalRevenue - commissionEarnings;

  const chartData = [
    { month: 'Ene', sales: 0, revenue: 0 },
    { month: 'Feb', sales: 0, revenue: 0 },
    { month: 'Mar', sales: 0, revenue: 0 },
    { month: 'Abr', sales: 0, revenue: 0 },
    { month: 'May', sales: totalSales, revenue: totalRevenue },
    { month: 'Jun', sales: 0, revenue: 0 },
  ];

  const saveProducts = (products: ProductItem[]) => {
    setLocalProducts(products);

    if (typeof window !== 'undefined') {
      localStorage.setItem('la-segunda-products', JSON.stringify(products));
    }
  };

  const resetForm = () => {
    setProductTitle('');
    setProductDescription('');
    setProductCategory('Electrónica');
    setProductCondition('Bueno');
    setProductPrice('');
    setProductCity('');
    setProductImage('');
    setEditingProduct(null);
  };

  const fillFormForEdit = (product: ProductItem) => {
    setEditingProduct(product);
    setProductTitle(product.title || '');
    setProductDescription(product.description || '');
    setProductCategory(product.category || 'Electrónica');
    setProductCondition(product.condition || 'Bueno');
    setProductPrice(String(product.price || ''));
    setProductCity(product.city || '');
    setProductImage(product.images?.[0] || '');
    setShowForm(true);
    setOpenActionsId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCreateOrUpdateProduct = (event: React.FormEvent) => {
    event.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!editingProduct && !canPublish) {
      setFormError('Alcanzaste el límite de publicaciones de tu plan actual.');
      return;
    }

    if (!productTitle.trim()) {
      setFormError('Ingresa el nombre del producto.');
      return;
    }

    if (!productDescription.trim()) {
      setFormError('Ingresa una descripción del producto.');
      return;
    }

    if (!productPrice || Number(productPrice) <= 0) {
      setFormError('Ingresa un precio válido.');
      return;
    }

    if (!productCity.trim()) {
      setFormError('Ingresa la ciudad donde se encuentra el producto.');
      return;
    }

    if (editingProduct) {
      const updatedProducts = localProducts.map((product) => {
        if (product.id !== editingProduct.id) return product;

        return {
          ...product,
          title: productTitle.trim(),
          description: productDescription.trim(),
          category: productCategory,
          condition: productCondition,
          price: Number(productPrice),
          city: productCity.trim(),
          images: [
            productImage.trim() ||
              'https://placehold.co/600x600?text=La+Segunda',
          ],
        };
      });

      saveProducts(updatedProducts);
      setFormSuccess('Producto actualizado correctamente.');
      setShowForm(false);
      resetForm();
      return;
    }

    const newProduct: ProductItem = {
      id: `local-${Date.now()}`,
      sellerId: user.id,
      title: productTitle.trim(),
      description: productDescription.trim(),
      category: productCategory,
      condition: productCondition,
      price: Number(productPrice),
      city: productCity.trim(),
      images: [
        productImage.trim() ||
          'https://placehold.co/600x600?text=La+Segunda',
      ],
      status: 'active',
      views: 0,
      favoriteCount: 0,
      createdAt: new Date().toISOString(),
    };

    const updatedProducts = [...localProducts, newProduct];

    saveProducts(updatedProducts);
    setFormSuccess('Producto publicado correctamente.');
    setShowForm(false);
    resetForm();
  };

  const handleMarkAsSold = (productId: string) => {
    const updatedProducts = localProducts.map((product) => {
      if (product.id !== productId) return product;

      return {
        ...product,
        status: 'sold',
      };
    });

    saveProducts(updatedProducts);
    setOpenActionsId(null);
  };

  const handleDeleteProduct = () => {
    if (!deleteProduct) return;

    const updatedProducts = localProducts.filter(
      (product) => product.id !== deleteProduct.id
    );

    saveProducts(updatedProducts);
    setDeleteProduct(null);
    setOpenActionsId(null);
  };

  const getProductImage = (product: ProductItem) => {
    return product.images?.[0] || 'https://placehold.co/100x100?text=La+Segunda';
  };

  const getStatusLabel = (status?: string) => {
    if (status === 'sold') return 'Vendido';
    if (status === 'reserved') return 'Reservado';
    if (status === 'pending') return 'Pendiente';
    return 'Activo';
  };

  const getStatusVariant = (status?: string) => {
    if (status === 'sold') return 'secondary';
    if (status === 'pending') return 'outline';
    return 'default';
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Panel de publicaciones</h1>
            <p className="text-muted-foreground">
              Publica artículos, controla tus límites y administra tus ventas.
            </p>
          </div>

          {canPublish ? (
            <Button
              onClick={() => {
                resetForm();
                setShowForm(!showForm);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Publicar artículo
            </Button>
          ) : (
            <Link href="/seller/membership">
              <Button className="bg-amber-600 hover:bg-amber-700">
                <Crown className="mr-2 h-4 w-4" />
                Mejorar membresía
              </Button>
            </Link>
          )}
        </div>

        <Card className="mb-8 border-2">
          <CardHeader>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <PackagePlus className="h-5 w-5 text-primary" />
                  Control de publicaciones
                </CardTitle>
                <CardDescription>
                  Tu capacidad para publicar depende de tu plan y verificación de identidad.
                </CardDescription>
              </div>

              <Badge className={currentPlan.badgeClass}>
                {currentPlan.name}
              </Badge>
            </div>
          </CardHeader>

          <CardContent>
            <div className="mb-5 grid gap-4 md:grid-cols-4">
              <div className="rounded-xl bg-slate-100 p-4">
                <p className="text-sm text-muted-foreground">Plan actual</p>
                <p className="text-xl font-bold">{currentPlan.name}</p>
                <p className="text-sm text-muted-foreground">{currentPlan.price}</p>
              </div>

              <div className="rounded-xl bg-slate-100 p-4">
                <p className="text-sm text-muted-foreground">Publicados</p>
                <p className="text-3xl font-bold">{publishedCount}</p>
              </div>

              <div className="rounded-xl bg-slate-100 p-4">
                <p className="text-sm text-muted-foreground">Límite</p>
                <p className="text-3xl font-bold">
                  {hasUnlimitedPosts ? '∞' : postingLimit}
                </p>
              </div>

              <div className="rounded-xl bg-slate-100 p-4">
                <p className="text-sm text-muted-foreground">Disponibles</p>
                <p className="text-3xl font-bold">
                  {hasUnlimitedPosts ? 'Ilimitado' : remainingPosts}
                </p>
              </div>
            </div>

            {!hasUnlimitedPosts && (
              <div className="mb-5">
                <div className="mb-2 flex justify-between text-sm">
                  <span>Uso de publicaciones</span>
                  <span>
                    {publishedCount}/{postingLimit}
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
              <div className="mb-5 rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
                <div className="mb-1 flex items-center gap-2 font-semibold">
                  <AlertTriangle className="h-4 w-4" />
                  Verificación pendiente
                </div>
                Los usuarios no verificados solo pueden publicar hasta 2 artículos.
                Verifica tu identidad para desbloquear más publicaciones.
              </div>
            )}

            {!canPublish && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
                <div className="mb-2 flex items-center gap-2 font-semibold text-amber-900">
                  <Lock className="h-5 w-5" />
                  Alcanzaste el límite de publicaciones
                </div>

                <p className="mb-4 text-sm text-amber-800">
                  Para continuar publicando artículos en La Segunda, debes activar una
                  membresía Plus o Premium.
                </p>

                <Link href="/seller/membership">
                  <Button className="bg-amber-600 hover:bg-amber-700">
                    <Crown className="mr-2 h-4 w-4" />
                    Ver planes de membresía
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle>
                    {editingProduct ? 'Editar producto' : 'Publicar nuevo artículo'}
                  </CardTitle>
                  <CardDescription>
                    {editingProduct
                      ? 'Actualiza la información del producto publicado.'
                      : 'Completa la información del producto usado que deseas vender.'}
                  </CardDescription>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              {formError && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {formError}
                </div>
              )}

              {formSuccess && (
                <div className="mb-4 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                  {formSuccess}
                </div>
              )}

              <form onSubmit={handleCreateOrUpdateProduct} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nombre del producto</label>
                    <Input
                      value={productTitle}
                      onChange={(event) => setProductTitle(event.target.value)}
                      placeholder="Ejemplo: iPhone 13 Pro"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Precio</label>
                    <Input
                      type="number"
                      value={productPrice}
                      onChange={(event) => setProductPrice(event.target.value)}
                      placeholder="Ejemplo: 1500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Descripción</label>
                  <Input
                    value={productDescription}
                    onChange={(event) => setProductDescription(event.target.value)}
                    placeholder="Describe el estado, uso y detalles del producto"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Categoría</label>
                    <select
                      value={productCategory}
                      onChange={(event) => setProductCategory(event.target.value)}
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                    >
                      <option>Electrónica</option>
                      <option>Celulares</option>
                      <option>Laptops</option>
                      <option>Ropa</option>
                      <option>Hogar</option>
                      <option>Muebles</option>
                      <option>Vehículos</option>
                      <option>Otros</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Estado</label>
                    <select
                      value={productCondition}
                      onChange={(event) => setProductCondition(event.target.value)}
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                    >
                      <option>Nuevo</option>
                      <option>Como nuevo</option>
                      <option>Bueno</option>
                      <option>Regular</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Ciudad</label>
                    <Input
                      value={productCity}
                      onChange={(event) => setProductCity(event.target.value)}
                      placeholder="Ejemplo: Lima"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Imagen URL opcional</label>
                  <Input
                    value={productImage}
                    onChange={(event) => setProductImage(event.target.value)}
                    placeholder="Pega una URL de imagen o déjalo vacío"
                  />
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button type="submit">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    {editingProduct ? 'Guardar cambios' : 'Publicar producto'}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false);
                      resetForm();
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Ingresos totales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                S/ {totalRevenue.toLocaleString()}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Neto: S/ {netEarnings.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Ventas completadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSales}</div>
              <p className="mt-1 text-xs text-muted-foreground">
                {sellerOrders.length} total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Vistas totales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalViews.toLocaleString()}</div>
              <p className="mt-1 text-xs text-muted-foreground">
                De {sellerProducts.length} productos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Favoritos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalFavorites.toLocaleString()}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Guardados por compradores
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mb-8 grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Ventas mensuales</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="sales" fill="var(--color-primary)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ingresos mensuales</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--color-primary)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="mb-8 grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Plan actual</CardTitle>
              <CardDescription>Administra tu membresía</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="font-semibold">{currentPlan.name}</div>
                  <div className="text-sm text-muted-foreground">
                    Comisión: {currentPlan.commissionRate}%
                  </div>
                </div>
                <Badge className={currentPlan.badgeClass}>
                  {currentPlan.price}
                </Badge>
              </div>

              <Link href="/seller/membership">
                <Button variant="outline" className="w-full">
                  Ver planes
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resumen de ganancias</CardTitle>
              <CardDescription>Período actual</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ingresos brutos:</span>
                  <span className="font-medium">
                    S/ {totalRevenue.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Comisión ({currentPlan.commissionRate}%):
                  </span>
                  <span className="font-medium">
                    -S/ {commissionEarnings.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-semibold">Ganancias netas:</span>
                  <span className="font-bold text-primary">
                    S/ {netEarnings.toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Mis productos</CardTitle>
              <CardDescription>
                Administra tus productos publicados en La Segunda.
              </CardDescription>
            </div>

            {canPublish ? (
              <Button
                size="sm"
                onClick={() => {
                  resetForm();
                  setShowForm(true);
                }}
              >
                <Plus className="mr-1 h-4 w-4" />
                Nuevo
              </Button>
            ) : (
              <Link href="/seller/membership">
                <Button size="sm" className="bg-amber-600 hover:bg-amber-700">
                  <Lock className="mr-1 h-4 w-4" />
                  Plan
                </Button>
              </Link>
            )}
          </CardHeader>

          <CardContent>
            {sellerProducts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr>
                      <th className="p-2 text-left">Producto</th>
                      <th className="p-2 text-left">Precio</th>
                      <th className="p-2 text-left">Vistas</th>
                      <th className="p-2 text-left">Favoritos</th>
                      <th className="p-2 text-left">Estado</th>
                      <th className="p-2 text-left">Acciones</th>
                    </tr>
                  </thead>

                  <tbody>
                    {sellerProducts.map((product: ProductItem) => (
                      <tr key={product.id} className="border-b hover:bg-muted/50">
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            <img
                              src={getProductImage(product)}
                              alt={product.title}
                              className="h-10 w-10 rounded object-cover"
                            />
                            <span className="line-clamp-1 font-medium">
                              {product.title}
                            </span>
                          </div>
                        </td>

                        <td className="p-2">
                          S/ {Number(product.price || 0).toLocaleString()}
                        </td>

                        <td className="p-2">
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4 text-muted-foreground" />
                            {product.views || 0}
                          </div>
                        </td>

                        <td className="p-2">
                          <div className="flex items-center gap-1">
                            <Heart className="h-4 w-4 text-muted-foreground" />
                            {product.favoriteCount || 0}
                          </div>
                        </td>

                        <td className="p-2">
                          <Badge variant={getStatusVariant(product.status) as any}>
                            {getStatusLabel(product.status)}
                          </Badge>
                        </td>

                        <td className="relative p-2">
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={() =>
                              setOpenActionsId(
                                openActionsId === product.id ? null : product.id
                              )
                            }
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>

                          {openActionsId === product.id && (
                            <div className="absolute right-2 top-10 z-20 w-52 overflow-hidden rounded-xl border bg-white shadow-lg">
                              <button
                                type="button"
                                onClick={() => fillFormForEdit(product)}
                                className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm hover:bg-slate-100"
                              >
                                <Edit3 className="h-4 w-4 text-blue-600" />
                                Editar
                              </button>

                              <button
                                type="button"
                                onClick={() => handleMarkAsSold(product.id)}
                                className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm hover:bg-slate-100"
                              >
                                <BadgeCheck className="h-4 w-4 text-green-600" />
                                Marcar como vendido
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setDeleteProduct(product);
                                  setOpenActionsId(null);
                                }}
                                className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                                Eliminar
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center">
                <ShoppingBag className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <p className="mb-4 text-muted-foreground">
                  Aún no has publicado productos.
                </p>

                {canPublish ? (
                  <Button onClick={() => setShowForm(true)}>
                    Publicar primer producto
                  </Button>
                ) : (
                  <Link href="/seller/membership">
                    <Button className="bg-amber-600 hover:bg-amber-700">
                      Ver planes de membresía
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Órdenes recientes</CardTitle>
            <CardDescription>Tus últimas ventas registradas.</CardDescription>
          </CardHeader>

          <CardContent>
            {sellerOrders.length > 0 ? (
              <div className="space-y-4">
                {sellerOrders.map((order) => {
                  const product = mockProducts.find((p) => p.id === order.productId);

                  return (
                    <div
                      key={order.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div>
                        <h4 className="font-semibold">
                          {product?.title || 'Producto'}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Orden {order.id} • {order.createdAt}
                        </p>
                      </div>

                      <div className="text-right">
                        <div className="font-bold">
                          S/ {order.amount.toLocaleString()}
                        </div>

                        <Badge
                          variant={
                            order.status === 'completed'
                              ? 'default'
                              : 'secondary'
                          }
                        >
                          {order.status === 'completed'
                            ? 'Completada'
                            : order.status === 'pending'
                              ? 'Pendiente'
                              : 'Cancelada'}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="py-8 text-center text-muted-foreground">
                Aún no tienes órdenes.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {deleteProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Eliminar producto</CardTitle>
              <CardDescription>
                Esta acción eliminará el producto de tus publicaciones.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="rounded-xl border bg-slate-50 p-4">
                <p className="font-semibold">{deleteProduct.title}</p>
                <p className="text-sm text-muted-foreground">
                  S/ {Number(deleteProduct.price || 0).toLocaleString()}
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  className="w-full bg-red-600 hover:bg-red-700"
                  onClick={handleDeleteProduct}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Sí, eliminar
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setDeleteProduct(null)}
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
