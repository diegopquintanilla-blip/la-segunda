'use client';

import { Header } from '@/components/header';
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
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export default function HomePage() {
  const { isAuthenticated } = useAuth();

  const categories = [
    'Electrónica',
    'Muebles',
    'Ropa',
    'Deportes',
    'Música',
    'Libros',
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-secondary py-12 text-primary-foreground md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl">
            <h1 className="mb-4 text-balance text-4xl font-bold md:text-5xl">
              Compra y vende productos de segunda mano con confianza
            </h1>

            <p className="mb-8 text-lg opacity-90 md:text-xl">
              La Segunda es el marketplace confiable donde miles de usuarios compran
              y venden artículos de calidad.
            </p>

            {!isAuthenticated && (
              <div className="flex flex-col gap-4 sm:flex-row">
                <Link href="/auth/register" className="flex-1 sm:flex-none">
                  <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                    Publicar mi primer producto
                  </Button>
                </Link>

                <Link href="#categories" className="flex-1 sm:flex-none">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10 sm:w-auto"
                  >
                    Explorar productos
                  </Button>
                </Link>
              </div>
            )}

            {isAuthenticated && (
              <div className="flex flex-col gap-4 sm:flex-row">
                <Link href="/seller/dashboard" className="flex-1 sm:flex-none">
                  <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                    Ir a mi panel
                  </Button>
                </Link>

                <Link href="#categories" className="flex-1 sm:flex-none">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10 sm:w-auto"
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
      <section className="border-b bg-card py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
            <div className="text-center">
              <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Star className="h-6 w-6" />
              </div>

              <h3 className="mb-2 text-lg font-bold">Publica gratis</h3>

              <p className="text-sm text-muted-foreground">
                Sin costo por crear anuncios. Solo pagas comisión al vender.
              </p>
            </div>

            <div className="text-center">
              <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <CheckCircle className="h-6 w-6" />
              </div>

              <h3 className="mb-2 text-lg font-bold">Vendedores verificados</h3>

              <p className="text-sm text-muted-foreground">
                Compra con confianza a vendedores verificados por La Segunda.
              </p>
            </div>

            <div className="text-center">
              <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Users className="h-6 w-6" />
              </div>

              <h3 className="mb-2 text-lg font-bold">Chat protegido</h3>

              <p className="text-sm text-muted-foreground">
                Comunicación segura sin compartir datos personales.
              </p>
            </div>

            <div className="text-center">
              <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <TrendingUp className="h-6 w-6" />
              </div>

              <h3 className="mb-2 text-lg font-bold">Comisiones claras</h3>

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
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold md:text-3xl">Categorías</h2>

              <p className="mt-2 text-sm text-muted-foreground">
                Explora productos publicados por vendedores de La Segunda.
              </p>
            </div>

            <Link href="/products">
              <Button variant="outline">Ver todos los productos</Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {categories.map((category) => (
              <Link key={category} href="/products">
                <button className="w-full rounded-lg border bg-card p-4 text-center transition hover:bg-muted">
                  <div className="mb-2 text-2xl">📦</div>
                  <span className="text-sm font-medium">{category}</span>
                </button>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Membership Plans Section */}
      <section className="border-t bg-muted/30 py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-2xl font-bold md:text-3xl">
              Planes de membresía
            </h2>

            <p className="mx-auto max-w-2xl text-muted-foreground">
              Elige el plan que mejor se adapte a tus necesidades como vendedor.
            </p>
          </div>

          <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
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
                      <CheckCircle className="h-4 w-4 text-primary" />
                      Hasta 3 productos
                    </li>

                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      Chat protegido
                    </li>

                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-primary" />
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
                <div className="mb-2 flex items-center justify-between">
                  <CardTitle>Plus</CardTitle>
                  <Badge className="bg-primary">Recomendado</Badge>
                </div>

                <CardDescription>
                  <span className="text-2xl font-bold text-primary">S/ 19.90</span>
                  <span className="ml-1 text-xs">/mes</span>
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="text-sm font-medium">Comisión: 5%</div>

                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      Hasta 20 productos
                    </li>

                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      Chat protegido
                    </li>

                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      Soporte prioritario
                    </li>

                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-primary" />
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
                  <span className="ml-1 text-xs">/mes</span>
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="text-sm font-medium">Comisión: 2%</div>

                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      Productos ilimitados
                    </li>

                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      Chat protegido
                    </li>

                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      Soporte 24/7
                    </li>

                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-primary" />
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

      {/* Trust Section */}
      <section className="border-t py-8 md:py-12">
        <div className="container mx-auto px-4">
          <h2 className="mb-8 text-2xl font-bold md:text-3xl">
            Por qué confiar en La Segunda
          </h2>

          <div className="mb-12 grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <div className="mb-2 text-4xl">🛡️</div>
                <CardTitle>Comprador Protegido</CardTitle>
              </CardHeader>

              <CardContent className="text-muted-foreground">
                Tu dinero está protegido hasta que recibas el producto en las
                condiciones acordadas.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-2 text-4xl">⭐</div>
                <CardTitle>Calificaciones Verificadas</CardTitle>
              </CardHeader>

              <CardContent className="text-muted-foreground">
                Solo compradores verificados pueden dejar calificaciones. Ve las
                opiniones reales de clientes.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-2 text-4xl">📱</div>
                <CardTitle>Chat Seguro</CardTitle>
              </CardHeader>

              <CardContent className="text-muted-foreground">
                Comunícate directamente con vendedores sin compartir tu número de
                teléfono.
              </CardContent>
            </Card>
          </div>

          {/* Chat Protection Section */}
          <div className="rounded-lg border border-secondary/20 bg-gradient-to-r from-secondary/10 to-accent/10 p-8 md:p-12">
            <div className="mx-auto max-w-3xl">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 text-5xl">💬</div>

                <div>
                  <h3 className="mb-3 text-2xl font-bold">
                    Chat protegido para comprador y vendedor
                  </h3>

                  <p className="mb-4 text-lg text-muted-foreground">
                    La Segunda protege el contacto entre comprador y vendedor
                    mediante un chat interno seguro. No necesitas compartir tu número
                    de teléfono, email o datos personales.
                  </p>

                  <ul className="space-y-2">
                    <li className="flex items-center gap-3 text-sm">
                      <CheckCircle className="h-5 w-5 flex-shrink-0 text-primary" />
                      <span>Mensajes cifrados punto a punto</span>
                    </li>

                    <li className="flex items-center gap-3 text-sm">
                      <CheckCircle className="h-5 w-5 flex-shrink-0 text-primary" />
                      <span>
                        Tu identidad se mantiene privada durante la negociación
                      </span>
                    </li>

                    <li className="flex items-center gap-3 text-sm">
                      <CheckCircle className="h-5 w-5 flex-shrink-0 text-primary" />
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
          <div className="mb-8 grid gap-8 md:grid-cols-4">
            <div>
              <h3 className="mb-4 font-bold">La Segunda</h3>

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
              <h3 className="mb-4 font-bold">Comprar</h3>

              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Cómo funciona
                  </Link>
                </li>

                <li>
                  <Link href="/products" className="hover:text-foreground">
                    Categorías
                  </Link>
                </li>

                <li>
                  <Link href="/products" className="hover:text-foreground">
                    Ofertas
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 font-bold">Vender</h3>

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
              <h3 className="mb-4 font-bold">Política</h3>

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
