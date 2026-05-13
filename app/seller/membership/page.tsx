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
import { Input } from '@/components/ui/input';
import {
  Check,
  X,
  Crown,
  Zap,
  ShieldCheck,
  PackagePlus,
  ArrowLeft,
  Loader2,
  Star,
  TrendingUp,
  CreditCard,
  Lock,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type PlanId = 'free' | 'plus' | 'premium';

type MembershipPlan = {
  id: PlanId;
  name: string;
  subtitle: string;
  price: string;
  monthlyPrice: number;
  commissionRate: number;
  listingLimit: number;
  listingText: string;
  badge: string;
  badgeClass: string;
  icon: React.ReactNode;
  recommended?: boolean;
  features: string[];
  unavailableFeatures: string[];
};

const membershipPlans: MembershipPlan[] = [
  {
    id: 'free',
    name: 'Plan Gratis',
    subtitle: 'Ideal para empezar a vender',
    price: 'S/ 0',
    monthlyPrice: 0,
    commissionRate: 8,
    listingLimit: 3,
    listingText: 'Hasta 3 publicaciones',
    badge: 'Básico',
    badgeClass: 'bg-slate-100 text-slate-800',
    icon: <PackagePlus className="h-6 w-6" />,
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
  },
  {
    id: 'plus',
    name: 'La Segunda Plus',
    subtitle: 'Para vendedores frecuentes',
    price: 'S/ 19.90',
    monthlyPrice: 19.9,
    commissionRate: 5,
    listingLimit: 5,
    listingText: 'Hasta 5 publicaciones',
    badge: 'Más vendido',
    badgeClass: 'bg-blue-100 text-blue-800',
    icon: <Zap className="h-6 w-6" />,
    recommended: true,
    features: [
      'Hasta 5 publicaciones activas',
      'Comisión reducida al 5%',
      'Mayor visibilidad en búsquedas',
      'Badge de vendedor Plus',
      'Más oportunidades de venta',
      'Chat interno protegido',
      'Estadísticas básicas',
    ],
    unavailableFeatures: [
      'Publicaciones ilimitadas',
      'Productos en portada principal',
    ],
  },
  {
    id: 'premium',
    name: 'La Segunda Premium',
    subtitle: 'Para vender sin límites',
    price: 'S/ 49.90',
    monthlyPrice: 49.9,
    commissionRate: 2,
    listingLimit: Infinity,
    listingText: 'Publicaciones ilimitadas',
    badge: 'Premium',
    badgeClass: 'bg-amber-100 text-amber-800',
    icon: <Crown className="h-6 w-6" />,
    features: [
      'Publicaciones ilimitadas',
      'Comisión reducida al 2%',
      'Productos destacados en portada',
      'Badge Tienda Premium',
      'Prioridad máxima en búsquedas',
      'Panel avanzado de ventas',
      'Mayor exposición comercial',
      'Chat interno protegido',
    ],
    unavailableFeatures: [],
  },
];

export default function MembershipPage() {
  const { user, isAuthenticated, updateUser } = useAuth();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState<PlanId | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [selectedPlan, setSelectedPlan] = useState<MembershipPlan | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [paymentError, setPaymentError] = useState('');

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || !user) {
    return null;
  }

  const currentUser = user as any;

  const getCurrentPlanId = (): PlanId => {
    const rawPlan = String(
      currentUser.membershipType ||
        currentUser.membership ||
        currentUser.plan ||
        currentUser.sellerBadge ||
        'free'
    ).toLowerCase();

    if (rawPlan.includes('premium') || rawPlan.includes('elite')) {
      return 'premium';
    }

    if (rawPlan.includes('plus')) {
      return 'plus';
    }

    return 'free';
  };

  const currentPlanId = getCurrentPlanId();

  const saveUserInLocalStorage = (updates: Record<string, any>) => {
    if (typeof window === 'undefined') return;

    const possibleUserKeys = [
      'currentUser',
      'la-segunda-user',
      'la_segunda_user',
      'auth-user',
    ];

    let saved = false;

    possibleUserKeys.forEach((key) => {
      const rawValue = localStorage.getItem(key);

      if (!rawValue) return;

      try {
        const parsedUser = JSON.parse(rawValue);
        const updatedUser = {
          ...parsedUser,
          ...updates,
        };

        localStorage.setItem(key, JSON.stringify(updatedUser));
        saved = true;
      } catch {
        console.warn(`No se pudo actualizar el usuario en localStorage: ${key}`);
      }
    });

    if (!saved) {
      localStorage.setItem(
        'currentUser',
        JSON.stringify({
          ...currentUser,
          ...updates,
        })
      );
    }
  };

  const resetPaymentForm = () => {
    setCardName('');
    setCardNumber('');
    setCardExpiry('');
    setCardCvv('');
    setPaymentError('');
  };

  const formatCardNumber = (value: string) => {
    const numbersOnly = value.replace(/\D/g, '').slice(0, 16);
    return numbersOnly.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (value: string) => {
    const numbersOnly = value.replace(/\D/g, '').slice(0, 4);

    if (numbersOnly.length <= 2) {
      return numbersOnly;
    }

    return `${numbersOnly.slice(0, 2)}/${numbersOnly.slice(2)}`;
  };

  const validatePaymentForm = () => {
    const cleanCardNumber = cardNumber.replace(/\s/g, '');

    if (!cardName.trim()) {
      return 'Ingresa el nombre del titular de la tarjeta.';
    }

    if (cleanCardNumber.length < 16) {
      return 'Ingresa un número de tarjeta válido de 16 dígitos.';
    }

    if (!cardExpiry || cardExpiry.length < 5) {
      return 'Ingresa la fecha de vencimiento en formato MM/AA.';
    }

    if (!cardCvv || cardCvv.length < 3) {
      return 'Ingresa un CVV válido.';
    }

    return '';
  };

  const activatePlan = async (plan: MembershipPlan) => {
    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(plan.id);

    try {
      const updates = {
        membershipType: plan.id,
        membership: plan.id,
        plan: plan.id,
        sellerBadge:
          plan.id === 'free'
            ? 'standard'
            : plan.id === 'plus'
              ? 'plus'
              : 'premium',
        isSeller: true,
        accountType:
          currentUser.accountType === 'buyer' ||
          currentUser.accountType === 'comprador'
            ? 'both'
            : currentUser.accountType || 'both',
        verificationStatus:
          plan.id === 'free'
            ? currentUser.verificationStatus || 'pending'
            : 'verified',
        subscriptionStatus: plan.id === 'free' ? 'free' : 'active',
        subscriptionStartedAt: new Date().toISOString(),
        commissionRate: plan.commissionRate,
        monthlyListingLimit: plan.listingLimit,
      };

      await new Promise((resolve) => setTimeout(resolve, 900));

      updateUser(updates as any);
      saveUserInLocalStorage(updates);

      setSuccessMessage(
        plan.id === 'free'
          ? 'Plan Gratis activado correctamente.'
          : `Pago aprobado. ${plan.name} activado correctamente. Redirigiendo al panel...`
      );

      setShowPaymentModal(false);
      setSelectedPlan(null);
      resetPaymentForm();

      setTimeout(() => {
        router.push('/seller/dashboard');
      }, 1200);
    } catch {
      setErrorMessage('Ocurrió un error al activar la membresía.');
    } finally {
      setIsLoading(null);
    }
  };

  const handlePlanClick = async (plan: MembershipPlan) => {
    setErrorMessage('');
    setSuccessMessage('');

    if (plan.id === currentPlanId) {
      return;
    }

    if (plan.id === 'free') {
      await activatePlan(plan);
      return;
    }

    setSelectedPlan(plan);
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setPaymentError('');

    if (!selectedPlan) {
      setPaymentError('No se seleccionó ningún plan.');
      return;
    }

    const validationError = validatePaymentForm();

    if (validationError) {
      setPaymentError(validationError);
      return;
    }

    await activatePlan(selectedPlan);
  };

  const getButtonLabel = (plan: MembershipPlan) => {
    if (currentPlanId === plan.id) return 'Plan actual';
    if (plan.id === 'free') return 'Cambiar a plan gratis';
    return 'Activar plan ahora';
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <div className="container mx-auto px-4 py-10">
        <div className="mb-8">
          <Link href="/seller/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al panel
            </Button>
          </Link>
        </div>

        <div className="mx-auto mb-10 max-w-4xl text-center">
          <Badge className="mb-4 bg-amber-100 text-amber-800">
            Pago simulado para MVP
          </Badge>

          <h1 className="mb-4 text-4xl font-bold md:text-5xl">
            Planes de membresía
          </h1>

          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Desbloquea más publicaciones, reduce tus comisiones y vende más en
            La Segunda.
          </p>
        </div>

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

        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
          {membershipPlans.map((plan) => {
            const isCurrentPlan = currentPlanId === plan.id;
            const isActivating = isLoading === plan.id;

            return (
              <Card
                key={plan.id}
                className={`relative overflow-hidden ${
                  plan.recommended
                    ? 'border-primary shadow-lg ring-2 ring-primary md:scale-105'
                    : 'border-border shadow-sm'
                }`}
              >
                {plan.recommended && (
                  <div className="absolute left-1/2 top-0 -translate-x-1/2 rounded-b-xl bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground">
                    Recomendado
                  </div>
                )}

                <CardHeader className={plan.recommended ? 'pt-10' : ''}>
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      {plan.icon}
                    </div>

                    <Badge className={plan.badgeClass}>{plan.badge}</Badge>
                  </div>

                  <CardTitle className="text-2xl">{plan.name}</CardTitle>

                  <CardDescription>{plan.subtitle}</CardDescription>

                  <div className="pt-4">
                    <span className="text-4xl font-bold text-primary">
                      {plan.price}
                    </span>

                    {plan.monthlyPrice > 0 && (
                      <span className="text-sm text-muted-foreground"> / mes</span>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-slate-100 p-3">
                      <p className="text-xs text-muted-foreground">Publicaciones</p>
                      <p className="font-bold">{plan.listingText}</p>
                    </div>

                    <div className="rounded-xl bg-slate-100 p-3">
                      <p className="text-xs text-muted-foreground">Comisión</p>
                      <p className="font-bold">{plan.commissionRate}%</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-2 text-sm">
                        <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                        <span>{feature}</span>
                      </div>
                    ))}

                    {plan.unavailableFeatures.map((feature) => (
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
                      plan.id === 'premium'
                        ? 'bg-amber-600 hover:bg-amber-700'
                        : ''
                    }`}
                    variant={plan.id === 'free' ? 'outline' : 'default'}
                    disabled={isCurrentPlan || isLoading !== null}
                    onClick={() => handlePlanClick(plan)}
                  >
                    {isActivating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Procesando...
                      </>
                    ) : isCurrentPlan ? (
                      'Plan actual'
                    ) : plan.id === 'free' ? (
                      getButtonLabel(plan)
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-4 w-4" />
                        {getButtonLabel(plan)}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mx-auto mt-14 max-w-6xl">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Comparación completa</CardTitle>
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
                      <td className="p-4 text-center">20</td>
                      <td className="p-4 text-center">Ilimitadas</td>
                    </tr>

                    <tr className="border-b">
                      <td className="p-4 font-medium">Comisión por venta</td>
                      <td className="p-4 text-center">8%</td>
                      <td className="p-4 text-center">5%</td>
                      <td className="p-4 text-center">2%</td>
                    </tr>

                    <tr className="border-b">
                      <td className="p-4 font-medium">Chat interno protegido</td>
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
                      <td className="p-4 font-medium">Prioridad en búsqueda</td>
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
                      <td className="p-4 font-medium">Productos destacados</td>
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
        </div>

        <div className="mx-auto mt-10 max-w-6xl">
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="flex items-center gap-2 text-lg font-bold text-blue-900">
                  <TrendingUp className="h-5 w-5" />
                  Estrategia de monetización activa
                </h3>

                <p className="mt-1 text-sm text-blue-800">
                  Cuando el vendedor supera el límite gratuito, La Segunda ofrece
                  membresías para seguir publicando y vender más.
                </p>
              </div>

              <Link href="/seller/dashboard">
                <Button variant="outline">Ver mi límite actual</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {showPaymentModal && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b p-5">
              <div>
                <h2 className="text-xl font-bold">Pago de membresía</h2>
                <p className="text-sm text-muted-foreground">
                  Estás activando {selectedPlan.name}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowPaymentModal(false);
                  setSelectedPlan(null);
                  resetPaymentForm();
                }}
                className="rounded-full p-2 hover:bg-slate-100"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handlePaymentSubmit} className="space-y-5 p-5">
              <div className="rounded-xl border bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{selectedPlan.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Membresía mensual
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">
                      {selectedPlan.price}
                    </p>
                    <p className="text-xs text-muted-foreground">/ mes</p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                Este es un pago simulado para MVP. No se guardan datos reales de
                tarjeta. Para producción usa Stripe, Mercado Pago o una pasarela
                certificada.
              </div>

              {paymentError && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {paymentError}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Nombre del titular</label>
                <Input
                  value={cardName}
                  onChange={(event) => setCardName(event.target.value)}
                  placeholder="Ejemplo: Diego Palomino"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Número de tarjeta</label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={cardNumber}
                    onChange={(event) =>
                      setCardNumber(formatCardNumber(event.target.value))
                    }
                    placeholder="4242 4242 4242 4242"
                    className="pl-9"
                    inputMode="numeric"
                    maxLength={19}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Vencimiento</label>
                  <Input
                    value={cardExpiry}
                    onChange={(event) =>
                      setCardExpiry(formatExpiry(event.target.value))
                    }
                    placeholder="MM/AA"
                    inputMode="numeric"
                    maxLength={5}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">CVV</label>
                  <Input
                    value={cardCvv}
                    onChange={(event) =>
                      setCardCvv(event.target.value.replace(/\D/g, '').slice(0, 4))
                    }
                    placeholder="123"
                    inputMode="numeric"
                    maxLength={4}
                    type="password"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-xl bg-slate-100 p-3 text-sm text-slate-700">
                <Lock className="h-4 w-4" />
                Tus datos no se almacenan en este MVP.
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading !== null}
                >
                  {isLoading === selectedPlan.id ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Procesando pago...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Pagar {selectedPlan.price}
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setShowPaymentModal(false);
                    setSelectedPlan(null);
                    resetPaymentForm();
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
