'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Eye,
  Heart,
  Loader2,
  MapPin,
  PackagePlus,
  PackageSearch,
  Search,
  UserPlus,
} from 'lucide-react';

import { Header } from '@/components/header';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

type ProductRow = {
  id: string;
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
  view_count?: number | string | null;
  views_count?: number | string | null;

  favorite_count?: number | string | null;
  favorites_count?: number | string | null;
  favoriteCount?: number | string | null;

  created_at?: string | null;
  createdAt?: string | null;
};

const DEFAULT_PRODUCT_IMAGE = 'https://placehold.co/500x400?text=La+Segunda';

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

function getProductTitle(product: ProductRow) {
  return product.title || product.name || 'Producto sin nombre';
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

function getProductPrice(product: ProductRow) {
  return Number(product.price || 0);
}

function getProductViews(product: ProductRow) {
  return Number(product.views ?? product.views_count ?? product.view_count ?? 0);
}

function getProductFavorites(product: ProductRow) {
  return Number(
    product.favorite_count ??
      product.favorites_count ??
      product.favoriteCount ??
      0
  );
}

function getStatusLabel(status?: string | null) {
  const value = String(status || 'active').toLowerCase();

  if (value === 'active') return 'Activo';
  if (value === 'published') return 'Publicado';
  if (value === 'available') return 'Disponible';
  if (value === 'reserved') return 'Reservado';
  if (value === 'sold') return 'Vendido';
  if (value === 'pending') return 'Pendiente';
  if (value === 'inactive') return 'Inactivo';

  return value;
}

function isPublicProduct(product: ProductRow) {
  const status = String(product.status || 'active').toLowerCase();

  return (
    !status ||
    status === 'active' ||
    status === 'published' ||
    status === 'available' ||
    status === 'reserved'
  );
}

function sortProductsByDate(products: ProductRow[]) {
  return [...products].sort((a, b) => {
    const dateA = new Date(a.created_at || a.createdAt || 0).getTime();
    const dateB = new Date(b.created_at || b.createdAt || 0).getTime();

    return dateB - dateA;
  });
}

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const firstQuery = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (!firstQuery.error && Array.isArray(firstQuery.data)) {
          const publicProducts = firstQuery.data.filter(isPublicProduct);
          setProducts(publicProducts as ProductRow[]);
          return;
        }

        const fallbackQuery = await supabase.from('products').select('*');

        if (fallbackQuery.error) {
          throw fallbackQuery.error;
        }

        const rows = Array.isArray(fallbackQuery.data)
          ? (fallbackQuery.data as ProductRow[])
          : [];

        const publicProducts = rows.filter(isPublicProduct);
        setProducts(sortProductsByDate(publicProducts));
      } catch (error: any) {
        console.error('[La Segunda] Error cargando productos:', error?.message);
        setErrorMessage(
          error?.message || 'No se pudieron cargar los productos publicados.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    const query = searchText.trim().toLowerCase();

    if (!query) return products;

    return products.filter((product) => {
      const searchableText = [
        product.title,
        product.name,
        product.description,
        product.category,
        product.city,
        product.condition,
        product.status,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [products, searchText]);

  return (
    <div className="min-h-screen bg-[#F7F8FB]">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* CABECERA */}
        <section className="mb-8 rounded-3xl bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-6 text-white shadow-sm md:p-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-center">
            <div>
              <Badge className="mb-4 border-white/10 bg-white/10 text-white hover:bg-white/10">
                Marketplace libre
              </Badge>

              <h1 className="mb-3 text-3xl font-black tracking-tight md:text-5xl">
                Productos publicados
              </h1>

              <p className="max-w-2xl text-slate-200">
                Explora productos de otros usuarios y contacta directamente con
                el vendedor. Ahora puedes ver teléfono, correo y nombre desde el
                detalle de cada publicación.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link href="/seller/dashboard">
                  <Button className="bg-orange-600 hover:bg-orange-700">
                    <PackagePlus className="mr-2 h-4 w-4" />
                    Publicar producto
                  </Button>
                </Link>

                <Link href="/auth/register">
                  <Button
                    variant="outline"
                    className="border-white/20 bg-white/10 text-white hover:bg-white/20"
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Crear cuenta gratis
                  </Button>
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur">
              <p className="mb-2 text-sm text-slate-200">Modelo actual</p>
              <h2 className="mb-2 text-2xl font-bold">Contacto visible</h2>
              <p className="text-sm leading-relaxed text-slate-200">
                El objetivo inicial es hacer crecer la comunidad, facilitar las
                ventas y dar acceso libre al contacto entre compradores y
                vendedores.
              </p>
            </div>
          </div>
        </section>

        {/* BUSCADOR */}
        <section className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-950">
              Explorar publicaciones
            </h2>

            <p className="text-sm text-slate-500">
              {filteredProducts.length} producto
              {filteredProducts.length === 1 ? '' : 's'} disponible
              {filteredProducts.length === 1 ? '' : 's'}
            </p>
          </div>

          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Buscar por producto, ciudad o categoría..."
              className="w-full rounded-xl border bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-900 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </section>

        {/* ERROR */}
        {errorMessage && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        {/* CONTENIDO */}
        {isLoading ? (
          <div className="flex min-h-[40vh] items-center justify-center rounded-2xl border border-dashed bg-white">
            <div className="text-center">
              <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Cargando productos desde Supabase...
              </p>
            </div>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product) => {
              const status = String(product.status || 'active').toLowerCase();

              return (
                <Card
                  key={product.id}
                  className="group overflow-hidden rounded-2xl border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="relative h-52 overflow-hidden bg-slate-100">
                    <img
                      src={getProductImage(product)}
                      alt={getProductTitle(product)}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />

                    <Badge
                      className={
                        status === 'reserved'
                          ? 'absolute left-3 top-3 bg-amber-100 text-amber-800 hover:bg-amber-100'
                          : 'absolute left-3 top-3 bg-blue-900 text-white hover:bg-blue-900'
                      }
                    >
                      {getStatusLabel(status)}
                    </Badge>
                  </div>

                  <CardHeader className="pb-2">
                    <CardTitle className="line-clamp-1 text-lg">
                      {getProductTitle(product)}
                    </CardTitle>

                    <CardDescription className="line-clamp-2">
                      {product.description ||
                        'Producto publicado en La Segunda Market.'}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <p className="mb-3 text-2xl font-black text-blue-900">
                      S/{' '}
                      {getProductPrice(product).toLocaleString('es-PE', {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 2,
                      })}
                    </p>

                    <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {product.city || 'Perú'}
                      </span>

                      <span className="inline-flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {getProductViews(product)}
                      </span>

                      <span className="inline-flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                        {getProductFavorites(product)}
                      </span>
                    </div>

                    {product.category && (
                      <Badge variant="outline" className="mb-4 bg-white">
                        {product.category}
                      </Badge>
                    )}

                    <Link href={`/product/${product.id}`}>
                      <Button className="w-full">
                        Ver contacto del vendedor
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
            <CardContent className="p-10 text-center">
              <PackageSearch className="mx-auto mb-4 h-14 w-14 text-slate-400" />

              <h2 className="mb-2 text-2xl font-bold text-slate-950">
                No hay productos disponibles
              </h2>

              <p className="mx-auto mb-6 max-w-md text-slate-500">
                Aún no se han publicado productos o no encontramos resultados
                para tu búsqueda.
              </p>

              <div className="flex flex-col justify-center gap-3 sm:flex-row">
                <Link href="/seller/dashboard">
                  <Button>
                    <PackagePlus className="mr-2 h-4 w-4" />
                    Publicar producto
                  </Button>
                </Link>

                <Link href="/auth/register">
                  <Button variant="outline" className="bg-white">
                    Crear cuenta
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
