'use client';

import { Header } from '@/components/header';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { mockProducts, mockReviews, mockUsers } from '@/lib/mock-data';
import { Star, MapPin, Calendar, Shield, Edit2, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getGenderLabel, getAccountTypeLabel } from '@/lib/avatar-utils';

export default function ProfilePage() {
  const { user, isAuthenticated, updateUser } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState(user?.bio || '');
  const [city, setCity] = useState(user?.city || '');

  if (!isAuthenticated || !user) {
    router.push('/auth/login');
    return null;
  }

  const userReviews = mockReviews.filter((r) => r.buyerId === user.id);
  const userProducts = mockProducts.filter((p) => p.sellerId === user.id);
  const receivedReviews = mockReviews.filter((r) => {
    const product = mockProducts.find((p) => p.id === r.productId);
    return product?.sellerId === user.id;
  });

  const handleProfileUpdate = () => {
    updateUser({ bio, city });
    setIsEditing(false);
  };

  const badgeColors: Record<string, string> = {
    standard: 'bg-blue-100 text-blue-800',
    premium: 'bg-purple-100 text-purple-800',
    elite: 'bg-amber-100 text-amber-800',
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-2">
            <Card>
              <CardContent className="pt-6">
                {!isEditing ? (
                  <div className="flex items-start gap-6">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-24 h-24 rounded-full border-4 border-primary/10"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-2xl font-bold">{user.name}</h1>
                        {user.verificationStatus === 'verified' && (
                          <Badge className="bg-green-100 text-green-800 gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Verificado
                          </Badge>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {user.city && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {user.city}
                          </Badge>
                        )}
                        {user.accountType && (
                          <Badge variant="outline">
                            {getAccountTypeLabel(user.accountType)}
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold">{user.rating}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          ({user.reviewCount} calificaciones)
                        </span>
                      </div>

                      {user.isSeller && user.sellerBadge && (
                        <Badge className={badgeColors[user.sellerBadge]}>
                          {user.sellerBadge === 'standard'
                            ? 'Vendedor Estándar'
                            : user.sellerBadge === 'premium'
                              ? 'Vendedor Premium'
                              : 'Vendedor Elite'}
                        </Badge>
                      )}

                      <p className="text-sm text-muted-foreground mt-3 flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Miembro desde {new Date(user.joinDate).toLocaleDateString('es-PE', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Ciudad</label>
                      <Input
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Tu ciudad"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleProfileUpdate}>Guardar cambios</Button>
                      <Button variant="outline" onClick={() => setIsEditing(false)}>Cancelar</Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Stats Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Estadísticas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-2xl font-bold">{userProducts.length}</div>
                <p className="text-sm text-muted-foreground">Productos activos</p>
              </div>
              <div>
                <div className="text-2xl font-bold">{receivedReviews.length}</div>
                <p className="text-sm text-muted-foreground">Reseñas recibidas</p>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {userProducts.reduce((sum, p) => sum + p.views, 0)}
                </div>
                <p className="text-sm text-muted-foreground">Vistas totales</p>
              </div>
              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={() => setIsEditing(!isEditing)}
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Editar perfil
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Bio Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Sobre mí</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {user.bio || 'Sin información de perfil'}
            </p>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="space-y-6">
          {/* Products Section */}
          {user.isSeller && (
            <>
              <div>
                <h2 className="text-2xl font-bold mb-4">Mis productos</h2>
                {userProducts.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {userProducts.map((product) => (
                      <Link key={product.id} href={`/product/${product.id}`}>
                        <div className="bg-card rounded-lg border overflow-hidden hover:shadow-lg transition">
                          <div className="aspect-square bg-muted overflow-hidden">
                            <img
                              src={product.images[0]}
                              alt={product.title}
                              className="w-full h-full object-cover hover:scale-105 transition"
                            />
                          </div>
                          <div className="p-3">
                            <p className="font-semibold text-sm line-clamp-2">
                              {product.title}
                            </p>
                            <p className="text-lg font-bold text-primary mt-1">
                              S/ {product.price.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <Card className="p-8 text-center">
                    <p className="text-muted-foreground mb-4">
                      No has publicado productos aún
                    </p>
                    <Link href="/seller/dashboard">
                      <Button>Ir a mi tienda</Button>
                    </Link>
                  </Card>
                )}
              </div>
            </>
          )}

          {/* Reviews Section */}
          <div>
            <h2 className="text-2xl font-bold mb-4">
              {user.isSeller ? 'Reseñas recibidas' : 'Mis reseñas'}
            </h2>

            {receivedReviews.length > 0 || userReviews.length > 0 ? (
              <div className="space-y-4">
                {(user.isSeller ? receivedReviews : userReviews).map((review) => {
                  const reviewerName = mockUsers.find(
                    (u) => u.id === review.buyerId
                  )?.name;
                  return (
                    <Card key={review.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-base">
                              {reviewerName}
                            </CardTitle>
                            <CardDescription>{review.createdAt}</CardDescription>
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
                  );
                })}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">
                  {user.isSeller
                    ? 'No tienes reseñas aún'
                    : 'No has dejado reseñas aún'}
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
