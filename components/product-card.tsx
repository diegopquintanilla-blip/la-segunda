'use client';

import Link from 'next/link';
import { Heart, Star, MapPin } from 'lucide-react';
import { Product } from '@/lib/mock-data';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  const conditionLabel: Record<string, string> = {
    'like-new': 'Como nuevo',
    'excellent': 'Excelente',
    'good': 'Bueno',
    'fair': 'Regular',
  };

  return (
    <Link href={`/product/${product.id}`}>
      <div className="bg-card rounded-lg border overflow-hidden hover:shadow-lg transition-all duration-300 group">
        {/* Image Container */}
        <div className="relative overflow-hidden bg-muted aspect-square">
          <img
            src={product.images[0]}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Condition Badge */}
          <Badge className="absolute top-2 left-2 bg-primary">
            {conditionLabel[product.condition]}
          </Badge>

          {/* Favorite Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              setIsFavorite(!isFavorite);
            }}
            className="absolute top-2 right-2 p-2 bg-white/90 rounded-full hover:bg-white transition"
          >
            <Heart
              className="w-5 h-5"
              fill={isFavorite ? '#ef4444' : 'none'}
              stroke={isFavorite ? '#ef4444' : '#6b7280'}
            />
          </button>

          {/* Status Badge */}
          {product.status === 'sold' && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-bold text-lg">Vendido</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-3 space-y-2">
          <h3 className="font-semibold text-sm line-clamp-2">{product.title}</h3>

          {/* Price */}
          <div className="text-lg font-bold text-primary">
            S/ {product.price.toLocaleString()}
          </div>

          {/* Seller Info */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{product.sellerRating}</span>
              <span className="text-muted-foreground">({product.views} vistas)</span>
            </div>
          </div>

          <p className="text-xs text-muted-foreground truncate">
            {product.sellerName}
          </p>
        </div>
      </div>
    </Link>
  );
}
