'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/header';
import { useAuth } from '@/lib/auth-context';
import { mockProducts } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  CheckCircle,
  CreditCard,
  Eye,
  Heart,
  ImageIcon,
  Lock,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Star,
  User,
  X,
} from 'lucide-react';

type ProductItem = {
  id: string;
  sellerId?: string;
  userId?: string;
  ownerId?: string;
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
  createdAt?: string;
};

type PurchaseIntent = {
  id: string;
  productId: string;
  productTitle: string;
  sellerId: string;
  buyerId: string;
  amount: number;
  commissionRate: number;
  commissionAmount: number;
  sellerAmount: number;
  status: 'pre_authorized' | 'pending' | 'completed' | 'cancelled';
  cardLast4: string;
  createdAt: string;
};

const PRODUCTS_KEY = 'la-segunda-products';
const PURCHASE_INTENTS_KEY = 'la-segunda-purchase-intents';

const DEFAULT_PRODUCT_IMAGE = 'https://placehold.co/800x600?text=La+Segunda';

function normalizeProduct(product: any): ProductItem {
  return {
    id: String(product.id),
    sellerId: product.sellerId || product.userId || product.ownerId || '',
    userId: product.userId || product.sellerId || product.ownerId || '',
    ownerId: product.ownerId || product.sellerId || product.userId || '',
    title: product.title || product.name || 'Producto publicado',
    name: product.name || product.title || 'Producto publicado',
    description: product.description || 'Sin descripción disponible.',
    category: product.category || 'Otros',
    condition: product.condition || 'Disponible',
    price: Number(product.price || 0),
    city: product.city || 'Perú',
    images:
      product.images && product.images.length > 0
        ? product.images
        : product.image
          ? [product.image]
          : [DEFAULT_PRODUCT_IMAGE],
    image: product.image || product.images?.[0] || DEFAULT_PRODUCT_IMAGE,
    status: product.status || 'active',
    views: Number(product.views || 0),
    favoriteCount: Number(product.favoriteCount || 0),
    createdAt: product.createdAt || new Date().toISOString(),
  };
}

function getStoredProducts(): ProductItem[] {
  if (typeof window === 'undefined') return [];

  try {
    const rawProducts = localStorage.getItem(PRODUCTS_KEY);

    if (!rawProducts) return [];

    const parsedProducts = JSON.parse(rawProducts);

    if (!Array.isArray(parsedProducts)) return [];

    return parsedProducts.map(normalizeProduct);
  } catch {
    return [];
  }
}

function getStoredPurchaseIntents(): PurchaseIntent[] {
  if (typeof window === 'undefined') return [];

  try {
    const rawIntents = localStorage.getItem(PURCHASE_INTENTS_KEY);

    if (!rawIntents) return [];

    const parsedIntents = JSON.parse(rawIntents);

    if (!Array.isArray(parsedIntents)) return [];

    return parsedIntents;
  } catch {
    return [];
  }
}

function savePurchaseIntent(intent: PurchaseIntent) {
  if (typeof window === 'undefined') return;

  const currentIntents = getStoredPurchaseIntents();

  localStorage.setItem(
    PURCHASE_INTENTS_KEY,
    JSON.stringify([intent, ...currentIntents])
  );
}

function getSellerId(product: ProductItem) {
  return product.sellerId || product.userId || product.ownerId || 'seller-demo';
}

function formatPrice(value?: number) {
  return Number(value || 0).toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
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

function onlyNumbers(value: string) {
  return value.replace(/\D/g, '');
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const productId = String(params?.id || '');

  const [clientProducts, setClientProducts] = useState<ProductItem[]>([]);
  const [selectedImage, setSelectedImage] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  useEffect(() => {
    setClientProducts(getStoredProducts());
  }, []);

  const product = useMemo(() => {
    const normalizedMockProducts = mockProducts.map(normalizeProduct);

    const allProducts = [...clientProducts, ...normalizedMockProducts];

    const uniqueProducts = new Map<string, ProductItem>();

    allProducts.forEach((item) => {
      uniqueProducts.set(String(item.id), item);
    });

    return uniqueProducts.get(productId) || null;
  }, [clientProducts, productId]);

  const productImages = useMemo(() => {
    if (!product) return [DEFAULT_PRODUCT_IMAGE];

    const images =
      product.images && product.images.length > 0
        ? product.images
        : product.image
          ? [product.image]
          : [DEFAULT_PRODUCT_IMAGE];

    return images.slice(0, 2);
  }, [product]);

  useEffect(() => {
    if (productImages.length > 0) {
      setSelectedImage(productImages[0]);
    }
  }, [productImages]);

  const commissionRate = 8;
  const productPrice = Number(product?.price || 0);
  const commissionAmount = (productPrice * commissionRate) / 100;
  const sellerAmount = productPrice - commissionAmount;

  const handleOpenPaymentModal = () => {
    setPaymentError('');

    if (!isAuthenticated || !user?.id) {
      router.push('/auth/login');
      return;
    }

    if (!product) return;

    if (getSellerId(product) === user.id) {
      setPaymentError('No puedes comprar o contactar por tu propio producto.');
      return;
    }

    setShowPaymentModal(true);
  };

  const handleCardPayment = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPaymentError('');

    if (!product || !user?.id) {
      setPaymentError('Debes iniciar sesión para continuar.');
      return;
    }

    const cleanCardNumber = onlyNumbers(cardNumber);
    const cleanCvv = onlyNumbers(cardCvv);
    const cleanExpiry = cardExpiry.trim();

    if (!cardName.trim()) {
      setPaymentError('Ingresa el nombre del titular de la tarjeta.');
      return;
    }

    if (cleanCardNumber.length < 13 || cleanCardNumber.length > 19) {
      setPaymentError('Ingresa un número de tarjeta válido.');
      return;
    }

    if (!/^\d{2}\/\d{2}$/.test(cleanExpiry)) {
      setPaymentError('Ingresa la fecha en formato MM/AA.');
      return;
    }

    if (cleanCvv.length < 3 || cleanCvv.length > 4) {
      setPaymentError('Ingresa un CVV válido.');
      return;
    }

    const newPurchaseIntent: PurchaseIntent = {
      id: `intent-${Date.now()}`,
      productId: product.id,
      productTitle: product.title || product.name || 'Producto',
      sellerId: getSellerId(product),
      buyerId: user.id,
      amount: productPrice,
      commissionRate,
      commissionAmount,
      sellerAmount,
      status: 'pre_authorized',
      cardLast4: cleanCardNumber.slice(-4),
      createdAt: new Date().toISOString(),
    };

    savePurchaseIntent(newPurchaseIntent);

    setPaymentSuccess(true);
    setShowPaymentModal(false);

    window.setTimeout(() => {
      router.push('/messages');
    }, 1200);
  };

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />

        <main className="mx-auto max-w-5xl px-4 py-10">
          <Link href="/products">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a productos
            </Button>
          </Link>

          <div className="mt-8 rounded-2xl border bg-white p-10 text-center shadow-sm">
            <ImageIcon className="mx-auto mb-4 h-16 w-16 text-slate-400" />

            <h1 className="mb-2 text-2xl font-bold">
              Producto no encontrado
            </h1>

            <p className="mb-6 text-muted-foreground">
              El producto no existe o fue eliminado por el vendedor.
            </p>

            <Link href="/products">
              <Button>Explorar productos</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6">
          <Link href="/products">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a productos
            </Button>
          </Link>
        </div>

        {paymentSuccess && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-green-700">
            <div className="flex items-center gap-2 font-semibold">
              <CheckCircle className="h-5 w-5" />
              Pago de reserva registrado correctamente.
            </div>

            <p className="mt-1 text-sm">
              El chat protegido será habilitado para coordinar la compra sin compartir
              datos personales.
            </p>
          </div>
        )}

        {paymentError && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            {paymentError}
          </div>
        )}

        <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
              <div className="aspect-[4/3] bg-slate-100">
                {selectedImage ? (
                  <img
                    src={selectedImage}
                    alt={product.title || product.name || 'Producto'}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center text-slate-400">
                    <ImageIcon className="mb-3 h-16 w-16" />
                    <p className="text-xl font-bold">Imagen no disponible</p>
                  </div>
                )}
              </div>
            </div>

            {productImages.length > 1 && (
              <div className="grid grid-cols-2 gap-4">
                {productImages.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => setSelectedImage(image)}
                    className={`overflow-hidden rounded-xl border bg-white p-1 transition ${
                      selectedImage === image
                        ? 'border-primary ring-2 ring-primary/20'
                        : 'hover:border-primary'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`Imagen ${index + 1}`}
                      className="h-32 w-full rounded-lg object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-5">
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="mb-4 flex flex-wrap gap-2">
                <Badge className="bg-primary text-primary-foreground">
                  {getConditionLabel(product.condition)}
                </Badge>

                <Badge variant="outline">
                  {product.category || 'Otros'}
                </Badge>

                <Badge variant="outline">
                  {product.status || 'Activo'}
                </Badge>
              </div>

              <h1 className="text-3xl font-bold text-slate-950">
                {product.title || product.name}
              </h1>

              <p className="mt-4 text-4xl font-extrabold text-primary">
                S/ {formatPrice(product.price)}
              </p>

              <div className="mt-5 flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {product.city || 'Perú'}
                </span>

                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {product.views || 0} vistas
                </span>

                <span className="flex items-center gap-1">
                  <Heart className="h-4 w-4" />
                  {product.favoriteCount || 0} favoritos
                </span>

                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  Publicación verificada
                </span>
              </div>

              <div className="mt-6 border-t pt-6">
                <h2 className="mb-2 text-lg font-bold">Descripción</h2>

                <p className="whitespace-pre-line leading-relaxed text-slate-600">
                  {product.description || 'Sin descripción disponible.'}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
                <ShieldCheck className="h-5 w-5 text-primary" />
                Compra protegida
              </h2>

              <div className="space-y-3 text-sm text-slate-600">
                <p className="flex gap-2">
                  <Lock className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                  Para contactar al vendedor, primero se registra una reserva de compra.
                </p>

                <p className="flex gap-2">
                  <CreditCard className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                  El comprador ingresa su tarjeta mediante un flujo protegido.
                </p>

                <p className="flex gap-2">
                  <MessageCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                  Luego se habilita el chat interno sin exponer teléfono ni correo.
                </p>
              </div>

              <div className="mt-5 rounded-xl bg-slate-50 p-4 text-sm">
                <div className="mb-2 flex justify-between">
                  <span>Precio del producto</span>
                  <span className="font-semibold">S/ {formatPrice(productPrice)}</span>
                </div>

                <div className="mb-2 flex justify-between">
                  <span>Comisión La Segunda ({commissionRate}%)</span>
                  <span className="font-semibold">
                    S/ {formatPrice(commissionAmount)}
                  </span>
                </div>

                <div className="flex justify-between border-t pt-2">
                  <span>Pago al vendedor</span>
                  <span className="font-semibold">
                    S/ {formatPrice(sellerAmount)}
                  </span>
                </div>
              </div>

              <Button
                className="mt-5 w-full"
                size="lg"
                onClick={handleOpenPaymentModal}
              >
                <CreditCard className="mr-2 h-5 w-5" />
                Contactar vendedor con compra protegida
              </Button>

              <p className="mt-3 text-center text-xs text-muted-foreground">
                No compartas WhatsApp, correo ni datos personales fuera de La Segunda.
              </p>
            </div>

            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
                <User className="h-5 w-5 text-primary" />
                Vendedor
              </h2>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="font-semibold">Vendedor de La Segunda</p>
                <p className="text-sm text-muted-foreground">
                  Identidad protegida hasta iniciar compra segura.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">
                  Compra protegida
                </h2>

                <p className="text-sm text-muted-foreground">
                  Ingresa los datos de tarjeta para registrar la reserva y habilitar
                  el contacto con el vendedor.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="rounded-full p-2 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-5 rounded-xl border bg-slate-50 p-4">
              <p className="font-semibold">{product.title || product.name}</p>
              <p className="text-sm text-muted-foreground">
                Monto: S/ {formatPrice(productPrice)}
              </p>
            </div>

            {paymentError && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {paymentError}
              </div>
            )}

            <form onSubmit={handleCardPayment} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Titular de la tarjeta
                </label>

                <input
                  value={cardName}
                  onChange={(event) => setCardName(event.target.value)}
                  placeholder="Nombre como aparece en la tarjeta"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Número de tarjeta
                </label>

                <input
                  value={cardNumber}
                  onChange={(event) => setCardNumber(event.target.value)}
                  placeholder="0000 0000 0000 0000"
                  maxLength={23}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Vencimiento
                  </label>

                  <input
                    value={cardExpiry}
                    onChange={(event) => setCardExpiry(event.target.value)}
                    placeholder="MM/AA"
                    maxLength={5}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    CVV
                  </label>

                  <input
                    value={cardCvv}
                    onChange={(event) => setCardCvv(event.target.value)}
                    placeholder="123"
                    maxLength={4}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                Para producción real no guardes datos de tarjeta en tu web.
                Debes usar una pasarela de pago como Culqi, Mercado Pago, Izipay
                o Stripe con tokenización segura.
              </div>

              <Button type="submit" className="w-full">
                <Lock className="mr-2 h-4 w-4" />
                Registrar compra protegida y habilitar chat
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
