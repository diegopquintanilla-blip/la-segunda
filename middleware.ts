import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const deprecatedPageRoutes = [
  '/seller/membership',
  '/messages',
  '/favorites',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (deprecatedPageRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL('/products', request.url));
  }

  if (pathname.startsWith('/api/payments')) {
    return NextResponse.json(
      {
        error:
          'Esta función ya no está disponible. La Segunda Market usa contacto directo entre usuarios.',
      },
      { status: 410 }
    );
  }

  if (pathname.startsWith('/api/webhooks/mercadopago')) {
    return NextResponse.json(
      {
        error:
          'Webhook deshabilitado. El modelo actual de La Segunda Market no usa Mercado Pago.',
      },
      { status: 410 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/seller/membership',
    '/messages',
    '/favorites',
    '/api/payments/:path*',
    '/api/webhooks/mercadopago/:path*',
    '/api/webhooks/mercadopago-contact/:path*',
  ],
};
