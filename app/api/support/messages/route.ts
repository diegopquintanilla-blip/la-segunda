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

function getOptionalEnv(name: string, fallback = '') {
  return process.env[name] || fallback;
}

function getBearerToken(request: NextRequest) {
  const authorization = request.headers.get('authorization') || '';

  if (!authorization.startsWith('Bearer ')) {
    return '';
  }

  return authorization.replace('Bearer ', '').trim();
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function getBotReply(category: string) {
  const replies: Record<string, string> = {
    membresia:
      'Gracias por escribirnos. Revisaremos tu consulta sobre membresía y te responderemos lo antes posible.',
    pago:
      'Gracias por reportar tu consulta de pago. Verificaremos la operación y te contactaremos.',
    publicacion:
      'Gracias por escribirnos. Revisaremos tu publicación o problema al registrar productos.',
    cuenta:
      'Gracias por contactarnos. Revisaremos tu cuenta y te daremos soporte.',
    reporte:
      'Gracias por reportar este caso. Nuestro equipo revisará la información.',
    general:
      'Gracias por contactarte con soporte. Hemos recibido tu mensaje correctamente.',
  };

  return replies[category] || replies.general;
}

function getPriority(category: string) {
  if (category === 'pago') return 'high';
  if (category === 'reporte') return 'high';
  return 'normal';
}

async function sendSupportAlertEmail(params: {
  to: string;
  from: string;
  resendApiKey: string;
  subject: string;
  html: string;
  replyTo?: string;
}) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${params.resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: params.from,
      to: [params.to],
      subject: params.subject,
      html: params.html,
      ...(params.replyTo ? { reply_to: params.replyTo } : {}),
    }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.message || data?.error || 'No se pudo enviar la alerta por correo.'
    );
  }

  return data;
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    message: 'API de soporte activa.',
  });
}

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = getRequiredEnv('NEXT_PUBLIC_SUPABASE_URL');
    const supabaseServiceRoleKey = getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY');

    const supportAlertEmail = getOptionalEnv(
      'SUPPORT_ALERT_EMAIL',
      'diego.pquintanilla@gmail.com'
    );

    const resendApiKey = getOptionalEnv('RESEND_API_KEY');

    const supportFromEmail = getOptionalEnv(
      'SUPPORT_FROM_EMAIL',
      'La Segunda Market <onboarding@resend.dev>'
    );

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const body = await request.json().catch(() => null);

    if (!body) {
      return NextResponse.json(
        { error: 'Solicitud inválida.' },
        { status: 400 }
      );
    }

    const accessToken = getBearerToken(request);

    let authUserId: string | null = null;
    let authUserEmail: string | null = null;

    if (accessToken) {
      const {
        data: { user },
      } = await supabaseAdmin.auth.getUser(accessToken);

      if (user) {
        authUserId = user.id;
        authUserEmail = user.email || null;
      }
    }

    const userName = String(body.userName || '').trim();
    const userEmail = String(body.userEmail || authUserEmail || '').trim();
    const category = String(body.category || 'general').trim();
    const subject = String(body.subject || '').trim();
    const message = String(body.message || '').trim();
    const pageUrl = String(body.pageUrl || '').trim();
    const userAgent = request.headers.get('user-agent') || '';

    if (!subject) {
      return NextResponse.json(
        { error: 'Ingresa el asunto del mensaje.' },
        { status: 400 }
      );
    }

    if (!message || message.length < 10) {
      return NextResponse.json(
        { error: 'El mensaje debe tener al menos 10 caracteres.' },
        { status: 400 }
      );
    }

    if (message.length > 3000) {
      return NextResponse.json(
        { error: 'El mensaje es demasiado largo. Máximo 3000 caracteres.' },
        { status: 400 }
      );
    }

    const botReply = getBotReply(category);
    const priority = getPriority(category);
    const replyToEmail = isValidEmail(userEmail) ? userEmail : undefined;

    const { data: savedMessage, error: insertError } = await supabaseAdmin
      .from('support_messages')
      .insert({
        user_id: authUserId,
        user_name: userName || null,
        user_email: userEmail || null,
        category,
        subject,
        message,
        status: 'open',
        priority,
        page_url: pageUrl || null,
        user_agent: userAgent,
        bot_reply: botReply,
      })
      .select('id, created_at')
      .single();

    if (insertError) {
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      );
    }

    let emailSent = false;
    let emailError = '';

    if (resendApiKey) {
      try {
        const replyButton = replyToEmail
          ? `
            <p style="margin-top: 24px;">
              <a
                href="mailto:${escapeHtml(replyToEmail)}?subject=${encodeURIComponent(
                  `Respuesta soporte La Segunda: ${subject}`
                )}"
                style="display:inline-block;background:#1e3a8a;color:white;padding:12px 18px;border-radius:10px;text-decoration:none;font-weight:bold;"
              >
                Responder al cliente
              </a>
            </p>
          `
          : '';

        const html = `
          <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111827;">
            <h2>Nuevo mensaje de soporte - La Segunda Market</h2>

            <p><strong>ID del caso:</strong> ${escapeHtml(savedMessage.id)}</p>
            <p><strong>Categoría:</strong> ${escapeHtml(category)}</p>
            <p><strong>Prioridad:</strong> ${escapeHtml(priority)}</p>
            <p><strong>Asunto:</strong> ${escapeHtml(subject)}</p>

            <hr />

            <p><strong>Usuario:</strong> ${escapeHtml(userName || 'No indicado')}</p>
            <p><strong>Email:</strong> ${escapeHtml(userEmail || 'No indicado')}</p>
            <p><strong>User ID:</strong> ${escapeHtml(authUserId || 'No autenticado')}</p>

            ${replyButton}

            <hr />

            <p><strong>Mensaje:</strong></p>
            <p>${escapeHtml(message).replaceAll('\n', '<br />')}</p>

            <hr />

            <p><strong>Página:</strong> ${escapeHtml(pageUrl || 'No indicada')}</p>
            <p><strong>Fecha:</strong> ${escapeHtml(savedMessage.created_at)}</p>

            <p style="margin-top: 24px; color: #6b7280;">
              Revisa Supabase → support_messages_monitor_admin para monitorear este caso.
            </p>

            <p style="margin-top: 10px; color: #6b7280;">
              También puedes responder directamente este correo. El destinatario será el email del cliente si fue proporcionado correctamente.
            </p>
          </div>
        `;

        await sendSupportAlertEmail({
          to: supportAlertEmail,
          from: supportFromEmail,
          resendApiKey,
          subject: `Soporte La Segunda: ${subject}`,
          html,
          replyTo: replyToEmail,
        });

        emailSent = true;
      } catch (error: any) {
        emailError = error?.message || 'No se pudo enviar el correo.';
      }
    } else {
      emailError = 'RESEND_API_KEY no está configurado.';
    }

    return NextResponse.json({
      ok: true,
      messageId: savedMessage.id,
      botReply,
      emailSent,
      emailError,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error:
          error?.message || 'Error interno registrando mensaje de soporte.',
      },
      { status: 500 }
    );
  }
}
