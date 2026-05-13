import { supabase } from '@/lib/supabase/client';
import {
  mapSupabaseProduct,
  type SupabaseProduct,
} from '@/lib/supabase/products';

export type FavoriteRow = {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
};

async function getCurrentUserId() {
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    throw new Error('Debes iniciar sesión para usar favoritos.');
  }

  return data.user.id;
}

export async function getProductFavoriteCount(productId: string) {
  const { data, error } = await supabase
    .from('products')
    .select('favorite_count')
    .eq('id', productId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return Number(data?.favorite_count || 0);
}

export async function getMyFavoriteProductIds() {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from('favorites')
    .select('product_id')
    .eq('user_id', userId);

  if (error) {
    throw new Error(error.message);
  }

  return (data || []).map((item) => String(item.product_id));
}

export async function isProductFavorited(productId: string) {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return Boolean(data);
}

export async function toggleFavorite(productId: string) {
  const userId = await getCurrentUserId();

  const { data: existingFavorite, error: selectError } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .maybeSingle();

  if (selectError) {
    throw new Error(selectError.message);
  }

  if (existingFavorite) {
    const { error: deleteError } = await supabase
      .from('favorites')
      .delete()
      .eq('id', existingFavorite.id)
      .eq('user_id', userId);

    if (deleteError) {
      throw new Error(deleteError.message);
    }

    const favoriteCount = await getProductFavoriteCount(productId);

    return {
      favorited: false,
      favoriteCount,
    };
  }

  const { error: insertError } = await supabase.from('favorites').insert({
    user_id: userId,
    product_id: productId,
  });

  if (insertError) {
    if (insertError.code !== '23505') {
      throw new Error(insertError.message);
    }
  }

  const favoriteCount = await getProductFavoriteCount(productId);

  return {
    favorited: true,
    favoriteCount,
  };
}

export async function listFavoriteProducts() {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from('favorites')
    .select(
      `
      id,
      product_id,
      created_at,
      products (*)
    `
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data || [])
    .map((row: any) => {
      const product = Array.isArray(row.products)
        ? row.products[0]
        : row.products;

      if (!product) return null;

      return mapSupabaseProduct(product as SupabaseProduct);
    })
    .filter(Boolean);
}
