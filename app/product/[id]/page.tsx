'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle,
  Copy,
  Eye,
  Heart,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Star,
  User,
} from 'lucide-react';

import { Header } from '@/components/header';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

type ProductRow = {
  id: string;

  seller_id?: string | null;
  user_id?: string | null;
  owner_id?: string | null;

  sellerId?: string | null;
  userId?: string | null;
  ownerId?: string | null;

  title?: string | null;
  name?: string | null;
  description?: string | null;
  category?: string | null;
  condition?: string | null;
  price?: number | string | null;
  city?: string | null;
  status?: string | null;

  images?: string[] | string | null;
  image?: string | null;
  image_url?: string | null;
  thumbnail_url?: string | null;

  contact_name?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;

  seller_name?: string | null;
  seller_email?: string | null;
  seller_phone?: string | null;

  views?: number | string | null;
  view_count?: number | string | null;
  views_count?: number | string | null;

  favorite_count?: number | string | null;
  favorites_count?: number | string | null;
  favoriteCount?: number | string | null;

  created_at?: string | null;
  createdAt?: string | null;
};

type SellerProfile = {
  user_id: string;
  full_name: string | null;
  username: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  bio: string | null;
  avatar_url: string | null;
  gender: 'male' | 'female' | 'neutral' | string | null;
  account_type: 'buyer' | 'seller' | 'both' | string | null;
  verification_status: 'pending' | 'verified' | 'rejected' | string | null;
  rating: number | null;
  review_count: number | null;
  created_at: string | null;
};

const DEFAULT_PRODUCT_IMAGE = 'https://placehold.co/1000x760?text=La+Segunda';
const DEFAULT_AVATAR = 'https://placehold.co/180x180?text=LS';

function isValidImageUrl(value?: string | null) {
  if (!value) return false;

  const cleanValue = String(value).trim();

  return (
    cleanValue.startsWith('http://') ||
    cleanValue.startsWith('https://') ||
    cleanValue.startsWith('/') ||
    cleanValue.startsWith('data:image') ||
    cleanValue.startsWith('blob:')
  );
}

function parseImages(value?: string[] | string | null): string[] {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  if (typeof value === 'string') {
    const cleanValue = value.trim();

    if (!cleanValue) return [];

    try {
      const parsed = JSON.parse(cleanValue);

      if (Array.isArray(parsed)) {
        return parsed.filter(Boolean);
      }
    } catch {
      return [cleanValue];
    }

    return [cleanValue];
  }

  return [];
}

function getProductImages(product: ProductRow) {
  const imagesFromArray = parseImages(product.images);

  const allImages = [
    product.image_url,
    ...imagesFromArray,
    product.image,
    product.thumbnail_url,
  ].filter(Boolean) as string[];

  const validImages = allImages.filter((image) => isValidImageUrl(image));
  const uniqueImages = Array.from(new Set(validImages));

  return uniqueImages.length > 0 ? uniqueImages : [DEFAULT_PRODUCT_IMAGE];
}

function getProductOwnerId(product: ProductRow) {
  return (
    product.seller_id ||
    product.user_id ||
    product.owner_id ||
    product.sellerId ||
    product.userId ||
    product.ownerId ||
    ''
  );
}

function getProductTitle(product: ProductRow) {
  return product.title || product.name || 'Producto sin nombre';
}

function getProductPrice(product: ProductRow) {
  return Number(product.price || 0);
}

function getProductViews(product: ProductRow) {
  return Number(product.views ?? product.views_count ?? product.view_count ?? 0);
}

function getProductFavorites(product: ProductRow) {
  return Number(
    product.favorite_count ??
      product.favorites_count ??
      product.favoriteCount ??
      0
  );
}

function getStatusLabel(status?: string | null) {
  const value = String(status || 'active').toLowerCase();

  if (value === 'active') return 'Disponible';
  if (value === 'published') return 'Disponible';
  if (value === 'available') return 'Disponible';
  if (value === 'reserved') return 'Reservado';
  if (value === 'sold') return 'Vendido';
  if (value === 'pending') return 'Pendiente';

  return 'Disponible';
}

function getStatusClass(status?: string | null) {
  const value = String(status || 'active').toLowerCase();

  if (value === 'reserved') {
    return 'bg-amber-100 text-amber-800 hover:bg-amber-100';
  }

  if (value === 'sold') {
    return 'bg-slate-700 text-white hover:bg-slate-700';
  }

  if (value === 'pending') {
    return 'bg-slate-100 text-slate-700 hover:bg-slate-100';
  }

  return 'bg-blue-950 text-white hover:bg-blue-950';
}

function formatPhoneForWhatsApp(phone?: string | null) {
  if (!phone) return '';

  const digits = phone.replace(/\D/g, '');

  if (!digits) return '';

  if (digits.startsWith('51')) return digits;

  if (digits.length === 9) return `51${digits}`;

  return digits;
}

function formatDate(date?: string | null) {
  if (!date) return 'Fecha no disponible';

  try {
    return new Date(date).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return 'Fecha no disponible';
  }
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();

  const rawId = (params as any)?.id;
  const productId = Array.isArray(rawId) ? rawId[0] : String(rawId || '');

  const [product, setProduct] = useState<ProductRow | null>(null);
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [copyMessage, setCopyMessage] = useState('');

  useEffect(() => {
    const loadProduct = async () => {
      if (!productId) return;

      setIsLoading(true);
      setErrorMessage('');

      try {
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select('*')
          .eq('id', productId)
          .maybeSingle();

        if (productError) throw productError;

        if (!productData) {
          setProduct(null);
          setErrorMessage('No encontramos este producto.');
          return;
        }

        const currentProduct = productData as ProductRow;

        setProduct(currentProduct);

        const images = getProductImages(currentProduct);
        setSelectedImage(images[0]);

        const ownerId = getProductOwnerId(currentProduct);

        if (ownerId) {
          const { data: sellerData, error: sellerError } = await supabase
            .from('public_seller_profiles')
            .select('*')
            .eq('user_id', ownerId)
            .maybeSingle();

          if (!sellerError && sellerData) {
            setSeller(sellerData as SellerProfile);
          }
        }
      } catch (error: any) {
        console.error('[La Segunda] Error cargando producto:', error?.message);

        setErrorMessage(
          error?.message || 'No se pudo cargar el producto. Intenta nuevamente.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadProduct();
  }, [productId]);

  const productImages = useMemo(() => {
    if (!product) return [DEFAULT_PRODUCT_IMAGE];

    return getProductImages(product);
  }, [product]);

  const sellerName =
    seller?.full_name ||
    seller?.username ||
    product?.seller_name ||
    product?.contact_name ||
    'Vendedor La Segunda';

  const sellerPhone =
    seller?.phone ||
    product?.seller_phone ||
    product?.contact_phone ||
    '';

  const sellerEmail =
    seller?.email ||
    product?.seller_email ||
    product?.contact_email ||
    '';

  const sellerCity = seller?.city || product?.city || 'Perú';

  const whatsappNumber = formatPhoneForWhatsApp(sellerPhone);

  const whatsappText = encodeURIComponent(
    `Hola, vi tu producto "${product ? getProductTitle(product) : ''}" en La Segunda Market y estoy interesado.`
  );

  const whatsappUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${whatsappText}`
    : '';

  const mailtoUrl = sellerEmail
    ? `mailto:${sellerEmail}?subject=${encodeURIComponent(
        'Consulta por producto en La Segunda Market'
      )}&body=${encodeURIComponent(
        `Hola ${sellerName}, vi tu producto "${
          product ? getProductTitle(product) : ''
        }" en La Segunda Market y estoy interesado.`
      )}`
    : '';

  const hasPhone = Boolean(sellerPhone);
  const hasEmail = Boolean(sellerEmail);
  const hasContact = hasPhone || hasEmail || Boolean(whatsappUrl);

  const handleCopyContact = async () => {
    const text = [
      `Producto: ${product ? getProductTitle(product) : ''}`,
      `Vendedor: ${sellerName}`,
      sellerPhone ? `Teléfono: ${sellerPhone}` : '',
      sellerEmail ? `Correo: ${sellerEmail}` : '',
      product?.city || sellerCity ? `Ubicación: ${product?.city || sellerCity}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    try {
      await navigator.clipboard.writeText(text);
      setCopyMessage('Datos copiados correctamente.');

      setTimeout(() => {
        setCopyMessage('');
      }, 2500);
    } catch {
      setCopyMessage('No se pudo copiar la información.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F7F8FB] text-slate-950">
        <Header />

        <main className="mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center px-4 py-10">
          <div className="text-center">
            <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-blue-950" />
            <p className="text-sm text-slate-500">Cargando producto...</p>
          </div>
        </main>
      </div>
    );
  }

  if (errorMessage || !product) {
    return (
      <div className="min-h-screen bg-[#F7F8FB] text-slate-950">
        <Header />

        <main className="mx-auto max-w-7xl px-4 py-10">
          <Card className="rounded-[2rem] border-slate-200 bg-white shadow-sm">
            <CardContent className="p-10 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-red-50 text-red-500">
                <AlertCircle className="h-8 w-8" />
              </div>

              <h1 className="mb-2 text-2xl font-black text-slate-950">
                Producto no encontrado
              </h1>

              <p className="mx-auto mb-6 max-w-md text-slate-500">
                {errorMessage || 'No encontramos este producto.'}
              </p>

              <Link href="/products">
                <Button className="rounded-xl bg-blue-950 hover:bg-blue-900">
                  Ver productos
                </Button>
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const status = String(product.status || 'active').toLowerCase();

  return (
    <div className="min-h-screen bg-[#F7F8FB] text-slate-950">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-5 inline-flex items-center gap-2 rounded-full border bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-950"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </button>

        <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
          {/* GALERÍA Y DESCRIPCIÓN */}
          <section className="space-y-5">
            <Card className="overflow-hidden rounded-[2rem] border-slate-200 bg-white shadow-sm">
              <CardContent className="p-4">
                <div className="overflow-hidden rounded-[1.5rem] bg-slate-100">
                  <img
                    src={selectedImage || DEFAULT_PRODUCT_IMAGE}
                    alt={getProductTitle(product)}
                    className="h-[360px] w-full object-cover md:h-[540px]"
                  />
                </div>

                {productImages.length > 1 && (
                  <div className="mt-4 grid grid-cols-4 gap-3 md:grid-cols-6">
                    {productImages.map((image) => (
                      <button
                        key={image}
                        type="button"
                        onClick={() => setSelectedImage(image)}
                        className={`overflow-hidden rounded-2xl border transition ${
                          selectedImage === image
                            ? 'border-blue-950 ring-2 ring-blue-100'
                            : 'border-slate-200 hover:border-blue-300'
                        }`}
                      >
                        <img
                          src={image}
                          alt="Imagen del producto"
                          className="h-20 w-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-[2rem] border-slate-200 bg-white shadow-sm">
              <CardHeader>
                <div className="mb-3 flex flex-wrap gap-2">
                  <Badge className={getStatusClass(status)}>
                    {getStatusLabel(status)}
                  </Badge>

                  {product.condition && (
                    <Badge variant="outline" className="bg-white">
                      {product.condition}
                    </Badge>
                  )}

                  {product.category && (
                    <Badge variant="outline" className="bg-white">
                      {product.category}
                    </Badge>
                  )}
                </div>

                <CardTitle className="text-3xl font-black leading-tight text-slate-950 md:text-4xl">
                  {getProductTitle(product)}
                </CardTitle>

                <CardDescription className="flex flex-wrap items-center gap-3 pt-2">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {product.city || sellerCity}
                  </span>

                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {formatDate(product.created_at || product.createdAt)}
                  </span>

                  <span className="inline-flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {getProductViews(product)} vistas
                  </span>

                  <span className="inline-flex items-center gap-1">
                    <Heart className="h-4 w-4" />
                    {getProductFavorites(product)} favoritos
                  </span>
                </CardDescription>
              </CardHeader>

              <CardContent>
                <p className="mb-6 text-4xl font-black text-blue-950">
                  S/{' '}
                  {getProductPrice(product).toLocaleString('es-PE', {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2,
                  })}
                </p>

                <div className="rounded-3xl bg-slate-50 p-5">
                  <h3 className="mb-3 text-lg font-black text-slate-950">
                    Descripción del producto
                  </h3>

                  <p className="whitespace-pre-line leading-relaxed text-slate-700">
                    {product.description ||
                      'Este producto no tiene descripción detallada.'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* VENDEDOR */}
          <aside className="space-y-5">
            <Card className="sticky top-24 rounded-[2rem] border-slate-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl font-black text-slate-950">
                  Información del vendedor
                </CardTitle>

                <CardDescription>
                  Revisa los datos y coordina directamente la compra.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 rounded-3xl bg-slate-50 p-4">
                  <img
                    src={
                      seller?.avatar_url && isValidImageUrl(seller.avatar_url)
                        ? seller.avatar_url
                        : DEFAULT_AVATAR
                    }
                    alt={sellerName}
                    className="h-16 w-16 rounded-full object-cover"
                  />

                  <div className="min-w-0">
                    <h2 className="line-clamp-1 text-lg font-black text-slate-950">
                      {sellerName}
                    </h2>

                    <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                      <MapPin className="h-3 w-3" />
                      {sellerCity}
                    </p>

                    <div className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold text-slate-900">
                        {Number(seller?.rating || 0)}
                      </span>
                      <span>({Number(seller?.review_count || 0)} reseñas)</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 rounded-3xl border bg-white p-4">
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Nombre
                    </p>

                    <p className="flex items-center gap-2 font-semibold text-slate-950">
                      <User className="h-4 w-4 text-blue-950" />
                      {sellerName}
                    </p>
                  </div>

                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Teléfono
                    </p>

                    {sellerPhone ? (
                      <a
                        href={`tel:${sellerPhone}`}
                        className="flex items-center gap-2 font-semibold text-blue-950 hover:underline"
                      >
                        <Phone className="h-4 w-4" />
                        {sellerPhone}
                      </a>
                    ) : (
                      <p className="flex items-center gap-2 text-slate-500">
                        <Phone className="h-4 w-4" />
                        No registrado
                      </p>
                    )}
                  </div>

                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Correo
                    </p>

                    {sellerEmail ? (
                      <a
                        href={mailtoUrl}
                        className="flex items-center gap-2 break-all font-semibold text-blue-950 hover:underline"
                      >
                        <Mail className="h-4 w-4 flex-shrink-0" />
                        {sellerEmail}
                      </a>
                    ) : (
                      <p className="flex items-center gap-2 text-slate-500">
                        <Mail className="h-4 w-4" />
                        No registrado
                      </p>
                    )}
                  </div>
                </div>

                {copyMessage && (
                  <div className="rounded-2xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                    {copyMessage}
                  </div>
                )}

                <div className="grid gap-3">
                  {whatsappUrl ? (
                    <a href={whatsappUrl} target="_blank" rel="noreferrer">
                      <Button className="h-12 w-full rounded-xl bg-green-600 text-base hover:bg-green-700">
                        <MessageCircle className="mr-2 h-5 w-5" />
                        Escribir por WhatsApp
                      </Button>
                    </a>
                  ) : (
                    <Button className="h-12 w-full rounded-xl" disabled>
                      <MessageCircle className="mr-2 h-5 w-5" />
                      WhatsApp no disponible
                    </Button>
                  )}

                  <div className="grid gap-3 sm:grid-cols-2">
                    {sellerPhone && (
                      <a href={`tel:${sellerPhone}`}>
                        <Button
                          variant="outline"
                          className="h-11 w-full rounded-xl bg-white"
                        >
                          <Phone className="mr-2 h-4 w-4" />
                          Llamar
                        </Button>
                      </a>
                    )}

                    {sellerEmail && (
                      <a href={mailtoUrl}>
                        <Button
                          variant="outline"
                          className="h-11 w-full rounded-xl bg-white"
                        >
                          <Mail className="mr-2 h-4 w-4" />
                          Correo
                        </Button>
                      </a>
                    )}
                  </div>

                  {hasContact && (
                    <Button
                      variant="outline"
                      className="h-11 w-full rounded-xl bg-white"
                      onClick={handleCopyContact}
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copiar datos
                    </Button>
                  )}
                </div>

                <div className="rounded-3xl border border-blue-100 bg-blue-50/70 p-4 text-sm text-blue-900">
                  <div className="mb-2 flex items-center gap-2 font-black">
                    <ShieldCheck className="h-4 w-4" />
                    Compra con seguridad
                  </div>

                  <p className="leading-relaxed">
                    Verifica el estado del producto, coordina en un lugar seguro
                    y conserva evidencia de la conversación.
                  </p>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>

        {/* CONSEJOS */}
        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border bg-white p-5 shadow-sm">
            <CheckCircle className="mb-3 h-6 w-6 text-green-700" />
            <h3 className="font-black text-slate-950">Revisa bien</h3>
            <p className="mt-1 text-sm text-slate-500">
              Pide fotos reales y valida el estado antes de concretar.
            </p>
          </div>

          <div className="rounded-3xl border bg-white p-5 shadow-sm">
            <CheckCircle className="mb-3 h-6 w-6 text-green-700" />
            <h3 className="font-black text-slate-950">Coordina seguro</h3>
            <p className="mt-1 text-sm text-slate-500">
              Elige lugares públicos y evita adelantos innecesarios.
            </p>
          </div>

          <div className="rounded-3xl border bg-white p-5 shadow-sm">
            <CheckCircle className="mb-3 h-6 w-6 text-green-700" />
            <h3 className="font-black text-slate-950">Guarda evidencia</h3>
            <p className="mt-1 text-sm text-slate-500">
              Conserva mensajes, comprobantes y acuerdos realizados.
            </p>
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="mt-8 overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-950 via-slate-950 to-blue-900 p-8 text-white shadow-xl md:p-10">
          <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <h2 className="text-3xl font-black">
                ¿Tienes algo para vender?
              </h2>

              <p className="mt-2 max-w-2xl text-slate-300">
                Publica tus artículos y permite que otros usuarios te contacten
                directamente.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/seller/dashboard">
                <Button className="rounded-xl bg-orange-600 hover:bg-orange-700">
                  Publicar producto
                </Button>
              </Link>

              <Link href="/products">
                <Button
                  variant="outline"
                  className="rounded-xl border-white/20 bg-white/10 text-white hover:bg-white/20"
                >
                  Ver más productos
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
