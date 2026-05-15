import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

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
    process.env.NEXT_PUBLIC_SITE_URL || 'https://lasegundamarket.app'
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
          error: 'Debes iniciar sesión para contactar al vendedor.',
        },
        { status: 401 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

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

    const productId = String(body?.productId || '').trim();
    const productTitle = String(body?.productTitle || 'Producto').trim();

    if (!productId) {
      return NextResponse.json(
        {
          error: 'No se recibió el producto a contactar.',
        },
        { status: 400 }
      );
    }

    const contactPrice = Number(process.env.CONTACT_SELLER_PRICE || '2.00');
    const currency = process.env.CONTACT_SELLER_CURRENCY || 'PEN';

    const preferencePayload = {
      items: [
        {
          id: `contact-${productId}`,
          title: `Contacto protegido - ${productTitle}`,
          description:
            'Pago para habilitar contacto protegido con el vendedor dentro de La Segunda Market.',
          quantity: 1,
          currency_id: currency,
          unit_price: contactPrice,
        },
      ],
      payer: {
        email: user.email,
      },
      external_reference: `contact|${user.id}|${productId}|${Date.now()}`,
      metadata: {
        product_type: 'seller_contact',
        user_id: user.id,
        user_email: user.email,
        product_id: productId,
        product_title: productTitle,
      },
      back_urls: {
        success: `${siteUrl}/messages?contact_payment=success&productId=${productId}`,
        failure: `${siteUrl}/messages?contact_payment=failure&productId=${productId}`,
        pending: `${siteUrl}/messages?contact_payment=pending&productId=${productId}`,
      },
      notification_url: `${siteUrl}/api/webhooks/mercadopago-contact`,
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
            'Mercado Pago no pudo crear el pago de contacto.',
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
          'Error interno creando el pago para contactar vendedor.',
      },
      { status: 500 }
    );
  }
}
