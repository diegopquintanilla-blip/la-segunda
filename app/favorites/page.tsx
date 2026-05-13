'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Heart,
  Loader2,
  PackageSearch,
  RefreshCw,
} from 'lucide-react';
import { Header } from '@/components/header';
import { ProductCard, type Product } from '@/components/product-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth-context';
import { listFavoriteProducts } from '@/lib/supabase/favorites';
import { useRouter } from 'next/navigation';

export default function FavoritesPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const loadFavorites = async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const products = await listFavoriteProducts();
      setFavoriteProducts(products as Product[]);
    } catch (error: any) {
      setErrorMessage(
        error?.message || 'No se pudieron cargar tus favoritos.'
      );
      setFavoriteProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    loadFavorites();
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8">
        <section className="mb-8 rounded-2xl border bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Badge className="mb-4 bg-red-50 text-red-600 hover:bg-red-50">
                Favoritos
              </Badge>

              <h1 className="flex items-center gap-3 text-4xl font-bold text-slate-950">
                <Heart className="h-8 w-8 fill-red-500 text-red-500" />
                Mis favoritos
              </h1>

              <p className="mt-3 text-slate-600">
                Productos que guardaste para revisar o comprar después.
              </p>
            </div>

            <Button variant="outline" onClick={loadFavorites}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Actualizar
            </Button>
          </div>
        </section>

        {errorMessage && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        {isLoading ? (
          <div className="rounded-2xl border bg-white p-12 text-center shadow-sm">
            <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-primary" />
            <h2 className="text-xl font-bold">Cargando favoritos...</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Obteniendo productos guardados desde Supabase.
            </p>
          </div>
        ) : favoriteProducts.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {favoriteProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed bg-white p-12 text-center shadow-sm">
            <PackageSearch className="mx-auto mb-4 h-16 w-16 text-slate-400" />

            <h2 className="text-2xl font-bold text-slate-950">
              Aún no tienes favoritos
            </h2>

            <p className="mx-auto mt-3 max-w-md text-slate-600">
              Presiona el corazón en cualquier producto para guardarlo aquí.
            </p>

            <div className="mt-6">
              <Link href="/products">
                <Button>Explorar productos</Button>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
