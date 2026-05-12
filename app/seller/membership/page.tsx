'use client';

import { Header } from '@/components/header';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockMemberships } from '@/lib/mock-data';
import { Check, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function MembershipPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  if (!isAuthenticated || !user?.isSeller) {
    router.push('/auth/login');
    return null;
  }

  const currentMembership = user.sellerBadge || 'standard';

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Planes de membresía</h1>
          <p className="text-xl text-muted-foreground">
            Elige el plan perfecto para tu negocio
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {mockMemberships.map((membership) => (
            <Card
              key={membership.id}
              className={`relative ${
                membership.type === 'premium'
                  ? 'ring-2 ring-primary md:scale-105'
                  : ''
              }`}
            >
              {membership.type === 'premium' && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary">Más popular</Badge>
                </div>
              )}

              <CardHeader>
                <CardTitle>{membership.name}</CardTitle>
                <CardDescription className="text-base mt-2">
                  <span className="text-2xl font-bold text-primary">
                    S/ {membership.price === 0 ? 'Gratis' : membership.price}
                  </span>
                  {membership.price > 0 && <span className="text-sm">/mes</span>}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Commission Rate */}
                <div className="pb-4 border-b">
                  <div className="text-sm text-muted-foreground mb-1">Comisión</div>
                  <div className="text-2xl font-bold text-primary">
                    {membership.commissionRate}%
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-3">
                  {membership.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Listing Limit */}
                <div className="text-xs text-muted-foreground bg-muted p-3 rounded">
                  Límite: {membership.monthlyListingLimit === 9999 ? 'Ilimitados' : membership.monthlyListingLimit} productos/mes
                </div>

                {/* CTA Button */}
                {currentMembership === membership.type ? (
                  <Button disabled className="w-full">
                    Plan actual
                  </Button>
                ) : membership.price === 0 ? (
                  <Button variant="outline" className="w-full">
                    Cambiar a gratis
                  </Button>
                ) : (
                  <Button className="w-full">
                    Actualizar ahora
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Comparison Table */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Comparación completa</h2>
          <div className="overflow-x-auto bg-card rounded-lg border">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="text-left p-4">Característica</th>
                  <th className="text-center p-4">Estándar</th>
                  <th className="text-center p-4">Premium</th>
                  <th className="text-center p-4">Elite</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-4">Precio mensual</td>
                  <td className="text-center p-4">Gratis</td>
                  <td className="text-center p-4">S/ 29.99</td>
                  <td className="text-center p-4">S/ 79.99</td>
                </tr>
                <tr className="border-b">
                  <td className="p-4">Comisión por venta</td>
                  <td className="text-center p-4">10%</td>
                  <td className="text-center p-4">6%</td>
                  <td className="text-center p-4">3%</td>
                </tr>
                <tr className="border-b">
                  <td className="p-4">Productos/mes</td>
                  <td className="text-center p-4">10</td>
                  <td className="text-center p-4">50</td>
                  <td className="text-center p-4">Ilimitados</td>
                </tr>
                <tr className="border-b">
                  <td className="p-4">Chat con compradores</td>
                  <td className="text-center p-4">
                    <Check className="w-4 h-4 mx-auto text-primary" />
                  </td>
                  <td className="text-center p-4">
                    <Check className="w-4 h-4 mx-auto text-primary" />
                  </td>
                  <td className="text-center p-4">
                    <Check className="w-4 h-4 mx-auto text-primary" />
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="p-4">Estadísticas detalladas</td>
                  <td className="text-center p-4">
                    <X className="w-4 h-4 mx-auto text-muted-foreground" />
                  </td>
                  <td className="text-center p-4">
                    <Check className="w-4 h-4 mx-auto text-primary" />
                  </td>
                  <td className="text-center p-4">
                    <Check className="w-4 h-4 mx-auto text-primary" />
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="p-4">Prioridad en búsqueda</td>
                  <td className="text-center p-4">
                    <X className="w-4 h-4 mx-auto text-muted-foreground" />
                  </td>
                  <td className="text-center p-4">
                    <X className="w-4 h-4 mx-auto text-muted-foreground" />
                  </td>
                  <td className="text-center p-4">
                    <Check className="w-4 h-4 mx-auto text-primary" />
                  </td>
                </tr>
                <tr>
                  <td className="p-4">Soporte dedicado</td>
                  <td className="text-center p-4">
                    <X className="w-4 h-4 mx-auto text-muted-foreground" />
                  </td>
                  <td className="text-center p-4">
                    <X className="w-4 h-4 mx-auto text-muted-foreground" />
                  </td>
                  <td className="text-center p-4">
                    <Check className="w-4 h-4 mx-auto text-primary" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
