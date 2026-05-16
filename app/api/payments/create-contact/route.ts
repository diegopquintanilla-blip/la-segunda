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

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
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

    if (!productId) {
      return NextResponse.json(
        {
          error: 'No se recibió el producto a contactar.',
        },
        { status: 400 }
      );
    }

    const { data: product, error: productError } = await supabaseAdmin
      .from('products')
      .select('id, title, price, seller_id, status')
      .eq('id', productId)
      .single();

    if (productError || !product) {
      return NextResponse.json(
        {
          error: 'No se encontró el producto en Supabase.',
        },
        { status: 404 }
      );
    }

    const productStatus = String(product.status || 'active').toLowerCase();

    if (['sold', 'vendido', 'inactive', 'deleted'].includes(productStatus)) {
      return NextResponse.json(
        {
          error: 'Este producto ya no está disponible para contacto.',
        },
        { status: 400 }
      );
    }

    const sellerId = String(product.seller_id || '');

    if (sellerId && sellerId === user.id) {
      return NextResponse.json(
        {
          error: 'No puedes contactar por tu propio producto.',
        },
        { status: 400 }
      );
    }

    const productTitle = String(product.title || 'Producto');
    const productPrice = Number(product.price || 0);

    if (!productPrice || productPrice <= 0) {
      return NextResponse.json(
        {
          error: 'El producto no tiene un precio válido.',
        },
        { status: 400 }
      );
    }

    const commissionRate = Number(
      process.env.CONTACT_SELLER_COMMISSION_RATE || '10'
    );

    if (!Number.isFinite(commissionRate) || commissionRate <= 0) {
      return NextResponse.json(
        {
          error: 'La comisión configurada no es válida.',
        },
        { status: 500 }
      );
    }

    const commissionAmount = roundMoney((productPrice * commissionRate) / 100);
    const currency = process.env.CONTACT_SELLER_CURRENCY || 'PEN';

    const preferencePayload = {
      items: [
        {
          id: `contact-${productId}`,
          title: `Contacto protegido - ${productTitle}`,
          description: `Comisión del ${commissionRate}% para habilitar contacto seguro con el vendedor.`,
          quantity: 1,
          currency_id: currency,
          unit_price: commissionAmount,
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
        seller_id: sellerId,
        product_id: productId,
        product_title: productTitle,
        product_price: productPrice,
        commission_rate: commissionRate,
        commission_amount: commissionAmount,
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
      productPrice,
      commissionRate,
      commissionAmount,
      currency,
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
