'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/header';
import { useAuth } from '@/lib/auth-context';
import {
  getProductById,
  incrementProductViews,
} from '@/lib/supabase/products';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  CheckCircle,
  Eye,
  Heart,
  ImageIcon,
  Loader2,
  Lock,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Star,
  User,
} from 'lucide-react';

type ProductDetail = {
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
  isFeatured?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type ContactRequest = {
  id: string;
  productId: string;
  productTitle: string;
  sellerId: string;
  buyerId: string;
  amount: number;
  status: 'pending_contact';
  createdAt: string;
};

const CONTACT_REQUESTS_KEY = 'la-segunda-contact-requests';

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
  if (value === 'like-new' || value === 'like new') return 'Como nuevo';
  if (value === 'como nuevo') return 'Como nuevo';
  if (value === 'excellent' || value === 'excelente') return 'Excelente';
  if (value === 'good' || value === 'bueno') return 'Bueno';
  if (value === 'fair' || value === 'regular') return 'Regular';

  return condition;
}

function getSellerId(product: ProductDetail) {
  return product.sellerId || product.userId || product.ownerId || '';
}

function saveContactRequest(request: ContactRequest) {
  if (typeof window === 'undefined') return;

  try {
    const rawRequests = localStorage.getItem(CONTACT_REQUESTS_KEY);
    const currentRequests = rawRequests ? JSON.parse(rawRequests) : [];

    const requests = Array.isArray(currentRequests) ? currentRequests : [];

    localStorage.setItem(
      CONTACT_REQUESTS_KEY,
      JSON.stringify([request, ...requests])
    );
  } catch {
    localStorage.setItem(CONTACT_REQUESTS_KEY, JSON.stringify([request]));
  }
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const productId = String(params?.id || '');

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [viewCount, setViewCount] = useState(0);

  const loadProduct = async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const supabaseProduct = await getProductById(productId);

      if (!supabaseProduct) {
        setProduct(null);
        setErrorMessage('Producto no encontrado.');
        return;
      }

      setProduct(supabaseProduct as ProductDetail);
      setViewCount(Number(supabaseProduct.views || 0));

      const images =
        supabaseProduct.images && supabaseProduct.images.length > 0
          ? supabaseProduct.images
          : supabaseProduct.image
            ? [supabaseProduct.image]
            : [];

      setSelectedImage(images[0] || '');

      const viewSessionKey = `la-segunda-viewed-${productId}`;

      if (!sessionStorage.getItem(viewSessionKey)) {
        sessionStorage.setItem(viewSessionKey, 'true');

        await incrementProductViews(productId);

        setViewCount(Number(supabaseProduct.views || 0) + 1);
      }
    } catch (error: any) {
      setErrorMessage(
        error?.message || 'No se pudo cargar el producto desde Supabase.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      loadProduct();
    }
  }, [productId]);

  const productImages = useMemo(() => {
    if (!product) return [];

    if (product.images && product.images.length > 0) {
      return product.images.slice(0, 2);
    }

    if (product.image) {
      return [product.image];
    }

    return [];
  }, [product]);

  const productPrice = Number(product?.price || 0);
  const sellerId = product ? getSellerId(product) : '';
  const isOwnProduct = Boolean(user?.id && sellerId && user.id === sellerId);

  const handleContactSeller = () => {
    setErrorMessage('');
    setSuccessMessage('');

    if (!isAuthenticated || !user?.id) {
      router.push('/auth/login');
      return;
    }

    if (!product) return;

    if (isOwnProduct) {
      setErrorMessage('No puedes contactar por tu propio producto.');
      return;
    }

    const request: ContactRequest = {
      id: `contact-${Date.now()}`,
      productId: product.id,
      productTitle: product.title || product.name || 'Producto',
      sellerId,
      buyerId: user.id,
      amount: productPrice,
      status: 'pending_contact',
      createdAt: new Date().toISOString(),
    };

    saveContactRequest(request);

    setSuccessMessage(
      'Solicitud registrada. Se habilitará el contacto protegido desde mensajes.'
    );

    window.setTimeout(() => {
      router.push('/messages');
    }, 1000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />

        <main className="mx-auto flex max-w-6xl items-center justify-center px-4 py-20">
          <div className="rounded-2xl border bg-white p-8 text-center shadow-sm">
            <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-primary" />
            <h1 className="text-xl font-bold">Cargando producto...</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Obteniendo información desde Supabase.
            </p>
          </div>
        </main>
      </div>
    );
  }

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
              El producto no existe, fue eliminado o ya no está activo.
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

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6">
          <Link href="/products">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a productos
            </Button>
          </Link>
        </div>

        {successMessage && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-green-700">
            <div className="flex items-center gap-2 font-semibold">
              <CheckCircle className="h-5 w-5" />
              {successMessage}
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            {errorMessage}
          </div>
        )}

        <section className="grid gap-8 lg:grid-cols-[0.95fr_1fr]">
          <div className="space-y-4">
            <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
              <div className="flex h-[360px] w-full items-center justify-center bg-white p-4 md:h-[420px]">
                {selectedImage ? (
                  <img
                    src={selectedImage}
                    alt={product.title || product.name || 'Producto'}
                    className="max-h-full max-w-full rounded-xl object-contain"
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
                    className={`flex h-28 items-center justify-center overflow-hidden rounded-xl border bg-white p-2 transition md:h-32 ${
                      selectedImage === image
                        ? 'border-primary ring-2 ring-primary/20'
                        : 'hover:border-primary'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`Imagen ${index + 1}`}
                      className="max-h-full max-w-full rounded-lg object-contain"
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
                  {viewCount} vistas
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
                Contacto protegido
              </h2>

              <div className="space-y-3 text-sm text-slate-600">
                <p className="flex gap-2">
                  <Lock className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                  Para contactar al vendedor, primero debes iniciar sesión.
                </p>

                <p className="flex gap-2">
                  <MessageCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                  La conversación se realiza dentro de La Segunda para proteger a comprador y vendedor.
                </p>

                <p className="flex gap-2">
                  <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                  No compartas WhatsApp, correo ni datos personales fuera de la plataforma.
                </p>
              </div>

              <Button
                className="mt-5 w-full"
                size="lg"
                onClick={handleContactSeller}
                disabled={isOwnProduct}
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                {isOwnProduct
                  ? 'Este producto es tuyo'
                  : 'Contactar vendedor'}
              </Button>

              <p className="mt-3 text-center text-xs text-muted-foreground">
                Más adelante podrás integrar Mercado Pago, Culqi, Izipay o Stripe.
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
                  Identidad protegida hasta iniciar contacto seguro.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
