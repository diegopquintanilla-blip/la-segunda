'use client';

import { Header } from '@/components/header';
import { ProductCard } from '@/components/product-card';
import { mockProducts } from '@/lib/mock-data';
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
  Star,
  TrendingUp,
  Users,
  CheckCircle,
  PackageSearch,
  PackagePlus,
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useEffect, useMemo, useState } from 'react';

export default function HomePage() {
  const { isAuthenticated } = useAuth();

  const [clientProducts, setClientProducts] = useState<any[]>([]);
  const categories = ['Electrónica', 'Muebles', 'Ropa', 'Deportes', 'Música', 'Libros'];

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const savedProducts = localStorage.getItem('la-segunda-products');

    if (!savedProducts) {
      setClientProducts([]);
      return;
    }

    try {
      const parsedProducts = JSON.parse(savedProducts);

      if (Array.isArray(parsedProducts)) {
        setClientProducts(parsedProducts);
      }
    } catch {
      setClientProducts([]);
    }
  }, []);

  const featuredProducts = useMemo(() => {
    const activeClientProducts = clientProducts.filter((product) => {
      return product.status === 'active' || !product.status;
    });

    const normalizedClientProducts = activeClientProducts.map((product) => ({
      ...product,
      title: product.title || product.name || 'Producto publicado',
      images:
        product.images && product.images.length > 0
          ? product.images
          : ['https://placehold.co/800x600?text=La+Segunda'],
      price: Number(product.price || 0),
      views: product.views || 0,
      favoriteCount: product.favoriteCount || 0,
      status: product.status || 'active',
      isFeatured: product.isFeatured ?? true,
    }));

    if (normalizedClientProducts.length > 0) {
      return normalizedClientProducts
        .sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;

          return dateB - dateA;
        })
        .slice(0, 8);
    }

    return mockProducts.slice(0, 8);
  }, [clientProducts]);

  const hasClientProducts = clientProducts.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-secondary text-primary-foreground py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">
              Compra y vende productos de segunda mano con confianza
            </h1>

            <p className="text-lg md:text-xl mb-8 opacity-90">
              La Segunda es el marketplace confiable donde miles de usuarios compran y venden artículos de calidad.
            </p>

            {!isAuthenticated && (
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth/register" className="flex-1 sm:flex-none">
                  <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                    Publicar mi primer producto
                  </Button>
                </Link>

                <Link href="#categories" className="flex-1 sm:flex-none">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10 w-full sm:w-auto"
                  >
                    Explorar productos
                  </Button>
                </Link>
              </div>
            )}

            {isAuthenticated && (
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/seller/dashboard" className="flex-1 sm:flex-none">
                  <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                    Ir a mi panel
                  </Button>
                </Link>

                <Link href="#categories" className="flex-1 sm:flex-none">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10 w-full sm:w-auto"
                  >
                    Explorar productos
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-8 md:py-12 border-b bg-card">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-3">
                <Star className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg mb-2">Publica gratis</h3>
              <p className="text-sm text-muted-foreground">
                Sin costo por crear anuncios. Solo pagas comisión al vender.
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-3">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg mb-2">Vendedores verificados</h3>
              <p className="text-sm text-muted-foreground">
                Compra con confianza a vendedores verificados por La Segunda.
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-3">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg mb-2">Chat protegido</h3>
              <p className="text-sm text-muted-foreground">
                Comunicación segura sin compartir datos personales.
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-3">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg mb-2">Comisiones claras</h3>
              <p className="text-sm text-muted-foreground">
                Sabes exactamente cuánto pagarás según tu plan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section id="categories" className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-8">Categorías</h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <Link key={category} href="/products">
                <button className="w-full p-4 rounded-lg border bg-card hover:bg-muted transition text-center">
                  <div className="text-2xl mb-2">📦</div>
                  <span className="text-sm font-medium">{category}</span>
                </button>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Membership Plans Section */}
      <section className="py-8 md:py-12 border-t bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              Planes de membresía
            </h2>

            <p className="text-muted-foreground max-w-2xl mx-auto">
              Elige el plan que mejor se adapte a tus necesidades como vendedor.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Free Plan */}
            <Card>
              <CardHeader>
                <CardTitle>Gratis</CardTitle>
                <CardDescription>
                  <span className="text-2xl font-bold text-primary">S/ 0</span>
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="text-sm font-medium">Comisión: 8%</div>

                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      Hasta 3 productos
                    </li>

                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      Chat protegido
                    </li>

                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      Soporte básico
                    </li>
                  </ul>
                </div>

                <Link
                  href={isAuthenticated ? '/seller/membership' : '/auth/register'}
                  className="w-full"
                >
                  <Button variant="outline" className="w-full">
                    {isAuthenticated ? 'Actual' : 'Comenzar'}
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Plus Plan */}
            <Card className="border-primary md:relative md:top-2">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <CardTitle>Plus</CardTitle>
                  <Badge className="bg-primary">Recomendado</Badge>
                </div>

                <CardDescription>
                  <span className="text-2xl font-bold text-primary">S/ 19.90</span>
                  <span className="text-xs ml-1">/mes</span>
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="text-sm font-medium">Comisión: 5%</div>

                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      Hasta 20 productos
                    </li>

                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      Chat protegido
                    </li>

                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      Soporte prioritario
                    </li>

                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      Badge verificado
                    </li>
                  </ul>
                </div>

                <Link
                  href={isAuthenticated ? '/seller/membership' : '/auth/register'}
                  className="w-full"
                >
                  <Button className="w-full">Actualizar</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Premium Plan */}
            <Card>
              <CardHeader>
                <CardTitle>Premium</CardTitle>
                <CardDescription>
                  <span className="text-2xl font-bold text-primary">S/ 49.90</span>
                  <span className="text-xs ml-1">/mes</span>
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="text-sm font-medium">Comisión: 2%</div>

                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      Productos ilimitados
                    </li>

                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      Chat protegido
                    </li>

                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      Soporte 24/7
                    </li>

                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      Badge verificado Premium
                    </li>
                  </ul>
                </div>

                <Link
                  href={isAuthenticated ? '/seller/membership' : '/auth/register'}
                  className="w-full"
                >
                  <Button className="w-full">Actualizar</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-8 md:py-12 border-t">
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                <TrendingUp className="text-primary" />
                Productos destacados
              </h2>

              <p className="text-sm text-muted-foreground mt-2">
                {hasClientProducts
                  ? 'Estos productos fueron publicados por clientes de La Segunda.'
                  : 'Cuando los clientes publiquen artículos, aparecerán aquí automáticamente.'}
              </p>
            </div>

            <Link href="/products">
              <Button variant="outline">Ver todos</Button>
            </Link>
          </div>

          {featuredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="py-14 text-center">
                <PackageSearch className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />

                <h3 className="mb-2 text-xl font-bold">
                  Aún no hay productos publicados
                </h3>

                <p className="mb-6 text-muted-foreground">
                  Los artículos publicados por clientes aparecerán en esta sección.
                </p>

                <Link href="/seller/dashboard">
                  <Button>
                    <PackagePlus className="mr-2 h-4 w-4" />
                    Publicar primer artículo
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-8 md:py-12 border-t">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-8">
            Por qué confiar en La Segunda
          </h2>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card>
              <CardHeader>
                <div className="text-4xl mb-2">🛡️</div>
                <CardTitle>Comprador Protegido</CardTitle>
              </CardHeader>

              <CardContent className="text-muted-foreground">
                Tu dinero está protegido hasta que recibas el producto en las condiciones acordadas.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="text-4xl mb-2">⭐</div>
                <CardTitle>Calificaciones Verificadas</CardTitle>
              </CardHeader>

              <CardContent className="text-muted-foreground">
                Solo compradores verificados pueden dejar calificaciones. Ve las opiniones reales de clientes.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="text-4xl mb-2">📱</div>
                <CardTitle>Chat Seguro</CardTitle>
              </CardHeader>

              <CardContent className="text-muted-foreground">
                Comunícate directamente con vendedores sin compartir tu número de teléfono.
              </CardContent>
            </Card>
          </div>

          {/* Chat Protection Section */}
          <div className="bg-gradient-to-r from-secondary/10 to-accent/10 rounded-lg border border-secondary/20 p-8 md:p-12">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-start gap-4">
                <div className="text-5xl flex-shrink-0">💬</div>

                <div>
                  <h3 className="text-2xl font-bold mb-3">
                    Chat protegido para comprador y vendedor
                  </h3>

                  <p className="text-muted-foreground mb-4 text-lg">
                    La Segunda protege el contacto entre comprador y vendedor mediante un chat interno seguro. No necesitas compartir tu número de teléfono, email o datos personales. Toda la comunicación se realiza a través de nuestra plataforma encriptada.
                  </p>

                  <ul className="space-y-2">
                    <li className="flex items-center gap-3 text-sm">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                      <span>Mensajes cifrados punto a punto</span>
                    </li>

                    <li className="flex items-center gap-3 text-sm">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                      <span>Tu identidad se mantiene privada durante la negociación</span>
                    </li>

                    <li className="flex items-center gap-3 text-sm">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                      <span>Historial de conversación verificable</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold mb-4">La Segunda</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Sobre nosotros
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Careers
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-4">Comprar</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Cómo funciona
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Categorías
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Ofertas
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-4">Vender</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/seller/dashboard" className="hover:text-foreground">
                    Comenzar a vender
                  </Link>
                </li>
                <li>
                  <Link href="/seller/membership" className="hover:text-foreground">
                    Planes
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Soporte
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-4">Política</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Privacidad
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Términos
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Contacto
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2026 La Segunda. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
