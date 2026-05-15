import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

type MembershipPlanId = 'plus' | 'premium';

function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Falta configurar la variable de entorno: ${name}`);
  }

  return value;
}

function getBearerToken(request: NextRequest) {
  const authorization = request.headers.get('authorization') || '';

  if (!authorization.startsWith('Bearer ')) {
    return '';
  }

  return authorization.replace('Bearer ', '').trim();
}

function getSiteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL || 'https://la-segunda.vercel.app'
  ).replace(/\/$/, '');
}

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = getRequiredEnv('NEXT_PUBLIC_SUPABASE_URL');
    const supabaseServiceRoleKey = getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY');
    const mercadoPagoAccessToken = getRequiredEnv('MERCADOPAGO_ACCESS_TOKEN');

    const siteUrl = getSiteUrl();

    const accessToken = getBearerToken(request);

    if (!accessToken) {
      return NextResponse.json(
        {
          error: 'Debes iniciar sesión para activar una membresía.',
        },
        { status: 401 }
      );
    }

    const supabaseAdmin = createClient(
      supabaseUrl,
      supabaseServiceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(accessToken);

    if (userError || !user) {
      return NextResponse.json(
        {
          error: 'Sesión inválida. Vuelve a iniciar sesión.',
        },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => null);
    const planId = String(body?.planId || '') as MembershipPlanId;

    if (!['plus', 'premium'].includes(planId)) {
      return NextResponse.json(
        {
          error: 'Plan inválido. Solo puedes pagar Plus o Premium.',
        },
        { status: 400 }
      );
    }

    const { data: plan, error: planError } = await supabaseAdmin
      .from('membership_plans')
      .select(
        'id, name, description, price, currency, listing_limit, commission_rate, is_active'
      )
      .eq('id', planId)
      .eq('is_active', true)
      .single();

    if (planError || !plan) {
      return NextResponse.json(
        {
          error: 'No se encontró el plan seleccionado en Supabase.',
        },
        { status: 404 }
      );
    }

    const price = Number(plan.price || 0);

    if (price <= 0) {
      return NextResponse.json(
        {
          error: 'El plan seleccionado no requiere pago.',
        },
        { status: 400 }
      );
    }

    const preferencePayload = {
      items: [
        {
          id: String(plan.id),
          title: String(plan.name),
          description:
            plan.description ||
            `Membresía ${plan.name} para vendedores de La Segunda`,
          quantity: 1,
          currency_id: plan.currency || 'PEN',
          unit_price: price,
        },
      ],
      payer: {
        email: user.email,
      },
      external_reference: `${user.id}|${plan.id}|${Date.now()}`,
      metadata: {
        user_id: user.id,
        user_email: user.email,
        plan_id: plan.id,
        plan_name: plan.name,
        product_type: 'membership',
      },
      back_urls: {
        success: `${siteUrl}/seller/membership?payment=success`,
        failure: `${siteUrl}/seller/membership?payment=failure`,
        pending: `${siteUrl}/seller/membership?payment=pending`,
      },
      notification_url: `${siteUrl}/api/webhooks/mercadopago`,
      auto_return: 'approved',
      statement_descriptor: 'LA SEGUNDA',
    };

    const mercadoPagoResponse = await fetch(
      'https://api.mercadopago.com/checkout/preferences',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${mercadoPagoAccessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferencePayload),
      }
    );

    const mercadoPagoData = await mercadoPagoResponse.json().catch(() => null);

    if (!mercadoPagoResponse.ok) {
      return NextResponse.json(
        {
          error:
            mercadoPagoData?.message ||
            mercadoPagoData?.error ||
            'Mercado Pago no pudo crear la preferencia de pago.',
          detail: mercadoPagoData,
        },
        { status: mercadoPagoResponse.status }
      );
    }

    const useSandbox = process.env.MERCADOPAGO_USE_SANDBOX === 'true';

    const initPoint = useSandbox
      ? mercadoPagoData?.sandbox_init_point || mercadoPagoData?.init_point
      : mercadoPagoData?.init_point || mercadoPagoData?.sandbox_init_point;

    if (!initPoint) {
      return NextResponse.json(
        {
          error: 'Mercado Pago no devolvió un enlace de pago válido.',
          detail: mercadoPagoData,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      preferenceId: mercadoPagoData.id,
      initPoint,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error:
          error?.message ||
          'Error interno al crear el pago de membresía.',
      },
      { status: 500 }
    );
  }
}
