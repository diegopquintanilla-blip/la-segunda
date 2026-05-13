'use client';

import { useEffect, useMemo, useState } from 'react';
import { Filter, Search, SlidersHorizontal, PackageSearch } from 'lucide-react';
import { Header } from '@/components/header';
import { ProductCard, type Product } from '@/components/product-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const PRODUCTS_KEY = 'la-segunda-products';

type SortOption = 'recent' | 'price-low' | 'price-high' | 'views';

const categories = [
  'Todas',
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

function normalizeProduct(product: any): Product {
  const images =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : product.image
        ? [product.image]
        : [];

  return {
    id: String(product.id),
    title: product.title || product.name || 'Producto sin título',
    name: product.name || product.title || 'Producto sin título',
    description: product.description || '',
    category: product.category || 'Otros',
    condition: product.condition || 'Disponible',
    price: Number(product.price || 0),
    city: product.city || 'Perú',
    images,
    image: product.image || images[0] || '',
    status: product.status || 'active',
    views: Number(product.views || 0),
    favoriteCount: Number(product.favoriteCount || 0),
    isFeatured: Boolean(product.isFeatured),
  };
}

function getStoredProducts(): Product[] {
  if (typeof window === 'undefined') return [];

  try {
    const rawProducts = localStorage.getItem(PRODUCTS_KEY);

    if (!rawProducts) return [];

    const parsedProducts = JSON.parse(rawProducts);

    if (!Array.isArray(parsedProducts)) return [];

    const normalizedProducts = parsedProducts.map(normalizeProduct);

    const uniqueProducts = new Map<string, Product>();

    normalizedProducts.forEach((product) => {
      const isValidProduct =
        product.id &&
        (product.title || product.name) &&
        Number(product.price || 0) > 0;

      const isVisibleProduct =
        product.status === 'active' ||
        product.status === 'Activo' ||
        !product.status;

      if (isValidProduct && isVisibleProduct) {
        uniqueProducts.set(String(product.id), {
          ...product,
          status: 'active',
        });
      }
    });

    return Array.from(uniqueProducts.values());
  } catch {
    return [];
  }
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [sortOption, setSortOption] = useState<SortOption>('recent');

  useEffect(() => {
    setProducts(getStoredProducts());
  }, []);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (searchTerm.trim()) {
      const cleanSearch = searchTerm.trim().toLowerCase();

      result = result.filter((product) => {
        const title = String(product.title || product.name || '').toLowerCase();
        const description = String(product.description || '').toLowerCase();
        const category = String(product.category || '').toLowerCase();
        const city = String(product.city || '').toLowerCase();

        return (
          title.includes(cleanSearch) ||
          description.includes(cleanSearch) ||
          category.includes(cleanSearch) ||
          city.includes(cleanSearch)
        );
      });
    }

    if (selectedCategory !== 'Todas') {
      result = result.filter((product) => {
        return String(product.category || '').toLowerCase() === selectedCategory.toLowerCase();
      });
    }

    if (sortOption === 'price-low') {
      result.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    }

    if (sortOption === 'price-high') {
      result.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    }

    if (sortOption === 'views') {
      result.sort((a, b) => Number(b.views || 0) - Number(a.views || 0));
    }

    if (sortOption === 'recent') {
      result = result.reverse();
    }

    return result;
  }, [products, searchTerm, selectedCategory, sortOption]);

  const totalVisibleProducts = filteredProducts.length;
  const totalFeaturedProducts = filteredProducts.filter((product) => product.isFeatured).length;

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8">
        <section className="mb-8 rounded-2xl border bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/10">
                Marketplace
              </Badge>

              <h1 className="text-4xl font-bold text-slate-950">
                Productos
              </h1>

              <p className="mt-3 text-slate-600">
                Explora productos publicados por vendedores de La Segunda.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-slate-50 px-6 py-4 text-center">
                <p className="text-xs text-slate-500">Total</p>
                <p className="text-2xl font-bold text-slate-950">
                  {totalVisibleProducts}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 px-6 py-4 text-center">
                <p className="text-xs text-slate-500">Destacados</p>
                <p className="text-2xl font-bold text-amber-600">
                  {totalFeaturedProducts}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 px-6 py-4 text-center">
                <p className="text-xs text-slate-500">Mostrando</p>
                <p className="text-2xl font-bold text-primary">
                  {totalVisibleProducts}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="h-fit rounded-2xl border bg-white p-5 shadow-sm">
            <div className="mb-6 flex items-center gap-2">
              <Filter className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold">Filtros</h2>
            </div>

            <div className="mb-8 space-y-3">
              <label className="text-sm font-medium">Buscar producto</label>

              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />

                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Ejemplo: laptop, celular..."
                  className="h-10 w-full rounded-lg border bg-white px-3 pl-9 text-sm outline-none transition focus:border-primary"
                />
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-bold">Categoría</h3>

              <div className="space-y-1">
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setSelectedCategory(category)}
                    className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                      selectedCategory === category
                        ? 'bg-primary text-primary-foreground'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <section>
            <div className="mb-6 rounded-2xl border bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold">
                    Mostrando {totalVisibleProducts} productos
                  </h2>

                  <p className="text-sm text-slate-600">
                    Solo se muestran productos activos publicados por usuarios.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <SlidersHorizontal className="h-4 w-4 text-primary" />

                  <select
                    value={sortOption}
                    onChange={(event) =>
                      setSortOption(event.target.value as SortOption)
                    }
                    className="h-10 rounded-lg border bg-white px-3 text-sm outline-none transition focus:border-primary"
                  >
                    <option value="recent">Más recientes</option>
                    <option value="price-low">Menor precio</option>
                    <option value="price-high">Mayor precio</option>
                    <option value="views">Más vistos</option>
                  </select>
                </div>
              </div>
            </div>

            {filteredProducts.length > 0 ? (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed bg-white p-12 text-center shadow-sm">
                <PackageSearch className="mx-auto mb-4 h-16 w-16 text-slate-400" />

                <h3 className="text-2xl font-bold text-slate-950">
                  No hay productos publicados
                </h3>

                <p className="mx-auto mt-3 max-w-md text-slate-600">
                  Todavía no hay productos activos para mostrar. Publica el primer
                  artículo desde tu panel de vendedor.
                </p>

                <div className="mt-6">
                  <Button asChild>
                    <a href="/seller/dashboard">Publicar producto</a>
                  </Button>
                </div>
              </div>
            )}
          </section>
        </section>
      </main>
    </div>
  );
}
