'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Heart, MapPin, TrendingUp, PackageSearch } from 'lucide-react';
import { mockProducts } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type ProductItem = {
  id: string;
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
  isFeatured?: boolean;
  createdAt?: string;
  sellerId?: string;
};

export function ClientFeaturedProducts() {
  const [clientProducts, setClientProducts] = useState<ProductItem[]>([]);

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
    const normalizedMockProducts: ProductItem[] = mockProducts.map((product: any) => ({
      id: product.id,
      title: product.title,
      description: product.description,
      category: product.category,
      condition: product.condition,
      price: product.price,
      city: product.city,
      images: product.images,
      status: product.status,
      views: product.views,
      favoriteCount: product.favoriteCount,
      isFeatured: product.isFeatured,
      createdAt: product.createdAt,
      sellerId: product.sellerId,
    }));

    const activeClientProducts = clientProducts.filter((product) => {
      return product.status === 'active' || !product.status;
    });

    const mergedProducts = [...activeClientProducts, ...normalizedMockProducts];

    const uniqueProducts = new Map<string, ProductItem>();

    mergedProducts.forEach((product) => {
      if (product?.id) {
        uniqueProducts.set(product.id, product);
      }
    });

    return Array.from(uniqueProducts.values())
      .sort((a, b) => {
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;

        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;

        return dateB - dateA;
      })
      .slice(0, 4);
  }, [clientProducts]);

  return (
    <section className="border-t bg-slate-50 py-14">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-primary" />
              <h2 className="text-3xl font-bold">Productos destacados</h2>
            </div>

            <p className="text-muted-foreground">
              Artículos publicados por vendedores de La Segunda.
            </p>
          </div>

          <Link href="/products">
            <Button variant="outline">Ver todos</Button>
          </Link>
        </div>

        {featuredProducts.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product) => {
              const imageUrl =
                product.images?.[0] ||
                'https://placehold.co/800x600?text=La+Segunda';

              return (
                <Link key={product.id} href={`/product/${product.id}`}>
                  <div className="group overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                    <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                      <img
                        src={imageUrl}
                        alt={product.title}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />

                      <div className="absolute left-3 top-3 flex gap-2">
                        <Badge className="bg-primary text-primary-foreground">
                          {product.condition || 'Disponible'}
                        </Badge>

                        {product.isFeatured && (
                          <Badge className="bg-amber-500 text-white">
                            Destacado
                          </Badge>
                        )}
                      </div>

                      <button
                        type="button"
                        className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-sm transition hover:bg-white"
                        onClick={(event) => event.preventDefault()}
                      >
                        <Heart className="h-5 w-5 text-slate-700" />
                      </button>
                    </div>

                    <div className="p-4">
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <Badge variant="outline">
                          {product.category || 'Otros'}
                        </Badge>

                        <span className="text-xs text-muted-foreground">
                          {product.views || 0} vistas
                        </span>
                      </div>

                      <h3 className="line-clamp-2 min-h-[48px] text-base font-semibold">
                        {product.title}
                      </h3>

                      <p className="mt-2 text-2xl font-bold text-primary">
                        S/ {Number(product.price || 0).toLocaleString('es-PE')}
                      </p>

                      <div className="mt-3 flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {product.city || 'Perú'}
                      </div>

                      <Button className="mt-4 w-full" size="sm">
                        Ver producto
                      </Button>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed bg-white p-10 text-center">
            <PackageSearch className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />

            <h3 className="mb-2 text-xl font-bold">
              Aún no hay productos publicados
            </h3>

            <p className="mb-5 text-muted-foreground">
              Cuando los clientes publiquen artículos, aparecerán aquí automáticamente.
            </p>

            <Link href="/seller/dashboard">
              <Button>Publicar primer artículo</Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
