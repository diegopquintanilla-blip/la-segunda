import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { AuthProvider } from '@/lib/auth-context';
import { SupportBot } from '@/components/support/support-bot';
import './globals.css';

const _geist = Geist({ subsets: ['latin'] });
const _geistMono = Geist_Mono({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'La Segunda Market | Compra y vende productos online',
  description:
    'Compra, vende y descubre productos en un marketplace seguro, simple y confiable.',
  metadataBase: new URL('https://lasegundamarket.app'),
  generator: 'v0.app',
  openGraph: {
    title: 'La Segunda Market',
    description:
      'Compra, vende y descubre productos en un marketplace seguro, simple y confiable.',
    url: 'https://lasegundamarket.app',
    siteName: 'La Segunda Market',
    images: [
      {
        url: '/lasegunda.png',
        width: 1200,
        height: 630,
        alt: 'La Segunda Market',
      },
    ],
    locale: 'es_PE',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'La Segunda Market',
    description:
      'Compra, vende y descubre productos en un marketplace seguro, simple y confiable.',
    images: ['/lasegunda.png'],
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="bg-background">
      <body className="font-sans antialiased">
        <AuthProvider>
          {children}
          <SupportBot />
        </AuthProvider>

        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  );
}
