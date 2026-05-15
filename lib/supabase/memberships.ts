import { supabase } from '@/lib/supabase/client';

export type MembershipPlanId = 'free' | 'plus' | 'premium';

export type MembershipPlan = {
  id: MembershipPlanId;
  name: string;
  description?: string | null;
  price: number;
  currency: string;
  listing_limit: number | null;
  commission_rate: number;
  is_active: boolean;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
};

export type UserMembership = {
  user_id: string;
  plan_id: MembershipPlanId;
  plan_name: string;
  status: 'active' | 'inactive' | 'expired' | 'cancelled' | 'pending_payment';
  price: number;
  currency: string;
  listing_limit: number | null;
  commission_rate: number;
  started_at: string;
  expires_at: string | null;
};

export type NormalizedMembership = {
  planId: MembershipPlanId;
  planName: string;
  status: string;
  price: number;
  currency: string;
  listingLimit: number;
  hasUnlimitedPosts: boolean;
  commissionRate: number;
  startedAt: string | null;
  expiresAt: string | null;
};

export const DEFAULT_FREE_MEMBERSHIP: NormalizedMembership = {
  planId: 'free',
  planName: 'Plan Gratis',
  status: 'active',
  price: 0,
  currency: 'PEN',
  listingLimit: 3,
  hasUnlimitedPosts: false,
  commissionRate: 8,
  startedAt: null,
  expiresAt: null,
};

export function normalizeMembership(
  membership: UserMembership | null
): NormalizedMembership {
  if (!membership) {
    return DEFAULT_FREE_MEMBERSHIP;
  }

  const hasUnlimitedPosts =
    membership.plan_id === 'premium' || membership.listing_limit === null;

  return {
    planId: membership.plan_id,
    planName: membership.plan_name,
    status: membership.status,
    price: Number(membership.price || 0),
    currency: membership.currency || 'PEN',
    listingLimit: hasUnlimitedPosts
      ? Infinity
      : Number(membership.listing_limit || 3),
    hasUnlimitedPosts,
    commissionRate: Number(membership.commission_rate || 8),
    startedAt: membership.started_at || null,
    expiresAt: membership.expires_at || null,
  };
}

export async function getCurrentUserId() {
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    throw new Error('Debes iniciar sesión para consultar tu membresía.');
  }

  return data.user.id;
}

export async function ensureCurrentUserFreeMembership() {
  const userId = await getCurrentUserId();

  const { error } = await supabase.rpc('ensure_free_membership', {
    target_user_id: userId,
  });

  if (error) {
    throw new Error(error.message);
  }

  return true;
}

export async function getMyMembership() {
  const { data, error } = await supabase.rpc('get_my_membership');

  if (error) {
    throw new Error(error.message);
  }

  const membership = Array.isArray(data) && data.length > 0
    ? (data[0] as UserMembership)
    : null;

  return normalizeMembership(membership);
}

export async function getMyMembershipOrCreateFree() {
  try {
    const membership = await getMyMembership();

    if (membership) {
      return membership;
    }

    await ensureCurrentUserFreeMembership();

    return await getMyMembership();
  } catch (error: any) {
    console.error('Error cargando membresía:', error?.message);
    return DEFAULT_FREE_MEMBERSHIP;
  }
}

export async function listMembershipPlans() {
  const { data, error } = await supabase
    .from('membership_plans')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []) as MembershipPlan[];
}
