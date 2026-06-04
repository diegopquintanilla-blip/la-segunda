'use client';

import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useMemo,
  useState,
} from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle,
  Eye,
  ImagePlus,
  Loader2,
  Mail,
  MapPin,
  PackagePlus,
  Phone,
  Save,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  User,
} from 'lucide-react';

import { Header } from '@/components/header';
import { useAuth } from '@/lib/auth-context';
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

type SellerProfile = {
  id?: string | null;
  user_id?: string | null;
  full_name?: string | null;
  username?: string | null;
  email?: string | null;
  phone?: string | null;
  city?: string | null;
  avatar_url?: string | null;
};

type ProductRow = {
  id: string;
  seller_id?: string | null;
  user_id?: string | null;
  owner_id?: string | null;
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
  views?: number | string | null;
  view_count?: number | string | null;
  views_count?: number | string | null;
  favorite_count?: number | string | null;
  favorites_count?: number | string | null;
  favoriteCount?: number | string | null;
  created_at?: string | null;
  createdAt?: string | null;
};

const DEFAULT_PRODUCT_IMAGE = 'https://placehold.co/700x520?text=La+Segunda';

const CATEGORIES = [
  'Celulares',
  'Tecnología',
  'Laptops',
  'Hogar',
  'Muebles',
  'Electrodomésticos',
  'Ropa',
  'Calzado',
  'Vehículos',
  'Herramientas',
  'Deportes',
  'Otros',
];

const CONDITIONS = ['Nuevo', 'Como nuevo', 'Bueno', 'Regular'];

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

function getProductTitle(product: ProductRow) {
  return product.title || product.name || 'Producto sin nombre';
}

function getProductImage(product: ProductRow) {
  const images = parseImages(product.images);

  const image =
    product.image_url ||
    images[0] ||
    product.image ||
    product.thumbnail_url ||
    '';

  return isValidImageUrl(image) ? image : DEFAULT_PRODUCT_IMAGE;
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

function getProductDate(product: ProductRow) {
  return new Date(product.created_at || product.createdAt || 0).getTime();
}

function formatDate(date?: string | null) {
  if (!date) return 'Fecha no disponible';

  try {
    return new Date(date).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return 'Fecha no disponible';
  }
}

function getStatusLabel(status?: string | null) {
  const value = String(status || 'active').toLowerCase();

  if (value === 'active') return 'Disponible';
  if (value === 'published') return 'Disponible';
  if (value === 'available') return 'Disponible';
  if (value === 'reserved') return 'Reservado';
  if (value === 'sold') return 'Vendido';
  if (value === 'pending') return 'Pendiente';
  if (value === 'inactive') return 'Inactivo';

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

export default function SellerDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  const currentUser = user as any;

  const [profile, setProfile] = useState<SellerProfile | null>(null);
  const [sellerProducts, setSellerProducts] = useState<ProductRow[]>([]);

  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isDeletingProductId, setIsDeletingProductId] = useState<string | null>(
    null
  );

  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Celulares');
  const [condition, setCondition] = useState('Bueno');
  const [price, setPrice] = useState('');
  const [city, setCity] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) return;

      setIsLoadingData(true);
      setErrorMessage('');

      try {
        let loadedProfile: SellerProfile | null = null;

        const profileByUserId = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!profileByUserId.error && profileByUserId.data) {
          loadedProfile = profileByUserId.data as SellerProfile;
        }

        if (!loadedProfile) {
          const profileById = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();

          if (!profileById.error && profileById.data) {
            loadedProfile = profileById.data as SellerProfile;
          }
        }

        setProfile(loadedProfile);

        const loadedCity =
          loadedProfile?.city || currentUser?.city || currentUser?.location || '';

        setCity(loadedCity);

        const { data: productsBySellerId, error: sellerIdError } =
          await supabase
            .from('products')
            .select('*')
            .eq('seller_id', user.id)
            .order('created_at', { ascending: false });

        if (!sellerIdError && Array.isArray(productsBySellerId)) {
          setSellerProducts(productsBySellerId as ProductRow[]);
          return;
        }

        const { data: allProducts, error: allProductsError } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (allProductsError) {
          throw allProductsError;
        }

        const filteredProducts = ((allProducts || []) as ProductRow[]).filter(
          (product) => {
            return (
              product.seller_id === user.id ||
              product.user_id === user.id ||
              product.owner_id === user.id
            );
          }
        );

        setSellerProducts(filteredProducts);
      } catch (error: any) {
        console.error('[La Segunda] Error cargando panel:', error?.message);

        setErrorMessage(
          error?.message || 'No se pudo cargar tu panel de vendedor.'
        );
      } finally {
        setIsLoadingData(false);
      }
    };

    if (isAuthenticated && user?.id) {
      loadData();
    }
  }, [isAuthenticated, user?.id, currentUser?.city, currentUser?.location]);

  const sellerName =
    profile?.full_name ||
    profile?.username ||
    currentUser?.name ||
    currentUser?.email?.split('@')?.[0] ||
    'Vendedor La Segunda';

  const sellerEmail = profile?.email || currentUser?.email || '';
  const sellerPhone = profile?.phone || currentUser?.phone || '';
  const sellerCity = profile?.city || currentUser?.city || city || 'Perú';

  const hasPublicContact = Boolean(sellerName && sellerEmail && sellerPhone);

  const previewImage = useMemo(() => {
    return isValidImageUrl(imageUrl) ? imageUrl : DEFAULT_PRODUCT_IMAGE;
  }, [imageUrl]);

  const sortedProducts = useMemo(() => {
    return [...sellerProducts].sort((a, b) => getProductDate(b) - getProductDate(a));
  }, [sellerProducts]);

  const totalViews = sortedProducts.reduce(
    (sum, product) => sum + getProductViews(product),
    0
  );

  const totalFavorites = sortedProducts.reduce(
    (sum, product) => sum + getProductFavorites(product),
    0
  );

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('Celulares');
    setCondition('Bueno');
    setPrice('');
    setImageUrl('');
  };

  const handleUploadImage = async (event: ChangeEvent<HTMLInputElement>) => {
    setMessage('');
    setErrorMessage('');

    const file = event.target.files?.[0];

    if (!file) return;

    if (!user?.id) {
      setErrorMessage('Debes iniciar sesión para subir imágenes.');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Solo puedes subir archivos de imagen.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('La imagen no debe superar los 5 MB.');
      return;
    }

    setIsUploadingImage(true);

    try {
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `product-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      setImageUrl(data.publicUrl);
      setMessage('Imagen cargada correctamente.');
    } catch (error: any) {
      console.error('[La Segunda] Error subiendo imagen:', error?.message);

      setErrorMessage(
        error?.message ||
          'No se pudo subir la imagen. Verifica que exista el bucket product-images en Supabase.'
      );
    } finally {
      setIsUploadingImage(false);
      event.target.value = '';
    }
  };

  const handleCreateProduct = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setMessage('');
    setErrorMessage('');

    if (!user?.id) {
      setErrorMessage('Debes iniciar sesión para publicar un producto.');
      return;
    }

    if (!title.trim()) {
      setErrorMessage('Ingresa el nombre del producto.');
      return;
    }

    if (!description.trim()) {
      setErrorMessage('Ingresa una descripción del producto.');
      return;
    }

    if (!price || Number(price) <= 0) {
      setErrorMessage('Ingresa un precio válido.');
      return;
    }

    if (!city.trim()) {
      setErrorMessage('Ingresa la ciudad del producto.');
      return;
    }

    if (!hasPublicContact) {
      setErrorMessage(
        'Completa tu nombre, correo y teléfono en tu perfil antes de publicar.'
      );
      return;
    }

    setIsSaving(true);

    try {
      const finalImage = imageUrl.trim();

      const payload = {
        seller_id: user.id,
        title: title.trim(),
        description: description.trim(),
        category,
        condition,
        price: Number(price),
        city: city.trim(),
        status: 'active',
        images: finalImage ? [finalImage] : [],
        image_url: finalImage || null,
        views: 0,
        favorite_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('products')
        .insert(payload)
        .select('*')
        .single();

      if (error) {
        throw error;
      }

      const newProduct = data as ProductRow;

      setSellerProducts((currentProducts) => [newProduct, ...currentProducts]);
      setMessage('Producto publicado correctamente.');

      resetForm();

      setTimeout(() => {
        router.push(`/product/${newProduct.id}`);
      }, 900);
    } catch (error: any) {
      console.error('[La Segunda] Error publicando producto:', error?.message);

      setErrorMessage(
        error?.message || 'No se pudo publicar el producto. Intenta nuevamente.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    const confirmed = window.confirm(
      '¿Seguro que deseas eliminar este producto?'
    );

    if (!confirmed) return;

    setIsDeletingProductId(productId);
    setMessage('');
    setErrorMessage('');

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) {
        throw error;
      }

      setSellerProducts((currentProducts) =>
        currentProducts.filter((product) => product.id !== productId)
      );

      setMessage('Producto eliminado correctamente.');
    } catch (error: any) {
      setErrorMessage(
        error?.message || 'No se pudo eliminar el producto. Intenta nuevamente.'
      );
    } finally {
      setIsDeletingProductId(null);
    }
  };

  if (isLoading || !isAuthenticated || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F8FB]">
        <div className="text-center">
          <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-blue-950" />
          <p className="text-sm text-slate-500">
            Cargando panel de vendedor...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F8FB] text-slate-950">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-6">
        {/* CABECERA */}
        <section className="mb-6 overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-6 text-white shadow-xl md:p-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_390px] lg:items-center">
            <div>
              <h1 className="max-w-3xl text-3xl font-black leading-tight tracking-tight md:text-5xl">
                Publica tus productos y conecta con compradores
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-200 md:text-lg">
                Sube fotos, agrega precio, describe el estado del artículo y
                permite que usuarios interesados se comuniquen contigo.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <a href="#publicar">
                  <Button
                    size="lg"
                    className="h-12 rounded-xl bg-orange-600 px-6 text-base hover:bg-orange-700"
                  >
                    <PackagePlus className="mr-2 h-5 w-5" />
                    Crear publicación
                  </Button>
                </a>

                <Link href="/products">
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-12 rounded-xl border-white/20 bg-white/10 px-6 text-base text-white hover:bg-white/20"
                  >
                    Ver productos
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
              <p className="mb-4 text-sm font-medium text-slate-200">
                Tu resumen
              </p>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-2xl font-black">{sortedProducts.length}</p>
                  <p className="mt-1 text-xs text-slate-300">Productos</p>
                </div>

                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-2xl font-black">{totalViews}</p>
                  <p className="mt-1 text-xs text-slate-300">Vistas</p>
                </div>

                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-2xl font-black">{totalFavorites}</p>
                  <p className="mt-1 text-xs text-slate-300">Favoritos</p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl bg-white/10 p-4 text-sm text-slate-200">
                <p className="mb-2 font-semibold text-white">
                  Datos de vendedor
                </p>

                <div className="space-y-2">
                  <p className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {sellerName}
                  </p>

                  <p className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {sellerPhone || 'Teléfono pendiente'}
                  </p>

                  <p className="flex items-center gap-2 break-all">
                    <Mail className="h-4 w-4 flex-shrink-0" />
                    {sellerEmail || 'Correo pendiente'}
                  </p>
                </div>

                {!hasPublicContact && (
                  <Link href="/profile">
                    <Button className="mt-4 w-full rounded-xl bg-orange-600 hover:bg-orange-700">
                      Completar perfil
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>

        {message && (
          <div className="mb-5 flex items-center gap-2 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            <CheckCircle className="h-4 w-4" />
            {message}
          </div>
        )}

        {errorMessage && (
          <div className="mb-5 flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle className="h-4 w-4" />
            {errorMessage}
          </div>
        )}

        {isLoadingData ? (
          <div className="flex min-h-[45vh] items-center justify-center rounded-[2rem] border border-dashed bg-white">
            <div className="text-center">
              <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-blue-950" />
              <p className="text-sm text-slate-500">
                Cargando información...
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_390px]">
            {/* FORMULARIO */}
            <Card
              id="publicar"
              className="rounded-[2rem] border-slate-200 bg-white shadow-sm"
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl font-black text-slate-950">
                  <PackagePlus className="h-6 w-6 text-blue-950" />
                  Crear nueva publicación
                </CardTitle>

                <CardDescription>
                  Completa la información principal para que tu producto se vea
                  claro y confiable.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleCreateProduct} className="space-y-5">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-semibold text-slate-700">
                        Nombre del producto
                      </label>

                      <input
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                        placeholder="Ejemplo: iPhone 12 Pro 128GB"
                        className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-blue-950 focus:bg-white focus:ring-2 focus:ring-blue-100"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-semibold text-slate-700">
                        Descripción
                      </label>

                      <textarea
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        placeholder="Describe el estado, tiempo de uso, accesorios incluidos, detalles importantes y condiciones de entrega..."
                        className="min-h-32 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-950 focus:bg-white focus:ring-2 focus:ring-blue-100"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">
                        Precio
                      </label>

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={price}
                        onChange={(event) => setPrice(event.target.value)}
                        placeholder="Ejemplo: 950"
                        className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-blue-950 focus:bg-white focus:ring-2 focus:ring-blue-100"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">
                        Ciudad
                      </label>

                      <input
                        value={city}
                        onChange={(event) => setCity(event.target.value)}
                        placeholder="Ejemplo: Lima"
                        className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-blue-950 focus:bg-white focus:ring-2 focus:ring-blue-100"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">
                        Categoría
                      </label>

                      <select
                        value={category}
                        onChange={(event) => setCategory(event.target.value)}
                        className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-blue-950 focus:bg-white focus:ring-2 focus:ring-blue-100"
                      >
                        {CATEGORIES.map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">
                        Estado físico
                      </label>

                      <select
                        value={condition}
                        onChange={(event) => setCondition(event.target.value)}
                        className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-blue-950 focus:bg-white focus:ring-2 focus:ring-blue-100"
                      >
                        {CONDITIONS.map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-semibold text-slate-700">
                        Foto del producto
                      </label>

                      <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center transition hover:border-blue-300 hover:bg-blue-50">
                        {isUploadingImage ? (
                          <Loader2 className="mb-3 h-8 w-8 animate-spin text-blue-950" />
                        ) : (
                          <Upload className="mb-3 h-8 w-8 text-blue-950" />
                        )}

                        <span className="font-semibold text-slate-950">
                          {isUploadingImage
                            ? 'Subiendo imagen...'
                            : 'Subir imagen'}
                        </span>

                        <span className="mt-1 text-sm text-slate-500">
                          JPG, PNG o WEBP hasta 5 MB
                        </span>

                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleUploadImage}
                          disabled={isUploadingImage}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-semibold text-slate-700">
                        URL de imagen
                      </label>

                      <input
                        value={imageUrl}
                        onChange={(event) => setImageUrl(event.target.value)}
                        placeholder="https://..."
                        className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-blue-950 focus:bg-white focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                  </div>

                  <div className="rounded-3xl border border-blue-100 bg-blue-50/70 p-4 text-sm text-blue-900">
                    <div className="mb-2 flex items-center gap-2 font-black">
                      <ShieldCheck className="h-4 w-4" />
                      Recomendación
                    </div>

                    <p className="leading-relaxed">
                      Usa fotos reales, escribe una descripción clara y coloca
                      un precio competitivo. Eso aumenta la confianza del
                      comprador.
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button
                      type="submit"
                      disabled={isSaving || isUploadingImage || !hasPublicContact}
                      className="h-12 rounded-xl bg-blue-950 px-6 text-base hover:bg-blue-900"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Publicando...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-5 w-5" />
                          Publicar producto
                        </>
                      )}
                    </Button>

                    <Link href="/products">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-12 rounded-xl bg-white px-6 text-base"
                      >
                        Ver publicaciones
                      </Button>
                    </Link>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* SIDEBAR */}
            <aside className="space-y-5">
              <Card className="rounded-[2rem] border-slate-200 bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-black text-slate-950">
                    Vista previa
                  </CardTitle>

                  <CardDescription>
                    Así se verá tu producto en la plataforma.
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="overflow-hidden rounded-3xl border bg-white">
                    <div className="relative h-56 bg-slate-100">
                      <img
                        src={previewImage}
                        alt="Vista previa"
                        className="h-full w-full object-cover"
                      />

                      <Badge className="absolute left-4 top-4 bg-blue-950 text-white hover:bg-blue-950">
                        Disponible
                      </Badge>
                    </div>

                    <div className="p-5">
                      <h3 className="line-clamp-1 text-lg font-black text-slate-950">
                        {title || 'Nombre del producto'}
                      </h3>

                      <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                        {description ||
                          'Agrega una descripción clara para generar confianza.'}
                      </p>

                      <p className="mt-4 text-3xl font-black text-blue-950">
                        S/{' '}
                        {Number(price || 0).toLocaleString('es-PE', {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 2,
                        })}
                      </p>

                      <p className="mt-2 flex items-center gap-1 text-sm text-slate-500">
                        <MapPin className="h-4 w-4" />
                        {city || sellerCity}
                      </p>

                      <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm">
                        <p className="mb-2 font-black text-slate-950">
                          Vendedor
                        </p>

                        <div className="space-y-2 text-slate-600">
                          <p className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            {sellerName}
                          </p>

                          <p className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            {sellerPhone || 'Teléfono pendiente'}
                          </p>

                          <p className="flex items-center gap-2 break-all">
                            <Mail className="h-4 w-4 flex-shrink-0" />
                            {sellerEmail || 'Correo pendiente'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-[2rem] border-slate-200 bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-black text-slate-950">
                    Consejos para vender mejor
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="flex gap-3 rounded-2xl bg-slate-50 p-4">
                    <ImagePlus className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-950" />
                    <p className="text-sm text-slate-600">
                      Usa una foto limpia, bien iluminada y sin fondos
                      distractores.
                    </p>
                  </div>

                  <div className="flex gap-3 rounded-2xl bg-slate-50 p-4">
                    <Sparkles className="mt-0.5 h-5 w-5 flex-shrink-0 text-orange-600" />
                    <p className="text-sm text-slate-600">
                      Describe detalles reales: estado, tiempo de uso, accesorios
                      y motivo de venta.
                    </p>
                  </div>

                  <div className="flex gap-3 rounded-2xl bg-slate-50 p-4">
                    <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-700" />
                    <p className="text-sm text-slate-600">
                      Coloca un precio competitivo para recibir más consultas.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </aside>
          </div>
        )}

        {/* MIS PRODUCTOS */}
        <section className="mt-8">
          <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-2xl font-black text-slate-950 md:text-3xl">
                Mis publicaciones
              </h2>

              <p className="text-sm text-slate-500">
                Administra los productos que tienes publicados.
              </p>
            </div>

            <Link href="/profile">
              <Button variant="outline" className="rounded-xl bg-white">
                Editar datos de vendedor
              </Button>
            </Link>
          </div>

          {sortedProducts.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {sortedProducts.map((product) => {
                const image = getProductImage(product);

                return (
                  <Card
                    key={product.id}
                    className="overflow-hidden rounded-3xl border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="relative h-52 bg-slate-100">
                      <img
                        src={image}
                        alt={getProductTitle(product)}
                        className="h-full w-full object-cover"
                      />

                      <Badge
                        className={`absolute left-4 top-4 ${getStatusClass(
                          product.status
                        )}`}
                      >
                        {getStatusLabel(product.status)}
                      </Badge>
                    </div>

                    <CardContent className="p-5">
                      <h3 className="line-clamp-1 text-lg font-black text-slate-950">
                        {getProductTitle(product)}
                      </h3>

                      <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                        {product.description ||
                          'Producto publicado en La Segunda Market.'}
                      </p>

                      <p className="mt-4 text-2xl font-black text-blue-950">
                        S/{' '}
                        {getProductPrice(product).toLocaleString('es-PE', {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 2,
                        })}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {product.city || 'Perú'}
                        </span>

                        <span className="inline-flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {getProductViews(product)}
                        </span>

                        <span>{formatDate(product.created_at || product.createdAt)}</span>
                      </div>

                      <div className="mt-5 grid grid-cols-[1fr_auto] gap-2">
                        <Link href={`/product/${product.id}`}>
                          <Button className="w-full rounded-xl bg-blue-950 hover:bg-blue-900">
                            Ver producto
                          </Button>
                        </Link>

                        <Button
                          variant="outline"
                          disabled={isDeletingProductId === product.id}
                          className="rounded-xl bg-white px-3 text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          {isDeletingProductId === product.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="rounded-[2rem] border-slate-200 bg-white shadow-sm">
              <CardContent className="p-10 text-center">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-500">
                  <PackagePlus className="h-8 w-8" />
                </div>

                <h3 className="mb-2 text-2xl font-black text-slate-950">
                  Aún no tienes publicaciones
                </h3>

                <p className="mx-auto mb-6 max-w-md text-slate-500">
                  Publica tu primer producto para empezar a recibir consultas de
                  compradores interesados.
                </p>

                <a href="#publicar">
                  <Button className="rounded-xl bg-blue-950 hover:bg-blue-900">
                    Crear mi primera publicación
                  </Button>
                </a>
              </CardContent>
            </Card>
          )}
        </section>
      </main>
    </div>
  );
}
