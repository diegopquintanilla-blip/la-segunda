'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/header';
import { ProductCard, type Product } from '@/components/product-card';
import { mockProducts } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Filter,
  PackageSearch,
  Search,
  SlidersHorizontal,
  Star,
} from 'lucide-react';

type SortOption = 'newest' | 'price-low' | 'price-high' | 'views';

type ProductWithDate = Product & {
  createdAt?: string;
  sellerRating?: number;
};

const categories = [
  'Electrónica',
  'Celulares',
  'Laptops',
  'Muebles',
  'Ropa',
  'Deportes',
  'Música',
  'Libros',
  'Hogar',
  'Vehículos',
  'Otros',
];

const conditions = [
  'Nuevo',
  'Como nuevo',
  'Bueno',
  'Regular',
];

function normalizeText(value?: string) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function normalizeProduct(product: any): ProductWithDate {
  return {
    id: String(product.id),
    title: product.title || product.name || 'Producto publicado',
    name: product.name || product.title || 'Producto publicado',
    description: product.description || '',
    category: product.category || 'Otros',
    condition: product.condition || 'Disponible',
    price: Number(product.price || 0),
    city: product.city || 'Perú',
    images:
      product.images && product.images.length > 0
        ? product.images
        : product.image
          ? [product.image]
          : [],
    image: product.image || product.images?.[0] || '',
    status: product.status || 'active',
    views: Number(product.views || 0),
    favoriteCount: Number(product.favoriteCount || 0),
    isFeatured: Boolean(product.isFeatured),
    createdAt: product.createdAt || new Date().toISOString(),
    sellerRating: Number(product.sellerRating || 0),
  };
}

export default function ProductsPage() {
  const [clientProducts, setClientProducts] = useState<ProductWithDate[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedCondition, setSelectedCondition] = useState<string | null>(null);
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [maxPrice, setMaxPrice] = useState(10000);

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
        setClientProducts(parsedProducts.map(normalizeProduct));
      }
    } catch {
      setClientProducts([]);
    }
  }, []);

  const allProducts = useMemo(() => {
    const normalizedMockProducts = mockProducts.map(normalizeProduct);

    const activeClientProducts = clientProducts.filter((product) => {
      return product.status === 'active' || !product.status;
    });

    const mergedProducts = [
      ...activeClientProducts.map((product) => ({
        ...product,
        isFeatured: product.isFeatured ?? true,
      })),
      ...normalizedMockProducts,
    ];

    const uniqueProducts = new Map<string, ProductWithDate>();

    mergedProducts.forEach((product) => {
      if (product.id) {
        uniqueProducts.set(product.id, product);
      }
    });

    return Array.from(uniqueProducts.values());
  }, [clientProducts]);

  const filteredProducts = useMemo(() => {
    return allProducts.filter((product) => {
      const productTitle = normalizeText(product.title || product.name);
      const productDescription = normalizeText(product.description);
      const productCategory = normalizeText(product.category);
      const productCondition = normalizeText(product.condition);
      const productPrice = Number(product.price || 0);

      const search = normalizeText(searchTerm);
      const category = normalizeText(selectedCategory || '');
      const condition = normalizeText(selectedCondition || '');

      if (search) {
        const matchesSearch =
          productTitle.includes(search) ||
          productDescription.includes(search) ||
          productCategory.includes(search);

        if (!matchesSearch) return false;
      }

      if (selectedCategory && productCategory !== category) {
        return false;
      }

      if (selectedCondition && productCondition !== condition) {
        return false;
      }

      if (productPrice > maxPrice) {
        return false;
      }

      if (showFeaturedOnly && !product.isFeatured) {
        return false;
      }

      return true;
    });
  }, [
    allProducts,
    searchTerm,
    selectedCategory,
    selectedCondition,
    maxPrice,
    showFeaturedOnly,
  ]);

  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      if (sortBy === 'price-low') {
        return Number(a.price || 0) - Number(b.price || 0);
      }

      if (sortBy === 'price-high') {
        return Number(b.price || 0) - Number(a.price || 0);
      }

      if (sortBy === 'views') {
        return Number(b.views || 0) - Number(a.views || 0);
      }

      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;

      return dateB - dateA;
    });
  }, [filteredProducts, sortBy]);

  const featuredCount = allProducts.filter((product) => product.isFeatured).length;

  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedCondition(null);
    setShowFeaturedOnly(false);
    setSearchTerm('');
    setMaxPrice(10000);
    setSortBy('newest');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6">
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al inicio
            </Button>
          </Link>
        </div>

        <section className="mb-8 rounded-2xl border bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <Badge className="mb-3 bg-primary/10 text-primary">
                Marketplace
              </Badge>

              <h1 className="text-3xl font-bold text-slate-950 md:text-4xl">
                Productos
              </h1>

              <p className="mt-2 max-w-2xl text-slate-600">
                Explora productos publicados por vendedores de La Segunda.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-slate-50 p-4 text-center">
                <p className="text-xs text-slate-500">Total</p>
                <p className="text-2xl font-bold">{allProducts.length}</p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4 text-center">
                <p className="text-xs text-slate-500">Destacados</p>
                <p className="text-2xl font-bold text-amber-600">
                  {featuredCount}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4 text-center">
                <p className="text-xs text-slate-500">Mostrando</p>
                <p className="text-2xl font-bold text-primary">
                  {sortedProducts.length}
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-4">
          <aside className="lg:col-span-1">
            <Card className="sticky top-24 space-y-6 rounded-2xl border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-primary" />
                <h2 className="font-bold">Filtros</h2>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Buscar producto</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Ejemplo: laptop, celular..."
                    className="w-full rounded-md border bg-background px-3 py-2 pl-9 text-sm"
                  />
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-sm font-semibold">Categoría</h3>

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setSelectedCategory(null)}
                    className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                      selectedCategory === null
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-slate-100'
                    }`}
                  >
                    Todas
                  </button>

                  {categories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setSelectedCategory(category)}
                      className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                        selectedCategory === category
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-slate-100'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-sm font-semibold">Condición</h3>

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setSelectedCondition(null)}
                    className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                      selectedCondition === null
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-slate-100'
                    }`}
                  >
                    Todas
                  </button>

                  {conditions.map((condition) => (
                    <button
                      key={condition}
                      type="button"
                      onClick={() => setSelectedCondition(condition)}
                      className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                        selectedCondition === condition
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-slate-100'
                      }`}
                    >
                      {condition}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-sm font-semibold">Precio máximo</h3>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-slate-600">
                    <span>S/ 0</span>
                    <span>S/ {maxPrice.toLocaleString('es-PE')}</span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="10000"
                    step="100"
                    value={maxPrice}
                    onChange={(event) => setMaxPrice(Number(event.target.value))}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-amber-100 bg-amber-50 p-3">
                <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-amber-800">
                  <input
                    type="checkbox"
                    checked={showFeaturedOnly}
                    onChange={(event) =>
                      setShowFeaturedOnly(event.target.checked)
                    }
                  />
                  Ver solo destacados
                </label>
              </div>

              <Button variant="outline" className="w-full" onClick={clearFilters}>
                Limpiar filtros
              </Button>
            </Card>
          </aside>

          <section className="lg:col-span-3">
            <div className="mb-6 flex flex-col gap-4 rounded-2xl border bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold">
                  Mostrando {sortedProducts.length} productos
                </p>
                <p className="text-sm text-slate-500">
                  Incluye productos publicados por clientes y productos base.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-slate-500" />

                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value as SortOption)}
                  className="rounded-lg border bg-background px-3 py-2 text-sm"
                >
                  <option value="newest">Más recientes</option>
                  <option value="price-low">Precio: menor a mayor</option>
                  <option value="price-high">Precio: mayor a menor</option>
                  <option value="views">Más vistos</option>
                </select>
              </div>
            </div>

            {sortedProducts.length > 0 ? (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {sortedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed bg-white p-12 text-center">
                <PackageSearch className="mx-auto mb-4 h-14 w-14 text-slate-400" />

                <h2 className="mb-2 text-2xl font-bold">
                  No se encontraron productos
                </h2>

                <p className="mb-6 text-slate-600">
                  Cambia los filtros o publica un producto nuevo.
                </p>

                <div className="flex flex-col justify-center gap-3 sm:flex-row">
                  <Button onClick={clearFilters} variant="outline">
                    Limpiar filtros
                  </Button>

                  <Link href="/seller/dashboard">
                    <Button>Publicar producto</Button>
                  </Link>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
