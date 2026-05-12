'use client';

import { Header } from '@/components/header';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockProducts, mockOrders, mockMemberships } from '@/lib/mock-data';
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
  TrendingUp,
  ShoppingBag,
  Eye,
  Heart,
  Plus,
  MoreVertical,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SellerDashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  if (!isAuthenticated) {
    router.push('/auth/login');
    return null;
  }

  if (!user?.isSeller) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Acceso restringido</h1>
          <p className="text-muted-foreground mb-6">
            Solo los vendedores pueden acceder al panel de ventas.
          </p>
          <Link href="/">
            <Button>Volver al inicio</Button>
          </Link>
        </div>
      </div>
    );
  }

  const sellerProducts = mockProducts.filter((p) => p.sellerId === user.id);
  const sellerOrders = mockOrders.filter((o) => o.sellerId === user.id);
  const totalRevenue = sellerOrders.reduce((sum, order) => sum + order.amount, 0);
  const totalSales = sellerOrders.filter((o) => o.status === 'completed').length;
  const totalViews = sellerProducts.reduce((sum, p) => sum + p.views, 0);
  const totalFavorites = sellerProducts.reduce((sum, p) => sum + p.favoriteCount, 0);

  const membership = mockMemberships.find((m) => m.type === user.sellerBadge) || mockMemberships[0];
  const commissionRate = membership.commissionRate;
  const commissionEarnings = (totalRevenue * commissionRate) / 100;
  const netEarnings = totalRevenue - commissionEarnings;

  // Chart data
  const chartData = [
    { month: 'Ene', sales: 12, revenue: 2400 },
    { month: 'Feb', sales: 19, revenue: 2210 },
    { month: 'Mar', sales: 5, revenue: 2290 },
    { month: 'Abr', sales: 22, revenue: 2000 },
    { month: 'May', sales: 28, revenue: 2181 },
    { month: 'Jun', sales: 20, revenue: 2500 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Panel de ventas</h1>
          <Link href="/seller/products/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo producto
            </Button>
          </Link>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Ingresos totales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">S/ {totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
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
              <p className="text-xs text-muted-foreground mt-1">
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
              <p className="text-xs text-muted-foreground mt-1">
                De {sellerProducts.length} productos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Calificación
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user.rating}</div>
              <p className="text-xs text-muted-foreground mt-1">
                de {user.reviewCount} valoraciones
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
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
                  <Line type="monotone" dataKey="revenue" stroke="var(--color-primary)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Membership and Commission */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Plan actual</CardTitle>
              <CardDescription>Administra tu membresía</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">{membership.name}</div>
                  <div className="text-sm text-muted-foreground">
                    Comisión: {membership.commissionRate}%
                  </div>
                </div>
                <Badge>{membership.price === 0 ? 'Gratis' : `S/ ${membership.price}/mes`}</Badge>
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
                  <span className="font-medium">S/ {totalRevenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Comisión ({commissionRate}%):</span>
                  <span className="font-medium">-S/ {commissionEarnings.toLocaleString()}</span>
                </div>
                <div className="border-t pt-2 flex justify-between">
                  <span className="font-semibold">Ganancias netas:</span>
                  <span className="font-bold text-primary">S/ {netEarnings.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Products */}
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Mis productos</CardTitle>
              <CardDescription>Administra tus productos en venta</CardDescription>
            </div>
            <Link href="/seller/products/new">
              <Button size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Nuevo
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {sellerProducts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left p-2">Producto</th>
                      <th className="text-left p-2">Precio</th>
                      <th className="text-left p-2">Vistas</th>
                      <th className="text-left p-2">Favoritos</th>
                      <th className="text-left p-2">Estado</th>
                      <th className="text-left p-2">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sellerProducts.map((product) => (
                      <tr key={product.id} className="border-b hover:bg-muted/50">
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            <img
                              src={product.images[0]}
                              alt={product.title}
                              className="w-8 h-8 rounded object-cover"
                            />
                            <span className="font-medium line-clamp-1">
                              {product.title}
                            </span>
                          </div>
                        </td>
                        <td className="p-2">S/ {product.price.toLocaleString()}</td>
                        <td className="p-2">{product.views}</td>
                        <td className="p-2">{product.favoriteCount}</td>
                        <td className="p-2">
                          <Badge
                            variant={
                              product.status === 'active'
                                ? 'default'
                                : product.status === 'sold'
                                  ? 'secondary'
                                  : 'outline'
                            }
                          >
                            {product.status === 'active'
                              ? 'Activo'
                              : product.status === 'sold'
                                ? 'Vendido'
                                : 'Pendiente'}
                          </Badge>
                        </td>
                        <td className="p-2">
                          <button className="p-1 hover:bg-muted rounded">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <ShoppingBag className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">Aún no has publicado productos</p>
                <Link href="/seller/products/new">
                  <Button>Publicar primer producto</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Órdenes recientes</CardTitle>
            <CardDescription>Tus últimas ventas</CardDescription>
          </CardHeader>
          <CardContent>
            {sellerOrders.length > 0 ? (
              <div className="space-y-4">
                {sellerOrders.map((order) => {
                  const product = mockProducts.find((p) => p.id === order.productId);
                  return (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
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
              <p className="text-center text-muted-foreground py-8">
                Aún no tienes órdenes
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
