'use client';

import { Header } from '@/components/header';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Check,
  CreditCard,
  Crown,
  Loader2,
  Lock,
  PackagePlus,
  ShieldCheck,
  Star,
  TrendingUp,
  X,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  DEFAULT_FREE_MEMBERSHIP,
  getMyMembershipOrCreateFree,
  listMembershipPlans,
  type MembershipPlan,
  type MembershipPlanId,
  type NormalizedMembership,
} from '@/lib/supabase/memberships';

type PlanFeatureSet = {
  features: string[];
  unavailableFeatures: string[];
};

function formatPrice(price: number) {
  if (price <= 0) {
    return 'S/ 0';
  }

  return `S/ ${Number(price).toFixed(2)}`;
}

function getListingText(plan: MembershipPlan) {
  if (plan.listing_limit === null) {
    return 'Publicaciones ilimitadas';
  }

  return `Hasta ${plan.listing_limit} publicaciones`;
}

function getBadge(planId: MembershipPlanId) {
  if (planId === 'premium') {
    return {
      label: 'Premium',
      className: 'bg-amber-100 text-amber-800',
    };
  }

  if (planId === 'plus') {
    return {
      label: 'Recomendado',
      className: 'bg-blue-100 text-blue-800',
    };
  }

  return {
    label: 'Básico',
    className: 'bg-slate-100 text-slate-800',
  };
}

function getPlanIcon(planId: MembershipPlanId) {
  if (planId === 'premium') {
    return <Crown className="h-6 w-6" />;
  }

  if (planId === 'plus') {
    return <Zap className="h-6 w-6" />;
  }

  return <PackagePlus className="h-6 w-6" />;
}

function getPlanSubtitle(planId: MembershipPlanId) {
  if (planId === 'premium') {
    return 'Para vendedores con alto volumen';
  }

  if (planId === 'plus') {
    return 'Para vendedores frecuentes';
  }

  return 'Ideal para empezar a vender';
}

function getPlanFeatures(planId: MembershipPlanId): PlanFeatureSet {
  if (planId === 'premium') {
    return {
      features: [
        'Publicaciones ilimitadas',
        'Comisión reducida al 2%',
        'Productos destacados en portada',
        'Badge Tienda Premium',
        'Prioridad máxima en búsquedas',
        'Panel avanzado de ventas',
        'Chat interno protegido',
      ],
      unavailableFeatures: [],
    };
  }

  if (planId === 'plus') {
    return {
      features: [
        'Hasta 5 publicaciones activas',
        'Comisión reducida al 5%',
        'Mayor visibilidad en búsquedas',
        'Badge de vendedor Plus',
        'Estadísticas básicas',
        'Chat interno protegido',
      ],
      unavailableFeatures: [
        'Publicaciones ilimitadas',
        'Productos en portada principal',
      ],
    };
  }

  return {
    features: [
      'Hasta 3 publicaciones si estás verificado',
      'Hasta 2 publicaciones si no estás verificado',
      'Chat interno protegido',
      'Perfil básico de vendedor',
      'Comisión del 8% por venta',
    ],
    unavailableFeatures: [
      'Prioridad en búsquedas',
      'Productos destacados',
      'Panel avanzado de ventas',
    ],
  };
}

function getButtonLabel(plan: MembershipPlan, currentPlanId: MembershipPlanId) {
  if (plan.id === currentPlanId) {
    return 'Plan actual';
  }

  if (plan.id === 'free') {
    return 'Gestionar cambio';
  }

  return 'Continuar con Mercado Pago';
}

export default function MembershipPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [membership, setMembership] = useState<NormalizedMembership>(
    DEFAULT_FREE_MEMBERSHIP
  );

  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isPaymentLoading, setIsPaymentLoading] =
    useState<MembershipPlanId | null>(null);

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, user, router]);

  const loadMembershipData = async () => {
    setIsPageLoading(true);
    setErrorMessage('');

    try {
      const [supabasePlans, realMembership] = await Promise.all([
        listMembershipPlans(),
        getMyMembershipOrCreateFree(),
      ]);

      setPlans(supabasePlans);
      setMembership(realMembership);
    } catch (error: any) {
      setErrorMessage(
        error?.message || 'No se pudieron cargar las membresías desde Supabase.'
      );
      setPlans([]);
      setMembership(DEFAULT_FREE_MEMBERSHIP);
    } finally {
      setIsPageLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      loadMembershipData();
    }
  }, [isAuthenticated, user]);

  const currentPlanId = membership.planId;

  const orderedPlans = useMemo(() => {
    return [...plans].sort((a, b) => a.sort_order - b.sort_order);
  }, [plans]);

  const handlePlanClick = async (plan: MembershipPlan) => {
    setErrorMessage('');
    setSuccessMessage('');

    if (plan.id === currentPlanId) {
      return;
    }

    if (plan.id === 'free') {
      setErrorMessage(
        'El Plan Gratis se asigna automáticamente. Para bajar de plan, debes gestionarlo desde administración o soporte.'
      );
      return;
    }

    setIsPaymentLoading(plan.id);

    try {
      const response = await fetch('/api/payments/create-membership', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: plan.id,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.error ||
            'Todavía falta conectar la ruta segura de Mercado Pago.'
        );
      }

      const paymentUrl = data?.initPoint || data?.url || data?.paymentUrl;

      if (!paymentUrl) {
        throw new Error(
          'Mercado Pago no devolvió una URL de pago válida.'
        );
      }

      window.location.href = paymentUrl;
    } catch (error: any) {
      setErrorMessage(
        error?.message ||
          'No se pudo iniciar el pago. Revisa la integración con Mercado Pago.'
      );
    } finally {
      setIsPaymentLoading(null);
    }
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="container mx-auto px-4 py-10">
        <div className="mb-8">
          <Link href="/seller/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al panel
            </Button>
          </Link>
        </div>

        <section className="mx-auto mb-10 max-w-4xl text-center">
          <Badge className="mb-4 bg-blue-100 text-blue-800">
            Membresías reales desde Supabase
          </Badge>

          <h1 className="mb-4 text-4xl font-bold md:text-5xl">
            Planes de membresía
          </h1>

          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Elige el plan adecuado para publicar más productos, reducir comisiones
            y vender con mayor visibilidad en La Segunda.
          </p>
        </section>

        {successMessage && (
          <div className="mx-auto mb-6 max-w-5xl rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-800">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              {successMessage}
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="mx-auto mb-6 max-w-5xl rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
            {errorMessage}
          </div>
        )}

        <Card className="mx-auto mb-8 max-w-5xl border-blue-200 bg-blue-50">
          <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-bold text-blue-950">
                Plan actual
              </h2>

              <p className="mt-1 text-sm text-blue-800">
                Tu membresía se consulta desde Supabase, no desde localStorage.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Badge className={getBadge(currentPlanId).className}>
                {membership.planName}
              </Badge>

              <Badge variant="outline">
                Estado: {membership.status}
              </Badge>

              <Badge variant="outline">
                Comisión: {membership.commissionRate}%
              </Badge>
            </div>
          </CardContent>
        </Card>

        {isPageLoading ? (
          <div className="mx-auto max-w-5xl rounded-2xl border bg-white p-12 text-center shadow-sm">
            <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-primary" />
            <h2 className="text-xl font-bold">Cargando membresías...</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Obteniendo planes desde Supabase.
            </p>
          </div>
        ) : (
          <section className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
            {orderedPlans.map((plan) => {
              const badge = getBadge(plan.id);
              const isCurrentPlan = currentPlanId === plan.id;
              const isRecommended = plan.id === 'plus';
              const isPremium = plan.id === 'premium';
              const isLoading = isPaymentLoading === plan.id;
              const { features, unavailableFeatures } = getPlanFeatures(plan.id);

              return (
                <Card
                  key={plan.id}
                  className={`relative overflow-hidden ${
                    isRecommended
                      ? 'border-primary shadow-lg ring-2 ring-primary md:scale-105'
                      : 'border-border shadow-sm'
                  }`}
                >
                  {isRecommended && (
                    <div className="absolute left-1/2 top-0 -translate-x-1/2 rounded-b-xl bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground">
                      Recomendado
                    </div>
                  )}

                  <CardHeader className={isRecommended ? 'pt-10' : ''}>
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        {getPlanIcon(plan.id)}
                      </div>

                      <Badge className={badge.className}>
                        {badge.label}
                      </Badge>
                    </div>

                    <CardTitle className="text-2xl">
                      {plan.name}
                    </CardTitle>

                    <CardDescription>
                      {plan.description || getPlanSubtitle(plan.id)}
                    </CardDescription>

                    <div className="pt-4">
                      <span className="text-4xl font-bold text-primary">
                        {formatPrice(Number(plan.price))}
                      </span>

                      {Number(plan.price) > 0 && (
                        <span className="text-sm text-muted-foreground">
                          {' '}
                          / mes
                        </span>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-slate-100 p-3">
                        <p className="text-xs text-muted-foreground">
                          Publicaciones
                        </p>

                        <p className="font-bold">
                          {getListingText(plan)}
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-100 p-3">
                        <p className="text-xs text-muted-foreground">
                          Comisión
                        </p>

                        <p className="font-bold">
                          {Number(plan.commission_rate)}%
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {features.map((feature) => (
                        <div
                          key={feature}
                          className="flex items-start gap-2 text-sm"
                        >
                          <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                          <span>{feature}</span>
                        </div>
                      ))}

                      {unavailableFeatures.map((feature) => (
                        <div
                          key={feature}
                          className="flex items-start gap-2 text-sm text-muted-foreground"
                        >
                          <X className="mt-0.5 h-4 w-4 flex-shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>

                    <Button
                      className={`w-full ${
                        isPremium ? 'bg-amber-600 hover:bg-amber-700' : ''
                      }`}
                      variant={plan.id === 'free' ? 'outline' : 'default'}
                      disabled={isCurrentPlan || isPaymentLoading !== null}
                      onClick={() => handlePlanClick(plan)}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Conectando...
                        </>
                      ) : isCurrentPlan ? (
                        'Plan actual'
                      ) : plan.id === 'free' ? (
                        getButtonLabel(plan, currentPlanId)
                      ) : (
                        <>
                          <CreditCard className="mr-2 h-4 w-4" />
                          {getButtonLabel(plan, currentPlanId)}
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </section>
        )}

        <section className="mx-auto mt-14 max-w-6xl">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                Comparación completa
              </CardTitle>

              <CardDescription>
                Compara los beneficios principales de cada membresía.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-slate-100">
                    <tr>
                      <th className="p-4 text-left">Característica</th>
                      <th className="p-4 text-center">Gratis</th>
                      <th className="p-4 text-center">Plus</th>
                      <th className="p-4 text-center">Premium</th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr className="border-b">
                      <td className="p-4 font-medium">Precio mensual</td>
                      <td className="p-4 text-center">S/ 0</td>
                      <td className="p-4 text-center">S/ 19.90</td>
                      <td className="p-4 text-center">S/ 49.90</td>
                    </tr>

                    <tr className="border-b">
                      <td className="p-4 font-medium">Publicaciones</td>
                      <td className="p-4 text-center">3</td>
                      <td className="p-4 text-center">5</td>
                      <td className="p-4 text-center">Ilimitadas</td>
                    </tr>

                    <tr className="border-b">
                      <td className="p-4 font-medium">Comisión por venta</td>
                      <td className="p-4 text-center">8%</td>
                      <td className="p-4 text-center">5%</td>
                      <td className="p-4 text-center">2%</td>
                    </tr>

                    <tr className="border-b">
                      <td className="p-4 font-medium">
                        Chat interno protegido
                      </td>

                      <td className="p-4 text-center">
                        <Check className="mx-auto h-4 w-4 text-green-600" />
                      </td>

                      <td className="p-4 text-center">
                        <Check className="mx-auto h-4 w-4 text-green-600" />
                      </td>

                      <td className="p-4 text-center">
                        <Check className="mx-auto h-4 w-4 text-green-600" />
                      </td>
                    </tr>

                    <tr className="border-b">
                      <td className="p-4 font-medium">
                        Prioridad en búsqueda
                      </td>

                      <td className="p-4 text-center">
                        <X className="mx-auto h-4 w-4 text-muted-foreground" />
                      </td>

                      <td className="p-4 text-center">
                        <Check className="mx-auto h-4 w-4 text-green-600" />
                      </td>

                      <td className="p-4 text-center">
                        <Check className="mx-auto h-4 w-4 text-green-600" />
                      </td>
                    </tr>

                    <tr className="border-b">
                      <td className="p-4 font-medium">
                        Productos destacados
                      </td>

                      <td className="p-4 text-center">
                        <X className="mx-auto h-4 w-4 text-muted-foreground" />
                      </td>

                      <td className="p-4 text-center">
                        <Check className="mx-auto h-4 w-4 text-green-600" />
                      </td>

                      <td className="p-4 text-center">
                        <Check className="mx-auto h-4 w-4 text-green-600" />
                      </td>
                    </tr>

                    <tr>
                      <td className="p-4 font-medium">Badge de tienda</td>

                      <td className="p-4 text-center">
                        <X className="mx-auto h-4 w-4 text-muted-foreground" />
                      </td>

                      <td className="p-4 text-center">
                        <Star className="mx-auto h-4 w-4 text-blue-600" />
                      </td>

                      <td className="p-4 text-center">
                        <Crown className="mx-auto h-4 w-4 text-amber-600" />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mx-auto mt-10 max-w-6xl">
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="flex items-center gap-2 text-lg font-bold text-amber-900">
                  <Lock className="h-5 w-5" />
                  Próximo paso: Mercado Pago
                </h3>

                <p className="mt-1 text-sm text-amber-800">
                  Esta página ya lee planes reales desde Supabase. La activación
                  de Plus o Premium debe confirmarse mediante Mercado Pago y
                  webhook antes de actualizar la membresía.
                </p>
              </div>

              <Link href="/seller/dashboard">
                <Button variant="outline">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Ver mi límite actual
                </Button>
              </Link>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
