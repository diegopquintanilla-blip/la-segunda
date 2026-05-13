import { supabase } from '@/lib/supabase/client';

export type SupabaseProduct = {
  id: string;
  seller_id: string;
  title: string;
  description: string;
  category: string;
  condition: string;
  price: number;
  city: string;
  images: string[];
  status: 'active' | 'sold' | 'reserved' | 'pending';
  views: number;
  favorite_count: number;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
};

export type ProductFormInput = {
  title: string;
  description: string;
  category: string;
  condition: string;
  price: number;
  city: string;
};

const PRODUCT_IMAGES_BUCKET = 'product-images';

function getFileExtension(file: File) {
  const extension = file.name.split('.').pop();

  if (!extension) return 'jpg';

  return extension.toLowerCase();
}

function sanitizeFileName(fileName: string) {
  return fileName
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9.-]/g, '');
}

export function mapSupabaseProduct(product: SupabaseProduct) {
  const images = Array.isArray(product.images) ? product.images : [];

  return {
    id: product.id,
    sellerId: product.seller_id,
    userId: product.seller_id,
    ownerId: product.seller_id,
    title: product.title,
    name: product.title,
    description: product.description,
    category: product.category,
    condition: product.condition,
    price: Number(product.price || 0),
    city: product.city,
    images,
    image: images[0] || '',
    status: product.status,
    views: Number(product.views || 0),
    favoriteCount: Number(product.favorite_count || 0),
    isFeatured: Boolean(product.is_featured),
    createdAt: product.created_at,
    updatedAt: product.updated_at,
  };
}

export async function uploadProductImages(files: File[]) {
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    throw new Error('Debes iniciar sesión para subir imágenes.');
  }

  if (files.length === 0) {
    throw new Error('Adjunta al menos una imagen del producto.');
  }

  if (files.length > 2) {
    throw new Error('Solo puedes adjuntar hasta 2 imágenes.');
  }

  const userId = authData.user.id;
  const uploadedUrls: string[] = [];

  for (const [index, file] of files.entries()) {
    if (!file.type.startsWith('image/')) {
      throw new Error('Solo puedes subir archivos de imagen.');
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Cada imagen no debe superar los 5 MB.');
    }

    const extension = getFileExtension(file);
    const safeName = sanitizeFileName(file.name);
    const finalName = safeName || `producto.${extension}`;

    const filePath = `${userId}/${Date.now()}-${index}-${finalName}`;

    const { error: uploadError } = await supabase.storage
      .from(PRODUCT_IMAGES_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const { data } = supabase.storage
      .from(PRODUCT_IMAGES_BUCKET)
      .getPublicUrl(filePath);

    uploadedUrls.push(data.publicUrl);
  }

  return uploadedUrls;
}

export async function listProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []).map((product) =>
    mapSupabaseProduct(product as SupabaseProduct)
  );
}

export async function listSellerProducts() {
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    throw new Error('Debes iniciar sesión para ver tus productos.');
  }

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('seller_id', authData.user.id)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []).map((product) =>
    mapSupabaseProduct(product as SupabaseProduct)
  );
}

export async function getProductById(productId: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) return null;

  return mapSupabaseProduct(data as SupabaseProduct);
}

export async function createProduct(
  input: ProductFormInput,
  imageFiles: File[]
) {
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    throw new Error('Debes iniciar sesión para publicar un producto.');
  }

  const imageUrls = await uploadProductImages(imageFiles);

  const { data, error } = await supabase
    .from('products')
    .insert({
      seller_id: authData.user.id,
      title: input.title,
      description: input.description,
      category: input.category,
      condition: input.condition,
      price: input.price,
      city: input.city,
      images: imageUrls,
      status: 'active',
      views: 0,
      favorite_count: 0,
      is_featured: false,
    })
    .select('*')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapSupabaseProduct(data as SupabaseProduct);
}

export async function updateProduct(
  productId: string,
  input: ProductFormInput,
  imageFiles: File[]
) {
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    throw new Error('Debes iniciar sesión para actualizar un producto.');
  }

  const updatePayload: Record<string, unknown> = {
    title: input.title,
    description: input.description,
    category: input.category,
    condition: input.condition,
    price: input.price,
    city: input.city,
  };

  if (imageFiles.length > 0) {
    const imageUrls = await uploadProductImages(imageFiles);
    updatePayload.images = imageUrls;
  }

  const { data, error } = await supabase
    .from('products')
    .update(updatePayload)
    .eq('id', productId)
    .eq('seller_id', authData.user.id)
    .select('*')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapSupabaseProduct(data as SupabaseProduct);
}

export async function deleteProduct(productId: string) {
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    throw new Error('Debes iniciar sesión para eliminar un producto.');
  }

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId)
    .eq('seller_id', authData.user.id);

  if (error) {
    throw new Error(error.message);
  }

  return true;
}

export async function markProductAsSold(productId: string) {
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    throw new Error('Debes iniciar sesión para actualizar el producto.');
  }

  const { data, error } = await supabase
    .from('products')
    .update({
      status: 'sold',
    })
    .eq('id', productId)
    .eq('seller_id', authData.user.id)
    .select('*')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapSupabaseProduct(data as SupabaseProduct);
}

export async function incrementProductViews(productId: string) {
  const { error } = await supabase.rpc('increment_product_views', {
    product_id: productId,
  });

  if (error) {
    console.warn('No se pudo incrementar la vista:', error.message);
  }
}
