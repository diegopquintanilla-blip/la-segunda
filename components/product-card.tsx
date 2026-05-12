'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Heart, MapPin, Star, Eye, ImageIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export type Product = {
  id: string;
  title?: string;
  name?: string;
  description?: string;
  category?: string;
  condition?: string;
  price?: number;
  city?: string;
  images?: string[];
  image?: string;
  status?: string;
  views?: number;
  favoriteCount?: number;
  isFeatured?: boolean;
};

type ProductCardProps = {
  product: Product;
};

function getProductTitle(product: Product) {
  return product.title || product.name || 'Producto sin título';
}

function getProductImage(product: Product) {
  const firstImage = product.images?.[0] || product.image || '';

  if (!firstImage) return '';

  const image = String(firstImage).trim();

  const isValidImage =
    image.startsWith('http://') ||
    image.startsWith('https://') ||
    image.startsWith('/') ||
    image.startsWith('data:image');

  if (!isValidImage) return '';

  return image;
}

function getConditionLabel(condition?: string) {
  if (!condition) return 'Disponible';

  const value = condition.toLowerCase();

  if (value === 'new' || value === 'nuevo') return 'Nuevo';
  if (value === 'like new' || value === 'como nuevo') return 'Como nuevo';
  if (value === 'good' || value === 'bueno') return 'Bueno';
  if (value === 'fair' || value === 'regular') return 'Regular';

  return condition;
}

export function ProductCard({ product }: ProductCardProps) {
  const [imageError, setImageError] = useState(false);

  const title = getProductTitle(product);
  const imageUrl = getProductImage(product);
  const showImage = imageUrl && !imageError;

  const price = Number(product.price || 0);
  const views = Number(product.views || 0);

  return (
    <Link href={`/product/${product.id}`}>
      <article className="group overflow-hidden rounded-xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
          {showImage ? (
            <img
              src={imageUrl}
              alt={title}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400">
              <ImageIcon className="mb-3 h-12 w-12" />
              <p className="text-2xl font-bold tracking-tight">La Segunda</p>
              <p className="mt-1 text-xs">Imagen no disponible</p>
            </div>
          )}

          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            <Badge className="bg-primary text-primary-foreground">
              {getConditionLabel(product.condition)}
            </Badge>

            {product.isFeatured && (
              <Badge className="bg-amber-500 text-white">
                Destacado
              </Badge>
            )}
          </div>

          <button
            type="button"
            onClick={(event) => event.preventDefault()}
            className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-sm transition hover:bg-white"
          >
            <Heart className="h-5 w-5 text-slate-700" />
          </button>
        </div>

        <div className="p-4">
          <div className="mb-2 flex items-center justify-between gap-3">
            <Badge variant="outline">
              {product.category || 'Otros'}
            </Badge>

            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Eye className="h-3 w-3" />
              {views}
            </span>
          </div>

          <h3 className="line-clamp-2 min-h-[44px] text-base font-semibold">
            {title}
          </h3>

          <p className="mt-2 text-2xl font-bold text-primary">
            S/ {price.toLocaleString('es-PE')}
          </p>

          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {product.city || 'Perú'}
            </p>

            <p className="flex items-center gap-1 text-sm text-muted-foreground">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              {views} vistas
            </p>
          </div>

          <Button className="mt-4 w-full" size="sm">
            Ver producto
          </Button>
        </div>
      </article>
    </Link>
  );
}

export default ProductCard;
