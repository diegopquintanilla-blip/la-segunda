import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://lasegundamarket.app'),
  title: {
    default: 'La Segunda Market | Compra y vende productos de segunda mano',
    template: '%s | La Segunda Market',
  },
  description:
    'Compra y vende productos de segunda mano en Perú. Publica tus artículos, encuentra oportunidades y contacta directamente con vendedores por teléfono, correo o WhatsApp.',
  keywords: [
    'La Segunda Market',
    'segunda mano Perú',
    'comprar productos usados',
    'vender productos usados',
    'marketplace Perú',
    'productos de segunda mano',
    'venta entre usuarios',
    'comprar y vender online',
    'productos usados Lima',
    'marketplace de segunda mano',
  ],
  authors: [
    {
      name: 'La Segunda Market',
      url: 'https://lasegundamarket.app',
    },
  ],
  creator: 'La Segunda Market',
  publisher: 'La Segunda Market',
  applicationName: 'La Segunda Market',
  category: 'marketplace',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'es_PE',
    url: 'https://lasegundamarket.app',
    siteName: 'La Segunda Market',
    title: 'La Segunda Market | Compra y vende productos de segunda mano',
    description:
      'Encuentra oportunidades, publica tus artículos y contacta directamente con vendedores en Perú.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'La Segunda Market - Marketplace de segunda mano en Perú',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'La Segunda Market | Compra y vende productos de segunda mano',
    description:
      'Publica productos, encuentra ofertas y contacta directamente con vendedores.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#172554',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.variable} min-h-screen antialiased`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
