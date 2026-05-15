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

function isValidPlanId(value: string): value is MembershipPlanId {
  return value === 'plus' || value === 'premium';
}

function isValidUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

function addOneMonth(date = new Date()) {
  const nextDate = new Date(date);
  nextDate.setMonth(nextDate.getMonth() + 1);
  return nextDate.toISOString();
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

function extractMetadata(payment: any) {
  const metadata = payment?.metadata || {};

  let userId = String(
    metadata.user_id ||
      metadata.userId ||
      metadata.seller_user_id ||
      ''
  );

  let planId = String(
    metadata.plan_id ||
      metadata.planId ||
      ''
  );

  const externalReference = String(payment?.external_reference || '');

  if ((!userId || !planId) && externalReference.includes('|')) {
    const [externalUserId, externalPlanId] = externalReference.split('|');

    userId = userId || externalUserId || '';
    planId = planId || externalPlanId || '';
  }

  return {
    userId,
    planId,
  };
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

export async function GET() {
  return NextResponse.json({
    ok: true,
    message: 'Webhook Mercado Pago activo.',
  });
}

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = getRequiredEnv('NEXT_PUBLIC_SUPABASE_URL');
    const supabaseServiceRoleKey = getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY');
    const mercadoPagoAccessToken = getRequiredEnv('MERCADOPAGO_ACCESS_TOKEN');

    const body = await request.json().catch(() => ({}));

    const eventType = String(
      body?.type ||
        body?.topic ||
        request.nextUrl.searchParams.get('type') ||
        request.nextUrl.searchParams.get('topic') ||
        ''
    );

    const paymentId = extractPaymentId(request, body);

    if (!paymentId) {
      return NextResponse.json({
        ok: true,
        ignored: true,
        reason: 'No llegó payment_id en la notificación.',
        eventType,
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
        reason: `Pago recibido pero aún no aprobado. Estado: ${payment.status}`,
        paymentId,
      });
    }

    const { userId, planId } = extractMetadata(payment);

    if (!userId || !isValidUuid(userId)) {
      return NextResponse.json(
        {
          ok: false,
          error: 'El pago aprobado no contiene un user_id válido.',
          paymentId,
        },
        { status: 400 }
      );
    }

    if (!isValidPlanId(planId)) {
      return NextResponse.json(
        {
          ok: false,
          error: 'El pago aprobado no contiene un plan_id válido.',
          paymentId,
          planId,
        },
        { status: 400 }
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

    const { data: plan, error: planError } = await supabaseAdmin
      .from('membership_plans')
      .select('id, name, price, currency, listing_limit, commission_rate, is_active')
      .eq('id', planId)
      .eq('is_active', true)
      .single();

    if (planError || !plan) {
      return NextResponse.json(
        {
          ok: false,
          error: 'El plan pagado no existe o no está activo en Supabase.',
          paymentId,
          planId,
        },
        { status: 404 }
      );
    }

    const expectedPrice = Number(plan.price || 0);
    const paidAmount = Number(
      payment.transaction_amount ||
        payment.transaction_details?.total_paid_amount ||
        0
    );

    const expectedCurrency = String(plan.currency || 'PEN');
    const paidCurrency = String(payment.currency_id || '');

    if (Math.abs(paidAmount - expectedPrice) > 0.01) {
      return NextResponse.json(
        {
          ok: false,
          error: 'El monto pagado no coincide con el precio del plan.',
          paymentId,
          paidAmount,
          expectedPrice,
        },
        { status: 400 }
      );
    }

    if (paidCurrency && paidCurrency !== expectedCurrency) {
      return NextResponse.json(
        {
          ok: false,
          error: 'La moneda del pago no coincide con la moneda del plan.',
          paymentId,
          paidCurrency,
          expectedCurrency,
        },
        { status: 400 }
      );
    }

    const expiresAt = addOneMonth();

    const { error: membershipError } = await supabaseAdmin
      .from('user_memberships')
      .upsert(
        {
          user_id: userId,
          plan_id: planId,
          status: 'active',
          started_at: new Date().toISOString(),
          expires_at: expiresAt,
          payment_provider: 'mercadopago',
          provider_customer_id: payment.payer?.id
            ? String(payment.payer.id)
            : null,
          provider_subscription_id: null,
          provider_payment_id: String(payment.id),
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id',
        }
      );

    if (membershipError) {
      return NextResponse.json(
        {
          ok: false,
          error: membershipError.message,
          paymentId,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: 'Membresía activada correctamente.',
      userId,
      planId,
      paymentId,
      expiresAt,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error?.message ||
          'Error interno procesando webhook de Mercado Pago.',
      },
      { status: 500 }
    );
  }
}
