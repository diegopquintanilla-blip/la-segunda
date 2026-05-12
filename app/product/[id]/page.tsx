'use client';

import { Header } from '@/components/header';
import { mockProducts, mockReviews } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Heart, Share2, MapPin, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const product = mockProducts.find((p) => p.id === params.id);
  const [mainImage, setMainImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const reviews = mockReviews.filter((r) => r.productId === params.id);

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Producto no encontrado</h1>
          <Button onClick={() => router.push('/products')}>Volver a productos</Button>
        </div>
      </div>
    );
  }

  const conditionLabel: Record<string, string> = {
    'like-new': 'Como nuevo',
    'excellent': 'Excelente',
    'good': 'Bueno',
    'fair': 'Regular',
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="mb-6"
        >
          ← Volver
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Images */}
          <div className="lg:col-span-2">
            <div className="bg-muted rounded-lg overflow-hidden mb-4 aspect-square">
              <img
                src={product.images[mainImage]}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex gap-2">
              {product.images.map((image, i) => (
                <button
                  key={i}
                  onClick={() => setMainImage(i)}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition ${
                    mainImage === i ? 'border-primary' : 'border-transparent'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.title} ${i}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="space-y-4">
            {/* Status */}
            {product.status === 'sold' && (
              <Badge variant="destructive" className="w-full justify-center py-2">
                Vendido
              </Badge>
            )}

            {/* Price */}
            <div>
              <div className="text-4xl font-bold text-primary">
                S/ {product.price.toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {product.category} • {conditionLabel[product.condition]}
              </p>
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold">{product.title}</h1>

            {/* Seller Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{product.sellerName}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{product.sellerRating}</span>
                  <span className="text-sm text-muted-foreground">
                    (basado en calificaciones)
                  </span>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" className="flex-1">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Mensaje
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Ver tienda
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="space-y-2">
              <Button className="w-full py-6" disabled={product.status === 'sold'}>
                Comprar ahora
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsFavorite(!isFavorite)}
                >
                  <Heart
                    className="w-4 h-4 mr-2"
                    fill={isFavorite ? '#ef4444' : 'none'}
                    stroke={isFavorite ? '#ef4444' : 'currentColor'}
                  />
                  {isFavorite ? 'Guardado' : 'Guardar'}
                </Button>
                <Button variant="outline" className="flex-1">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Info */}
            <Card className="bg-muted/30">
              <CardContent className="pt-6 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Publicado:</span>
                  <span className="font-medium">{product.createdAt}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ID del producto:</span>
                  <span className="font-medium">{product.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vistas:</span>
                  <span className="font-medium">{product.views}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Description */}
        <div className="mt-12 grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-4">Descripción</h2>
            <p className="text-foreground leading-relaxed whitespace-pre-wrap">
              {product.description}
            </p>

            {/* Reviews */}
            <div className="mt-12">
              <h2 className="text-2xl font-bold mb-6">Reseñas</h2>

              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <Card key={review.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-base">
                              {review.buyerName}
                            </CardTitle>
                            <CardDescription>
                              {review.createdAt}
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: review.rating }).map((_, i) => (
                              <Star
                                key={i}
                                className="w-4 h-4 fill-yellow-400 text-yellow-400"
                              />
                            ))}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">{review.comment}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No hay reseñas aún</p>
              )}
            </div>
          </div>

          {/* Safety Tips */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recomendaciones de seguridad</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <h4 className="font-semibold mb-1">✓ Antes de comprar:</h4>
                  <ul className="space-y-1 text-muted-foreground list-disc list-inside">
                    <li>Verifica el estado del producto</li>
                    <li>Comunícate con el vendedor</li>
                    <li>Acuerda un lugar seguro</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">✓ Durante la transacción:</h4>
                  <ul className="space-y-1 text-muted-foreground list-disc list-inside">
                    <li>Inspecciona en persona</li>
                    <li>Paga de manera segura</li>
                    <li>Evita adelantos</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Productos similares</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {mockProducts
              .filter(
                (p) =>
                  p.category === product.category &&
                  p.id !== product.id
              )
              .slice(0, 4)
              .map((p) => (
                <div
                  key={p.id}
                  onClick={() => router.push(`/product/${p.id}`)}
                  className="bg-card rounded-lg border overflow-hidden hover:shadow-lg transition cursor-pointer"
                >
                  <div className="aspect-square bg-muted overflow-hidden">
                    <img
                      src={p.images[0]}
                      alt={p.title}
                      className="w-full h-full object-cover hover:scale-105 transition"
                    />
                  </div>
                  <div className="p-3">
                    <p className="font-semibold text-sm line-clamp-2">
                      {p.title}
                    </p>
                    <p className="text-lg font-bold text-primary mt-1">
                      S/ {p.price.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
