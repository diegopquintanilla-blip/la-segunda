'use client';

import Link from 'next/link';
import { Header } from '@/components/header';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Star, TrendingUp, Users } from 'lucide-react';

export default function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="bg-gradient-to-r from-primary to-secondary py-12 text-primary-foreground md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl">
            <h1 className="mb-4 text-balance text-4xl font-bold md:text-5xl">
              Compra, vende y descubre productos en un solo marketplace
            </h1>

            <p className="mb-8 text-lg opacity-90 md:text-xl">
              Encuentra oportunidades, publica tus productos y gestiona tus ventas desde una
              plataforma pensada para crecer contigo.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                href={isAuthenticated ? '/seller/dashboard' : '/auth/register'}
                className="flex-1 sm:flex-none"
              >
                <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                  {isAuthenticated ? 'Ir a mi panel' : 'Publicar mi primer producto'}
                </Button>
              </Link>

              <Link href="/products" className="flex-1 sm:flex-none">
                <Button
                  size="lg"
                  className="w-full bg-white text-primary hover:bg-white/90 sm:w-auto"
                >
                  Explorar productos
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

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

      <section className="py-10 md:py-14">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold md:text-3xl">
                Explora productos publicados
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Revisa todos los productos disponibles en La Segunda.
              </p>
            </div>

            <Link href="/products">
              <Button>Ver todos los productos</Button>
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Comprar productos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-muted-foreground">
                  Encuentra artículos publicados por vendedores de La Segunda.
                </p>
                <Link href="/products">
                  <Button className="w-full">Explorar productos</Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Publicar producto</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-muted-foreground">
                  Vende artículos usados desde tu panel de publicaciones.
                </p>
                <Link href={isAuthenticated ? '/seller/dashboard' : '/auth/register'}>
                  <Button variant="outline" className="w-full">
                    Publicar ahora
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Mis favoritos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-muted-foreground">
                  Guarda productos con el corazón para revisarlos luego.
                </p>
                <Link href="/favorites">
                  <Button variant="outline" className="w-full">
                    Ver favoritos
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <footer className="border-t bg-card py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2026 La Segunda. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
}
