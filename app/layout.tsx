import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { AuthProvider } from '@/lib/auth-context';
import './globals.css';

const _geist = Geist({ subsets: ['latin'] });
const _geistMono = Geist_Mono({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://la-segunda.vercel.app'),

  title: 'La Segunda | Compra y vende productos de segunda mano en Perú',

  description:
    'La Segunda es un marketplace peruano para comprar y vender productos de segunda mano con confianza, chat protegido y vendedores verificados.',

  generator: 'v0.app',

  openGraph: {
    title: 'La Segunda | Marketplace de segunda mano en Perú',
    description:
      'Compra y vende productos de segunda mano de forma segura. Publica artículos, guarda favoritos y contacta vendedores dentro de La Segunda.',
    url: 'https://la-segunda.vercel.app',
    siteName: 'La Segunda',
    images: [
      {
        url: '/lasegunda.png',
        width: 1200,
        height: 630,
        alt: 'La Segunda marketplace de segunda mano en Perú',
      },
    ],
    locale: 'es_PE',
    type: 'website',
  },

  twitter: {
    card: 'summary_large_image',
    title: 'La Segunda | Marketplace de segunda mano en Perú',
    description:
      'Compra y vende productos de segunda mano de forma segura en Perú.',
    images: ['/lasegunda.png'],
  },

  icons: {
    icon: [
      {
        url: '/lasegunda.png',
        type: 'image/png',
      },
    ],
    apple: '/lasegunda.png',
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
        <AuthProvider>{children}</AuthProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  );
}
