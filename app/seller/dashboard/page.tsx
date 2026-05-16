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
import { mockOrders } from '@/lib/mock-data';
import {
  createProduct,
  deleteProduct as deleteSupabaseProduct,
  listSellerProducts,
  markProductAsSold,
  updateProduct,
  type ProductFormInput,
} from '@/lib/supabase/products';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import {
  ShoppingBag,
  Eye,
  Heart,
  Plus,
  MoreVertical,
  PackagePlus,
  AlertTriangle,
  CheckCircle,
  Edit3,
  Trash2,
  BadgeCheck,
  X,
  Upload,
  ImageIcon,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Percent,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

type ProductItem = {
  id: string;
  sellerId?: string;
  userId?: string;
  ownerId?: string;
  title: string;
  name?: string;
  description?: string;
  category?: string;
  condition?: string;
  price: number;
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

const CONTACT_SECURITY_WARNING =
  'Por seguridad, está prohibido colocar números móviles, WhatsApp, correos electrónicos o datos de contacto en la descripción. Todo aviso que intente compartir contacto externo será eliminado.';

const PLATFORM_COMMISSION_RATE = 10;

function hasForbiddenContactInfo(value: string) {
  const text = value.toLowerCase();

  const emailRegex = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;

  const peruMobileRegex =
    /(?:\+?51[\s.-]*)?(?:9[\s.-]*\d[\s.-]*\d[\s.-]*\d[\s.-]*\d[\s.-]*\d[\s.-]*\d[\s.-]*\d[\s.-]*\d)/;

  const contactWordsRegex =
    /(whatsapp|wsp|wasap|telegram|gmail|hotmail|outlook|yahoo|correo|email|e-mail|arroba|celular|móvil|movil|teléfono|telefono|contacto|contáctame|contactame|llámame|llamame|escríbeme|escribeme|inbox|dm)/i;

  return (
    emailRegex.test(value) ||
    peruMobileRegex.test(value) ||
    contactWordsRegex.test(text)
  );
}

export default function SellerDashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  const [sellerProducts, setSellerProducts] = useState<ProductItem[]>([]);
  const [isProductsLoading, setIsProductsLoading] = useState(true);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [pageError, setPageError] = useState('');
  const [pageSuccess, setPageSuccess] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState('');

  const [openActionsId, setOpenActionsId] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<ProductItem | null>(null);

  const [productTitle, setProductTitle] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productCategory, setProductCategory] = useState('Electrónica');
  const [productCondition, setProductCondition] = useState('Bueno');
  const [productPrice, setProductPrice] = useState('');
  const [productCity, setProductCity] = useState('');

  const [productImageFiles, setProductImageFiles] = useState<File[]>([]);
  const [productImagePreviews, setProductImagePreviews] = useState<string[]>([]);
  const [productImageNames, setProductImageNames] = useState<string[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  const loadSellerProducts = async () => {
    setIsProductsLoading(true);
    setPageError('');

    try {
      const products = await listSellerProducts();
      setSellerProducts(products as ProductItem[]);
    } catch (error: any) {
      setPageError(
        error?.message || 'No se pudieron cargar tus productos desde Supabase.'
      );
      setSellerProducts([]);
    } finally {
      setIsProductsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      loadSellerProducts();
    }
  }, [isAuthenticated, user]);

  if (!isAuthenticated || !user) {
    return null;
  }

  const publishedCount = sellerProducts.length;
  const canPublish = true;

  const sellerOrders = mockOrders.filter((order) => order.sellerId === user.id);

  const totalRevenue = sellerOrders.reduce((sum, order) => sum + order.amount, 0);

  const totalSales = sellerOrders.filter(
    (order) => order.status === 'completed'
  ).length;

  const totalViews = sellerProducts.reduce(
    (sum: number, product: ProductItem) => sum + Number(product.views || 0),
    0
  );

  const totalFavorites = sellerProducts.reduce(
    (sum: number, product: ProductItem) =>
      sum + Number(product.favoriteCount || 0),
    0
  );

  const commissionEarnings = (totalRevenue * PLATFORM_COMMISSION_RATE) / 100;
  const netEarnings = totalRevenue - commissionEarnings;

  const chartData = useMemo(() => {
    return [
      { month: 'Ene', sales: 0, revenue: 0 },
      { month: 'Feb', sales: 0, revenue: 0 },
      { month: 'Mar', sales: 0, revenue: 0 },
      { month: 'Abr', sales: 0, revenue: 0 },
      { month: 'May', sales: totalSales, revenue: totalRevenue },
      { month: 'Jun', sales: 0, revenue: 0 },
    ];
  }, [totalSales, totalRevenue]);

  const resetForm = () => {
    setProductTitle('');
    setProductDescription('');
    setProductCategory('Electrónica');
    setProductCondition('Bueno');
    setProductPrice('');
    setProductCity('');
    setProductImageFiles([]);
    setProductImagePreviews([]);
    setProductImageNames([]);
    setEditingProduct(null);
    setFormError('');
  };

  const scrollToPublishForm = () => {
    window.setTimeout(() => {
      const formElement = document.getElementById('publicar-nuevo-articulo');

      if (formElement) {
        formElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    }, 250);
  };

  const openPublishForm = () => {
    resetForm();

    setPageError('');
    setPageSuccess('');
    setFormError('');
    setEditingProduct(null);
    setShowForm(true);

    scrollToPublishForm();
  };

  const fillFormForEdit = (product: ProductItem) => {
    const existingImages =
      product.images && product.images.length > 0
        ? product.images.slice(0, 2)
        : product.image
          ? [product.image]
          : [];

    setEditingProduct(product);
    setProductTitle(product.title || product.name || '');
    setProductDescription(product.description || '');
    setProductCategory(product.category || 'Electrónica');
    setProductCondition(product.condition || 'Bueno');
    setProductPrice(String(product.price || ''));
    setProductCity(product.city || '');
    setProductImageFiles([]);
    setProductImagePreviews(existingImages);
    setProductImageNames(
      existingImages.map((_, index) => `Imagen actual ${index + 1}`)
    );
    setFormError('');
    setPageError('');
    setPageSuccess('');
    setShowForm(true);
    setOpenActionsId(null);
    scrollToPublishForm();
  };

  const handleLocalImagesUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormError('');

    const files = Array.from(event.target.files || []);

    if (files.length === 0) return;

    if (files.length > 2) {
      setFormError('Solo puedes adjuntar hasta 2 imágenes por producto.');
      event.target.value = '';
      return;
    }

    const invalidFile = files.find((file) => !file.type.startsWith('image/'));

    if (invalidFile) {
      setFormError('Solo puedes adjuntar archivos de imagen.');
      event.target.value = '';
      return;
    }

    const oversizedFile = files.find((file) => file.size > 5 * 1024 * 1024);

    if (oversizedFile) {
      setFormError('Cada imagen no debe superar los 5 MB.');
      event.target.value = '';
      return;
    }

    const previews = files.map((file) => URL.createObjectURL(file));

    setProductImageFiles(files.slice(0, 2));
    setProductImagePreviews(previews.slice(0, 2));
    setProductImageNames(files.map((file) => file.name).slice(0, 2));

    event.target.value = '';
  };

  const handleRemoveImage = (indexToRemove: number) => {
    if (editingProduct && productImageFiles.length === 0) {
      setFormError(
        'Para cambiar las imágenes actuales, adjunta nuevas imágenes. Las nuevas reemplazarán a las anteriores.'
      );
      return;
    }

    setProductImageFiles((currentFiles) =>
      currentFiles.filter((_, index) => index !== indexToRemove)
    );

    setProductImagePreviews((currentPreviews) =>
      currentPreviews.filter((_, index) => index !== indexToRemove)
    );

    setProductImageNames((currentNames) =>
      currentNames.filter((_, index) => index !== indexToRemove)
    );
  };

  const validateProductForm = () => {
    if (!productTitle.trim()) {
      return 'Ingresa el nombre del producto.';
    }

    if (!productDescription.trim()) {
      return 'Ingresa una descripción del producto.';
    }

    if (hasForbiddenContactInfo(productDescription)) {
      return CONTACT_SECURITY_WARNING;
    }

    if (!productPrice || Number(productPrice) <= 0) {
      return 'Ingresa un precio válido.';
    }

    if (!productCity.trim()) {
      return 'Ingresa la ciudad donde se encuentra el producto.';
    }

    if (!editingProduct && productImageFiles.length === 0) {
      return 'Adjunta al menos una imagen del producto.';
    }

    if (productImageFiles.length > 2) {
      return 'Solo puedes adjuntar hasta 2 imágenes.';
    }

    return '';
  };

  const handleCreateOrUpdateProduct = async (event: React.FormEvent) => {
    event.preventDefault();

    if (isSavingProduct) return;

    setFormError('');
    setPageError('');
    setPageSuccess('');

    const validationError = validateProductForm();

    if (validationError) {
      setFormError(validationError);
      return;
    }

    const input: ProductFormInput = {
      title: productTitle.trim(),
      description: productDescription.trim(),
      category: productCategory,
      condition: productCondition,
      price: Number(productPrice),
      city: productCity.trim(),
    };

    setIsSavingProduct(true);

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, input, productImageFiles);

        setPageSuccess('Producto actualizado correctamente en Supabase.');
      } else {
        await createProduct(input, productImageFiles);

        setPageSuccess('Producto publicado correctamente en Supabase.');
      }

      await loadSellerProducts();

      setShowForm(false);
      resetForm();
    } catch (error: any) {
      setFormError(
        error?.message || 'No se pudo guardar el producto en Supabase.'
      );
    } finally {
      setIsSavingProduct(false);
    }
  };

  const handleMarkAsSold = async (productId: string) => {
    setPageError('');
    setPageSuccess('');

    try {
      await markProductAsSold(productId);
      await loadSellerProducts();

      setPageSuccess('Producto marcado como vendido.');
      setOpenActionsId(null);
    } catch (error: any) {
      setPageError(
        error?.message || 'No se pudo marcar el producto como vendido.'
      );
    }
  };

  const handleDeleteProduct = async () => {
    if (!deleteProduct) return;

    setPageError('');
    setPageSuccess('');

    try {
      await deleteSupabaseProduct(deleteProduct.id);
      await loadSellerProducts();

      setPageSuccess('Producto eliminado correctamente.');
      setDeleteProduct(null);
      setOpenActionsId(null);
    } catch (error: any) {
      setPageError(error?.message || 'No se pudo eliminar el producto.');
    }
  };

  const getProductImage = (product: ProductItem) => {
    return (
      product.images?.[0] ||
      product.image ||
      'https://placehold.co/100x100?text=La+Segunda'
    );
  };

  const getStatusLabel = (status?: string) => {
    if (status === 'sold') return 'Vendido';
    if (status === 'reserved') return 'Reservado';
    if (status === 'pending') return 'Pendiente';
    return 'Activo';
  };

  const getStatusVariant = (status?: string) => {
    if (status === 'sold') return 'secondary';
    if (status === 'pending') return 'outline';
    return 'default';
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Panel de publicaciones</h1>
            <p className="text-muted-foreground">
              Publica productos sin membresía. La comisión se cobra por contacto seguro.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={loadSellerProducts}
              disabled={isProductsLoading}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Actualizar
            </Button>

            <Button
              type="button"
              onClick={openPublishForm}
              disabled={isProductsLoading || isSavingProduct}
            >
              <Plus className="mr-2 h-4 w-4" />
              Publicar artículo
            </Button>
          </div>
        </div>

        {pageSuccess && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700">
            {pageSuccess}
          </div>
        )}

        {pageError && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
            {pageError}
          </div>
        )}

        <Card className="mb-8 border-2">
          <CardHeader>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <PackagePlus className="h-5 w-5 text-primary" />
                  Control de publicaciones
                </CardTitle>
                <CardDescription>
                  Puedes publicar sin membresía. La Segunda Market cobra el 10% cuando un comprador paga el contacto protegido.
                </CardDescription>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge className="bg-blue-100 text-blue-800">
                  Sin membresía
                </Badge>

                <Badge variant="outline">
                  Comisión {PLATFORM_COMMISSION_RATE}%
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="rounded-xl bg-slate-100 p-4">
                <p className="text-sm text-muted-foreground">Modelo actual</p>
                <p className="text-xl font-bold">Comisión por contacto</p>
                <p className="text-sm text-muted-foreground">Sin pago mensual</p>
              </div>

              <div className="rounded-xl bg-slate-100 p-4">
                <p className="text-sm text-muted-foreground">Publicados</p>
                <p className="text-3xl font-bold">{publishedCount}</p>
              </div>

              <div className="rounded-xl bg-slate-100 p-4">
                <p className="text-sm text-muted-foreground">Límite</p>
                <p className="text-3xl font-bold">∞</p>
              </div>

              <div className="rounded-xl bg-slate-100 p-4">
                <p className="text-sm text-muted-foreground">Comisión</p>
                <p className="text-3xl font-bold">{PLATFORM_COMMISSION_RATE}%</p>
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
              <div className="mb-1 flex items-center gap-2 font-semibold">
                <ShieldCheck className="h-4 w-4" />
                Nuevo modelo comercial
              </div>
              Los vendedores pueden publicar productos sin comprar membresías.
              La comisión se cobra cuando el comprador usa el contacto protegido
              y paga mediante Mercado Pago.
            </div>
          </CardContent>
        </Card>

        {showForm && (
          <Card
            id="publicar-nuevo-articulo"
            className="mb-8 scroll-mt-28 border-2 border-primary/20"
          >
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle>
                    {editingProduct ? 'Editar producto' : 'Publicar nuevo artículo'}
                  </CardTitle>
                  <CardDescription>
                    {editingProduct
                      ? 'Actualiza la información del producto publicado.'
                      : 'El producto se guardará en Supabase y las imágenes en Storage.'}
                  </CardDescription>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={isSavingProduct}
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              {formError && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {formError}
                </div>
              )}

              <form onSubmit={handleCreateOrUpdateProduct} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nombre del producto</label>
                    <Input
                      value={productTitle}
                      onChange={(event) => setProductTitle(event.target.value)}
                      placeholder="Ejemplo: iPhone 13 Pro"
                      disabled={isSavingProduct}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Precio</label>
                    <Input
                      type="number"
                      value={productPrice}
                      onChange={(event) => setProductPrice(event.target.value)}
                      placeholder="Ejemplo: 1500"
                      disabled={isSavingProduct}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Descripción</label>

                  <textarea
                    value={productDescription}
                    onChange={(event) => setProductDescription(event.target.value)}
                    placeholder="Describe el estado, uso y detalles del producto"
                    rows={5}
                    disabled={isSavingProduct}
                    className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
                  />

                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                    <div className="mb-1 flex items-center gap-2 font-semibold">
                      <AlertTriangle className="h-4 w-4" />
                      Aviso de seguridad
                    </div>

                    <p>
                      Por seguridad, no coloques números móviles, WhatsApp,
                      correos electrónicos ni datos de contacto. Todo aviso que
                      intente compartir contacto externo será eliminado.
                    </p>
                  </div>

                  {hasForbiddenContactInfo(productDescription) && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                      Se detectó posible información de contacto. Elimina números
                      móviles, correos o referencias a WhatsApp para poder publicar.
                    </div>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Categoría</label>
                    <select
                      value={productCategory}
                      onChange={(event) => setProductCategory(event.target.value)}
                      disabled={isSavingProduct}
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                    >
                      <option>Electrónica</option>
                      <option>Celulares</option>
                      <option>Laptops</option>
                      <option>Ropa</option>
                      <option>Hogar</option>
                      <option>Muebles</option>
                      <option>Vehículos</option>
                      <option>Deportes</option>
                      <option>Música</option>
                      <option>Libros</option>
                      <option>Otros</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Estado</label>
                    <select
                      value={productCondition}
                      onChange={(event) => setProductCondition(event.target.value)}
                      disabled={isSavingProduct}
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                    >
                      <option>Nuevo</option>
                      <option>Como nuevo</option>
                      <option>Bueno</option>
                      <option>Regular</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Ciudad</label>
                    <Input
                      value={productCity}
                      onChange={(event) => setProductCity(event.target.value)}
                      placeholder="Ejemplo: Lima"
                      disabled={isSavingProduct}
                    />
                  </div>
                </div>

                <div className="space-y-3 rounded-xl border border-dashed bg-slate-50 p-4">
                  <div>
                    <label className="text-sm font-medium">
                      Adjuntar imágenes del producto
                    </label>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Puedes adjuntar hasta 2 imágenes. Se subirán a Supabase Storage.
                      JPG, PNG o WEBP. Máximo 5 MB por imagen.
                    </p>
                  </div>

                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border bg-white p-6 text-center transition hover:bg-slate-100">
                    <Upload className="mb-2 h-8 w-8 text-primary" />
                    <span className="text-sm font-semibold">
                      Haz clic para adjuntar hasta 2 imágenes
                    </span>
                    <span className="mt-1 text-xs text-muted-foreground">
                      {editingProduct
                        ? 'Si adjuntas nuevas imágenes, reemplazarán a las actuales'
                        : 'Selecciona una o dos imágenes del producto'}
                    </span>

                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      multiple
                      onChange={handleLocalImagesUpload}
                      disabled={isSavingProduct}
                      className="hidden"
                    />
                  </label>

                  {productImageNames.length > 0 && (
                    <div className="space-y-2">
                      {productImageNames.map((imageName, index) => (
                        <div
                          key={`${imageName}-${index}`}
                          className="flex items-center justify-between rounded-lg border bg-white px-3 py-2 text-sm text-slate-700"
                        >
                          <span>
                            Imagen {index + 1}: <strong>{imageName}</strong>
                          </span>

                          <button
                            type="button"
                            disabled={isSavingProduct}
                            onClick={() => handleRemoveImage(index)}
                            className="text-xs font-semibold text-red-600 hover:text-red-700 disabled:opacity-50"
                          >
                            Quitar
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {productImagePreviews.length > 0 ? (
                    <div className="rounded-xl border bg-white p-3">
                      <p className="mb-3 text-xs font-medium text-muted-foreground">
                        Vista previa:
                      </p>

                      <div className="grid gap-3 sm:grid-cols-2">
                        {productImagePreviews.map((image, index) => (
                          <div key={`${image}-${index}`} className="relative">
                            <img
                              src={image}
                              alt={`Vista previa ${index + 1}`}
                              className="h-40 w-full rounded-lg border object-cover"
                            />

                            <span className="absolute left-2 top-2 rounded-full bg-black/70 px-2 py-1 text-xs font-semibold text-white">
                              Imagen {index + 1}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 rounded-lg border bg-white px-3 py-2 text-sm text-muted-foreground">
                      <ImageIcon className="h-4 w-4" />
                      Aún no has adjuntado imágenes.
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button type="submit" disabled={isSavingProduct}>
                    {isSavingProduct ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        {editingProduct ? 'Guardar cambios' : 'Publicar producto'}
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    disabled={isSavingProduct}
                    onClick={() => {
                      setShowForm(false);
                      resetForm();
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Ingresos totales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                S/ {totalRevenue.toLocaleString()}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Estimado según ventas registradas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Ventas completadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSales}</div>
              <p className="mt-1 text-xs text-muted-foreground">
                {sellerOrders.length} total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Vistas totales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalViews.toLocaleString()}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                De {sellerProducts.length} productos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Favoritos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalFavorites.toLocaleString()}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Guardados por compradores
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mb-8 grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Ventas mensuales</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="sales" fill="var(--color-primary)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ingresos mensuales</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--color-primary)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="mb-8 grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Modelo comercial</CardTitle>
              <CardDescription>
                Ya no existen membresías ni límites por plan.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 p-4">
                <div>
                  <div className="font-semibold">
                    Comisión por contacto seguro
                  </div>
                  <div className="text-sm text-muted-foreground">
                    El comprador paga el 10% del precio del producto para contactar al vendedor.
                  </div>
                </div>

                <Badge className="bg-blue-100 text-blue-800">
                  {PLATFORM_COMMISSION_RATE}%
                </Badge>
              </div>

              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
                <div className="mb-1 flex items-center gap-2 font-semibold">
                  <Percent className="h-4 w-4" />
                  Ejemplo
                </div>
                Producto de S/ 100 → contacto seguro de S/ 10 mediante Mercado Pago.
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resumen de ganancias</CardTitle>
              <CardDescription>Período actual</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ingresos brutos:</span>
                  <span className="font-medium">
                    S/ {totalRevenue.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Comisión estimada ({PLATFORM_COMMISSION_RATE}%):
                  </span>
                  <span className="font-medium">
                    S/ {commissionEarnings.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between border-t pt-2">
                  <span className="font-semibold">Referencia neta:</span>
                  <span className="font-bold text-primary">
                    S/ {netEarnings.toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Mis productos</CardTitle>
              <CardDescription>
                Administra tus productos publicados en Supabase.
              </CardDescription>
            </div>

            <Button
              type="button"
              size="sm"
              onClick={openPublishForm}
              disabled={isProductsLoading || isSavingProduct}
            >
              <Plus className="mr-1 h-4 w-4" />
              Nuevo
            </Button>
          </CardHeader>

          <CardContent>
            {isProductsLoading ? (
              <div className="py-12 text-center text-muted-foreground">
                <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin" />
                Cargando tus productos...
              </div>
            ) : sellerProducts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr>
                      <th className="p-2 text-left">Producto</th>
                      <th className="p-2 text-left">Precio</th>
                      <th className="p-2 text-left">Vistas</th>
                      <th className="p-2 text-left">Favoritos</th>
                      <th className="p-2 text-left">Estado</th>
                      <th className="p-2 text-left">Acciones</th>
                    </tr>
                  </thead>

                  <tbody>
                    {sellerProducts.map((product) => (
                      <tr key={product.id} className="border-b hover:bg-muted/50">
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            <img
                              src={getProductImage(product)}
                              alt={product.title}
                              className="h-10 w-10 rounded object-cover"
                            />
                            <span className="line-clamp-1 font-medium">
                              {product.title}
                            </span>
                          </div>
                        </td>

                        <td className="p-2">
                          S/ {Number(product.price || 0).toLocaleString()}
                        </td>

                        <td className="p-2">
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4 text-muted-foreground" />
                            {product.views || 0}
                          </div>
                        </td>

                        <td className="p-2">
                          <div className="flex items-center gap-1">
                            <Heart className="h-4 w-4 text-muted-foreground" />
                            {product.favoriteCount || 0}
                          </div>
                        </td>

                        <td className="p-2">
                          <Badge variant={getStatusVariant(product.status) as any}>
                            {getStatusLabel(product.status)}
                          </Badge>
                        </td>

                        <td className="relative p-2">
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={() =>
                              setOpenActionsId(
                                openActionsId === product.id ? null : product.id
                              )
                            }
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>

                          {openActionsId === product.id && (
                            <div className="absolute right-2 top-10 z-20 w-52 overflow-hidden rounded-xl border bg-white shadow-lg">
                              <button
                                type="button"
                                onClick={() => fillFormForEdit(product)}
                                className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm hover:bg-slate-100"
                              >
                                <Edit3 className="h-4 w-4 text-blue-600" />
                                Editar
                              </button>

                              <button
                                type="button"
                                onClick={() => handleMarkAsSold(product.id)}
                                className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm hover:bg-slate-100"
                              >
                                <BadgeCheck className="h-4 w-4 text-green-600" />
                                Marcar como vendido
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setDeleteProduct(product);
                                  setOpenActionsId(null);
                                }}
                                className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                                Eliminar
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center">
                <ShoppingBag className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <p className="mb-4 text-muted-foreground">
                  Aún no has publicado productos.
                </p>

                <Button type="button" onClick={openPublishForm}>
                  Publicar primer producto
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Órdenes recientes</CardTitle>
            <CardDescription>Tus últimas ventas registradas.</CardDescription>
          </CardHeader>

          <CardContent>
            {sellerOrders.length > 0 ? (
              <div className="space-y-4">
                {sellerOrders.map((order) => {
                  return (
                    <div
                      key={order.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div>
                        <h4 className="font-semibold">Producto vendido</h4>
                        <p className="text-sm text-muted-foreground">
                          Orden {order.id} • {order.createdAt}
                        </p>
                      </div>

                      <div className="text-right">
                        <div className="font-bold">
                          S/ {order.amount.toLocaleString()}
                        </div>

                        <Badge
                          variant={
                            order.status === 'completed'
                              ? 'default'
                              : 'secondary'
                          }
                        >
                          {order.status === 'completed'
                            ? 'Completada'
                            : order.status === 'pending'
                              ? 'Pendiente'
                              : 'Cancelada'}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="py-8 text-center text-muted-foreground">
                Aún no tienes órdenes.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {deleteProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Eliminar producto</CardTitle>
              <CardDescription>
                Esta acción eliminará el producto de Supabase.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="rounded-xl border bg-slate-50 p-4">
                <p className="font-semibold">{deleteProduct.title}</p>
                <p className="text-sm text-muted-foreground">
                  S/ {Number(deleteProduct.price || 0).toLocaleString()}
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  className="w-full bg-red-600 hover:bg-red-700"
                  onClick={handleDeleteProduct}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Sí, eliminar
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setDeleteProduct(null)}
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
