'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, MapPin, Star, Eye, ImageIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';

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

type FavoriteItem = {
  userId: string;
  productId: string;
  createdAt: string;
  status: 'favorite';
};

const FAVORITES_KEY = 'la-segunda-favorites';
const PRODUCTS_KEY = 'la-segunda-products';

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

function getStoredFavorites(): FavoriteItem[] {
  if (typeof window === 'undefined') return [];

  try {
    const rawFavorites = localStorage.getItem(FAVORITES_KEY);

    if (!rawFavorites) return [];

    const parsedFavorites = JSON.parse(rawFavorites);

    if (!Array.isArray(parsedFavorites)) return [];

    return parsedFavorites;
  } catch {
    return [];
  }
}

function saveStoredFavorites(favorites: FavoriteItem[]) {
  if (typeof window === 'undefined') return;

  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

function updateLocalProductFavoriteCount(productId: string, increment: number) {
  if (typeof window === 'undefined') return;

  try {
    const rawProducts = localStorage.getItem(PRODUCTS_KEY);

    if (!rawProducts) return;

    const products = JSON.parse(rawProducts);

    if (!Array.isArray(products)) return;

    const updatedProducts = products.map((product: any) => {
      if (String(product.id) !== String(productId)) return product;

      const currentFavoriteCount = Number(product.favoriteCount || 0);
      const newFavoriteCount = Math.max(currentFavoriteCount + increment, 0);

      return {
        ...product,
        favoriteCount: newFavoriteCount,
      };
    });

    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(updatedProducts));
  } catch {
    console.log('[La Segunda] No se pudo actualizar favoriteCount.');
  }
}

export function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const [imageError, setImageError] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(
    Number(product.favoriteCount || 0)
  );

  const title = getProductTitle(product);
  const imageUrl = getProductImage(product);
  const showImage = imageUrl && !imageError;

  const price = Number(product.price || 0);
  const views = Number(product.views || 0);

  useEffect(() => {
    if (!user?.id) {
      setIsFavorite(false);
      setFavoriteCount(Number(product.favoriteCount || 0));
      return;
    }

    const favorites = getStoredFavorites();

    const foundFavorite = favorites.some((favorite) => {
      return (
        favorite.userId === user.id &&
        String(favorite.productId) === String(product.id)
      );
    });

    setIsFavorite(foundFavorite);
    setFavoriteCount(Number(product.favoriteCount || 0));
  }, [product.id, product.favoriteCount, user?.id]);

  const handleToggleFavorite = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (!isAuthenticated || !user?.id) {
      router.push('/auth/login');
      return;
    }

    const favorites = getStoredFavorites();

    const alreadyFavorite = favorites.some((favorite) => {
      return (
        favorite.userId === user.id &&
        String(favorite.productId) === String(product.id)
      );
    });

    if (alreadyFavorite) {
      const updatedFavorites = favorites.filter((favorite) => {
        return !(
          favorite.userId === user.id &&
          String(favorite.productId) === String(product.id)
        );
      });

      saveStoredFavorites(updatedFavorites);
      updateLocalProductFavoriteCount(product.id, -1);

      setIsFavorite(false);
      setFavoriteCount((current) => Math.max(current - 1, 0));

      return;
    }

    const newFavorite: FavoriteItem = {
      userId: user.id,
      productId: product.id,
      createdAt: new Date().toISOString(),
      status: 'favorite',
    };

    saveStoredFavorites([...favorites, newFavorite]);
    updateLocalProductFavoriteCount(product.id, 1);

    setIsFavorite(true);
    setFavoriteCount((current) => current + 1);
  };

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
            onClick={handleToggleFavorite}
            aria-label={
              isFavorite
                ? 'Quitar producto de favoritos'
                : 'Agregar producto a favoritos'
            }
            title={
              isFavorite
                ? 'Quitar de favoritos'
                : 'Guardar producto en favoritos'
            }
            className={`absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full shadow-sm transition ${
              isFavorite
                ? 'bg-red-50 text-red-600 hover:bg-red-100'
                : 'bg-white/90 text-slate-700 hover:bg-white'
            }`}
          >
            <Heart
              className={`h-5 w-5 ${
                isFavorite ? 'fill-red-500 text-red-500' : ''
              }`}
            />
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
              {favoriteCount} favoritos
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
