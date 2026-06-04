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

function extractPaymentId(request: NextRequest, body: any) {
  const fromBody =
    body?.data?.id ||
    body?.id ||
    body?.resource ||
    body?.payment_id ||
    '';

  const fromQuery =
    request.nextUrl.searchParams.get('data.id') ||
    request.nextUrl.searchParams.get('id') ||
    request.nextUrl.searchParams.get('payment_id') ||
    '';

  const rawPaymentId = String(fromBody || fromQuery || '');
  const match = rawPaymentId.match(/\d+/);

  return match ? match[0] : '';
}

function toNumber(value: any, fallback = 0) {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return fallback;
  }

  return numberValue;
}

async function getMercadoPagoPayment(paymentId: string, accessToken: string) {
  const response = await fetch(
    `https://api.mercadopago.com/v1/payments/${paymentId}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    }
  );

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.message ||
        data?.error ||
        `No se pudo consultar el pago ${paymentId} en Mercado Pago.`
    );
  }

  return data;
}

function extractContactPaymentData(payment: any) {
  const metadata = payment?.metadata || {};

  let userId = String(metadata.user_id || metadata.userId || '');
  let userEmail = String(metadata.user_email || metadata.userEmail || '');
  let sellerId = String(metadata.seller_id || metadata.sellerId || '');
  let productId = String(metadata.product_id || metadata.productId || '');
  let productTitle = String(metadata.product_title || metadata.productTitle || '');
  let productType = String(metadata.product_type || metadata.productType || '');

  const productPrice = toNumber(metadata.product_price || metadata.productPrice);
  const commissionRate = toNumber(
    metadata.commission_rate || metadata.commissionRate,
    10
  );
  const commissionAmount = toNumber(
    metadata.commission_amount || metadata.commissionAmount,
    0
  );

  const externalReference = String(payment?.external_reference || '');

  if ((!userId || !productId) && externalReference.includes('|')) {
    const parts = externalReference.split('|');

    if (parts[0] === 'contact') {
      userId = userId || parts[1] || '';
      productId = productId || parts[2] || '';
      productType = productType || 'seller_contact';
    }
  }

  return {
    userId,
    userEmail,
    sellerId,
    productId,
    productTitle,
    productType,
    productPrice,
    commissionRate,
    commissionAmount,
  };
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    message: 'Webhook Mercado Pago Contacto activo.',
  });
}

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = getRequiredEnv('NEXT_PUBLIC_SUPABASE_URL');
    const supabaseServiceRoleKey = getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY');
    const mercadoPagoAccessToken = getRequiredEnv('MERCADOPAGO_ACCESS_TOKEN');

    const body = await request.json().catch(() => ({}));
    const paymentId = extractPaymentId(request, body);

    if (!paymentId) {
      return NextResponse.json({
        ok: true,
        ignored: true,
        reason: 'No llegó payment_id en la notificación.',
      });
    }

    const payment = await getMercadoPagoPayment(
      paymentId,
      mercadoPagoAccessToken
    );

    if (payment.status !== 'approved') {
      return NextResponse.json({
        ok: true,
        ignored: true,
        reason: `Pago recibido pero no aprobado. Estado: ${payment.status}`,
        paymentId,
      });
    }

    const {
      userId,
      userEmail,
      sellerId,
      productId,
      productTitle,
      productType,
      productPrice,
      commissionRate,
      commissionAmount,
    } = extractContactPaymentData(payment);

    if (productType !== 'seller_contact') {
      return NextResponse.json({
        ok: true,
        ignored: true,
        reason: 'El pago no corresponde a contacto de vendedor.',
        paymentId,
        productType,
      });
    }

    if (!userId || !productId) {
      return NextResponse.json(
        {
          ok: false,
          error: 'El pago aprobado no contiene user_id o product_id.',
          paymentId,
        },
        { status: 400 }
      );
    }

    const paidAmount = toNumber(
      payment.transaction_amount ||
        payment.transaction_details?.total_paid_amount ||
        0
    );

    if (commissionAmount > 0 && Math.abs(paidAmount - commissionAmount) > 0.01) {
      return NextResponse.json(
        {
          ok: false,
          error: 'El monto pagado no coincide con la comisión esperada.',
          paymentId,
          paidAmount,
          commissionAmount,
        },
        { status: 400 }
      );
    }

    const currency = String(payment.currency_id || 'PEN');

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { error: upsertError } = await supabaseAdmin
      .from('contact_payments')
      .upsert(
        {
          user_id: userId,
          user_email: userEmail || null,
          seller_id: sellerId || null,
          product_id: productId,
          product_title: productTitle || null,
          product_price: productPrice || 0,
          commission_rate: commissionRate || 10,
          commission_amount: commissionAmount || paidAmount,
          status: 'approved',
          amount: paidAmount,
          currency,
          provider: 'mercadopago',
          provider_payment_id: String(payment.id),
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'provider_payment_id',
        }
      );

    if (upsertError) {
      return NextResponse.json(
        {
          ok: false,
          error: upsertError.message,
          paymentId,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: 'Pago de contacto registrado correctamente.',
      userId,
      sellerId,
      productId,
      paymentId,
      paidAmount,
      commissionRate,
      commissionAmount,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error?.message ||
          'Error interno procesando webhook de contacto Mercado Pago.',
      },
      { status: 500 }
    );
  }
}
