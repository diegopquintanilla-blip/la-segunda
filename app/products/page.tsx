'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Eye,
  Heart,
  Loader2,
  MapPin,
  PackagePlus,
  PackageSearch,
  Search,
  SlidersHorizontal,
  Sparkles,
  Tag,
} from 'lucide-react';

import { Header } from '@/components/header';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
} from '@/components/ui/card';

type ProductRow = {
  id: string;

  seller_id?: string | null;
  user_id?: string | null;
  owner_id?: string | null;

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

const DEFAULT_PRODUCT_IMAGE = 'https://placehold.co/700x520?text=La+Segunda';

const CATEGORY_FILTERS = [
  'Todos',
  'Celulares',
  'Tecnología',
  'Laptops',
  'Hogar',
  'Muebles',
  'Electrodomésticos',
  'Ropa',
  'Vehículos',
  'Otros',
];

const SORT_OPTIONS = [
  { value: 'recent', label: 'Más recientes' },
  { value: 'price-low', label: 'Menor precio' },
  { value: 'price-high', label: 'Mayor precio' },
];

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

  if (value === 'active') return 'Disponible';
  if (value === 'published') return 'Disponible';
  if (value === 'available') return 'Disponible';
  if (value === 'reserved') return 'Reservado';
  if (value === 'sold') return 'Vendido';
  if (value === 'pending') return 'Pendiente';

  return 'Disponible';
}

function getStatusClass(status?: string | null) {
  const value = String(status || 'active').toLowerCase();

  if (value === 'reserved') {
    return 'bg-amber-100 text-amber-800 hover:bg-amber-100';
  }

  if (value === 'sold') {
    return 'bg-slate-700 text-white hover:bg-slate-700';
  }

  return 'bg-blue-950 text-white hover:bg-blue-950';
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

function getProductDate(product: ProductRow) {
  return new Date(product.created_at || product.createdAt || 0).getTime();
}

function sortProducts(products: ProductRow[], sortValue: string) {
  const sorted = [...products];

  if (sortValue === 'price-low') {
    return sorted.sort((a, b) => getProductPrice(a) - getProductPrice(b));
  }

  if (sortValue === 'price-high') {
    return sorted.sort((a, b) => getProductPrice(b) - getProductPrice(a));
  }

  return sorted.sort((a, b) => getProductDate(b) - getProductDate(a));
}

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [sortValue, setSortValue] = useState('recent');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const orderedQuery = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (!orderedQuery.error && Array.isArray(orderedQuery.data)) {
          const publicProducts = orderedQuery.data.filter(isPublicProduct);
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

        setProducts(rows.filter(isPublicProduct));
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

    const filtered = products.filter((product) => {
      const category = String(product.category || '').toLowerCase();

      const matchCategory =
        selectedCategory === 'Todos' ||
        category.includes(selectedCategory.toLowerCase());

      const searchableText = [
        product.title,
        product.name,
        product.description,
        product.category,
        product.city,
        product.condition,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const matchSearch = !query || searchableText.includes(query);

      return matchCategory && matchSearch;
    });

    return sortProducts(filtered, sortValue);
  }, [products, searchText, selectedCategory, sortValue]);

  const featuredProducts = filteredProducts.slice(0, 3);

  return (
    <div className="min-h-screen bg-[#F7F8FB] text-slate-950">
      <Header />

      <main>
        {/* HERO */}
        <section className="relative overflow-hidden px-4 py-10 md:py-14">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-28 top-8 h-72 w-72 rounded-full bg-blue-100 blur-3xl" />
            <div className="absolute -right-28 bottom-0 h-80 w-80 rounded-full bg-orange-100 blur-3xl" />
          </div>

          <div className="relative mx-auto max-w-7xl">
            <div className="grid gap-8 rounded-[2rem] bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-6 text-white shadow-xl md:p-10 lg:grid-cols-[1fr_380px] lg:items-center">
              <div>
                <h1 className="max-w-3xl text-3xl font-black leading-tight tracking-tight md:text-5xl">
                  Encuentra productos con buen precio y contacta directo
                </h1>

                <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-200 md:text-lg">
                  Explora artículos publicados por usuarios reales, revisa los
                  detalles y conversa con el vendedor para coordinar la compra.
                </p>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <a href="#productos">
                    <Button
                      size="lg"
                      className="h-12 rounded-xl bg-orange-600 px-6 text-base hover:bg-orange-700"
                    >
                      <Search className="mr-2 h-5 w-5" />
                      Buscar productos
                    </Button>
                  </a>

                  <Link href="/seller/dashboard">
                    <Button
                      size="lg"
                      variant="outline"
                      className="h-12 rounded-xl border-white/20 bg-white/10 px-6 text-base text-white hover:bg-white/20"
                    >
                      <PackagePlus className="mr-2 h-5 w-5" />
                      Publicar producto
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-2xl bg-white/10 p-4">
                    <p className="text-2xl font-black">
                      {products.length}
                    </p>
                    <p className="mt-1 text-xs text-slate-300">Productos</p>
                  </div>

                  <div className="rounded-2xl bg-white/10 p-4">
                    <p className="text-2xl font-black">
                      {CATEGORY_FILTERS.length - 1}
                    </p>
                    <p className="mt-1 text-xs text-slate-300">Categorías</p>
                  </div>

                  <div className="rounded-2xl bg-white/10 p-4">
                    <p className="text-2xl font-black">24/7</p>
                    <p className="mt-1 text-xs text-slate-300">Disponible</p>
                  </div>
                </div>

                <p className="mt-4 text-sm leading-relaxed text-slate-200">
                  Publicaciones disponibles para revisar, comparar y contactar
                  directamente desde el detalle del producto.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* DESTACADOS */}
        {featuredProducts.length > 0 && (
          <section className="px-4 pb-4">
            <div className="mx-auto max-w-7xl">
              <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <div>
                  <h2 className="text-2xl font-black text-slate-950 md:text-3xl">
                    Publicaciones recientes
                  </h2>

                  <p className="text-sm text-slate-500">
                    Productos nuevos en la plataforma.
                  </p>
                </div>

                <Link href="/seller/dashboard">
                  <Button variant="outline" className="rounded-xl bg-white">
                    Publicar el mío
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>

              <div className="grid gap-5 md:grid-cols-3">
                {featuredProducts.map((product) => (
                  <Link key={product.id} href={`/product/${product.id}`}>
                    <Card className="group overflow-hidden rounded-3xl border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                      <div className="relative h-56 overflow-hidden bg-slate-100">
                        <img
                          src={getProductImage(product)}
                          alt={getProductTitle(product)}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        />

                        <Badge className={`absolute left-4 top-4 ${getStatusClass(product.status)}`}>
                          {getStatusLabel(product.status)}
                        </Badge>
                      </div>

                      <CardContent className="p-5">
                        <h3 className="line-clamp-1 text-lg font-black text-slate-950">
                          {getProductTitle(product)}
                        </h3>

                        <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                          {product.description ||
                            'Producto publicado en La Segunda Market.'}
                        </p>

                        <div className="mt-4 flex items-end justify-between gap-3">
                          <div>
                            <p className="text-2xl font-black text-blue-950">
                              S/{' '}
                              {getProductPrice(product).toLocaleString('es-PE', {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 2,
                              })}
                            </p>

                            <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                              <MapPin className="h-4 w-4" />
                              {product.city || 'Perú'}
                            </p>
                          </div>

                          <div className="rounded-full bg-orange-50 p-3 text-orange-700">
                            <ArrowRight className="h-5 w-5" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* LISTADO */}
        <section id="productos" className="px-4 py-10">
          <div className="mx-auto max-w-7xl">
            <div className="mb-6 rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5">
              <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                  <input
                    value={searchText}
                    onChange={(event) => setSearchText(event.target.value)}
                    placeholder="Buscar producto, ciudad, categoría o estado..."
                    className="h-13 w-full rounded-2xl border border-slate-200 bg-slate-50 py-4 pl-12 pr-4 text-sm outline-none transition focus:border-blue-950 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div className="relative">
                  <SlidersHorizontal className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                  <select
                    value={sortValue}
                    onChange={(event) => setSortValue(event.target.value)}
                    className="h-13 w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 py-4 pl-12 pr-4 text-sm outline-none transition focus:border-blue-950 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  >
                    {SORT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                {CATEGORY_FILTERS.map((category) => {
                  const isSelected = selectedCategory === category;

                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setSelectedCategory(category)}
                      className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition ${
                        isSelected
                          ? 'border-blue-950 bg-blue-950 text-white'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-950'
                      }`}
                    >
                      {category}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-950 md:text-3xl">
                  Todos los productos
                </h2>

                <p className="text-sm text-slate-500">
                  {filteredProducts.length} resultado
                  {filteredProducts.length === 1 ? '' : 's'} encontrado
                  {filteredProducts.length === 1 ? '' : 's'}
                </p>
              </div>

              <Link href="/seller/dashboard">
                <Button className="rounded-xl bg-blue-950 hover:bg-blue-900">
                  <PackagePlus className="mr-2 h-4 w-4" />
                  Vender un producto
                </Button>
              </Link>
            </div>

            {errorMessage && (
              <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {errorMessage}
              </div>
            )}

            {isLoading ? (
              <div className="flex min-h-[45vh] items-center justify-center rounded-[2rem] border border-dashed bg-white">
                <div className="text-center">
                  <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-blue-950" />
                  <p className="text-sm text-slate-500">
                    Cargando productos disponibles...
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
                      className="group overflow-hidden rounded-3xl border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                    >
                      <Link href={`/product/${product.id}`}>
                        <div className="relative h-56 overflow-hidden bg-slate-100">
                          <img
                            src={getProductImage(product)}
                            alt={getProductTitle(product)}
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                          />

                          <Badge className={`absolute left-4 top-4 ${getStatusClass(status)}`}>
                            {getStatusLabel(status)}
                          </Badge>

                          {product.category && (
                            <div className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur">
                              {product.category}
                            </div>
                          )}
                        </div>
                      </Link>

                      <CardContent className="p-5">
                        <Link href={`/product/${product.id}`}>
                          <h3 className="line-clamp-1 text-lg font-black text-slate-950 transition group-hover:text-blue-950">
                            {getProductTitle(product)}
                          </h3>
                        </Link>

                        <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-relaxed text-slate-500">
                          {product.description ||
                            'Producto publicado en La Segunda Market.'}
                        </p>

                        <div className="mt-4">
                          <p className="text-2xl font-black text-blue-950">
                            S/{' '}
                            {getProductPrice(product).toLocaleString('es-PE', {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 2,
                            })}
                          </p>

                          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-500">
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
                        </div>

                        <div className="mt-5 grid grid-cols-[1fr_auto] gap-2">
                          <Link href={`/product/${product.id}`}>
                            <Button className="w-full rounded-xl bg-blue-950 hover:bg-blue-900">
                              Ver producto
                            </Button>
                          </Link>

                          <Link href={`/product/${product.id}`}>
                            <Button
                              variant="outline"
                              className="rounded-xl bg-white px-3"
                            >
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="rounded-[2rem] border-slate-200 bg-white shadow-sm">
                <CardContent className="p-10 text-center">
                  <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-500">
                    <PackageSearch className="h-8 w-8" />
                  </div>

                  <h2 className="mb-2 text-2xl font-black text-slate-950">
                    No encontramos productos
                  </h2>

                  <p className="mx-auto mb-6 max-w-md text-slate-500">
                    Prueba con otra búsqueda, cambia de categoría o publica tu
                    primer producto para empezar a vender.
                  </p>

                  <div className="flex flex-col justify-center gap-3 sm:flex-row">
                    <Button
                      variant="outline"
                      className="rounded-xl bg-white"
                      onClick={() => {
                        setSearchText('');
                        setSelectedCategory('Todos');
                        setSortValue('recent');
                      }}
                    >
                      Limpiar filtros
                    </Button>

                    <Link href="/seller/dashboard">
                      <Button className="rounded-xl bg-blue-950 hover:bg-blue-900">
                        <PackagePlus className="mr-2 h-4 w-4" />
                        Publicar producto
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 pb-14">
          <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-950 via-slate-950 to-blue-900 p-8 text-white shadow-xl md:p-10">
            <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <div className="mb-3 flex items-center gap-2 text-orange-300">
                  <Sparkles className="h-5 w-5" />
                  <span className="text-sm font-semibold">
                    Convierte lo que ya no usas en una oportunidad
                  </span>
                </div>

                <h2 className="text-3xl font-black md:text-4xl">
                  Publica tu producto en minutos
                </h2>

                <p className="mt-3 max-w-2xl text-slate-300">
                  Sube fotos, agrega precio, describe el estado del artículo y
                  permite que compradores interesados te contacten directamente.
                </p>
              </div>

              <Link href="/seller/dashboard">
                <Button className="rounded-xl bg-orange-600 hover:bg-orange-700">
                  <Tag className="mr-2 h-4 w-4" />
                  Empezar a vender
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
