'use client';

import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle,
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  PackagePlus,
  Phone,
  Search,
  ShieldCheck,
  Smartphone,
  Sofa,
  Tag,
  UserPlus,
  Users,
  Wallet,
} from 'lucide-react';

import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const popularCategories = [
  {
    title: 'Celulares',
    description: 'Equipos nuevos y usados',
    icon: Smartphone,
  },
  {
    title: 'Hogar',
    description: 'Muebles, electrodomésticos y más',
    icon: Sofa,
  },
  {
    title: 'Ofertas',
    description: 'Productos con buen precio',
    icon: Tag,
  },
];

const safetyTips = [
  'Revisa fotos reales del producto antes de concretar.',
  'Coordina la entrega en lugares seguros y concurridos.',
  'Evita compartir claves, códigos o información bancaria.',
  'Conserva capturas y comprobantes de la conversación.',
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#F7F8FB] text-slate-950">
      <Header />

      <main>
        {/* HERO PRINCIPAL */}
        <section className="relative overflow-hidden bg-[#F7F8FB] px-4 py-14 md:py-20">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-blue-100 blur-3xl" />
            <div className="absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-orange-100 blur-3xl" />
          </div>

          <div className="relative mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <section>
              <h1 className="max-w-4xl text-4xl font-black leading-tight tracking-tight text-slate-950 md:text-6xl">
                Compra y vende productos de segunda mano cerca de ti
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-600 md:text-xl">
                Encuentra oportunidades, publica tus artículos y contacta
                directamente con otros usuarios por teléfono, correo o WhatsApp.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/products">
                  <Button
                    size="lg"
                    className="h-12 rounded-xl bg-blue-950 px-6 text-base hover:bg-blue-900"
                  >
                    <Search className="mr-2 h-5 w-5" />
                    Explorar productos
                  </Button>
                </Link>

                <Link href="/seller/dashboard">
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-12 rounded-xl border-slate-300 bg-white px-6 text-base hover:bg-slate-50"
                  >
                    <PackagePlus className="mr-2 h-5 w-5" />
                    Publicar producto
                  </Button>
                </Link>
              </div>

              <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border bg-white/80 p-4 shadow-sm backdrop-blur">
                  <p className="text-2xl font-black text-blue-950">Gratis</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Registro inicial
                  </p>
                </div>

                <div className="rounded-2xl border bg-white/80 p-4 shadow-sm backdrop-blur">
                  <p className="text-2xl font-black text-blue-950">Directo</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Contacto vendedor
                  </p>
                </div>

                <div className="rounded-2xl border bg-white/80 p-4 shadow-sm backdrop-blur">
                  <p className="text-2xl font-black text-blue-950">Rápido</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Publica en minutos
                  </p>
                </div>
              </div>
            </section>

            {/* TARJETA VISUAL */}
            <section className="relative">
              <div className="absolute -left-4 top-10 hidden h-24 w-24 rounded-3xl bg-orange-200/60 blur-2xl md:block" />
              <div className="absolute -right-4 bottom-10 hidden h-32 w-32 rounded-3xl bg-blue-200/70 blur-2xl md:block" />

              <Card className="relative overflow-hidden rounded-[2rem] border-slate-200 bg-white shadow-2xl">
                <div className="h-3 bg-gradient-to-r from-blue-950 via-blue-800 to-orange-500" />

                <CardContent className="p-5 md:p-6">
                  <div className="overflow-hidden rounded-3xl bg-slate-100">
                    <div className="flex h-72 items-center justify-center bg-gradient-to-br from-slate-200 via-white to-orange-100">
                      <div className="rounded-[2rem] bg-white p-5 shadow-xl">
                        <div className="flex h-32 w-52 items-center justify-center rounded-2xl bg-slate-100">
                          <Sofa className="h-16 w-16 text-blue-950" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="text-2xl font-black text-slate-950">
                          Mueble en buen estado
                        </h2>

                        <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                          <MapPin className="h-4 w-4" />
                          Lima, Perú
                        </p>
                      </div>

                      <p className="rounded-2xl bg-blue-50 px-4 py-2 text-xl font-black text-blue-950">
                        S/ 280
                      </p>
                    </div>

                    <div className="mt-5 grid gap-3 rounded-2xl border bg-slate-50 p-4">
                      <div className="flex items-center gap-3 text-sm text-slate-700">
                        <Users className="h-5 w-5 text-blue-950" />
                        <span>Nombre del vendedor disponible</span>
                      </div>

                      <div className="flex items-center gap-3 text-sm text-slate-700">
                        <Phone className="h-5 w-5 text-blue-950" />
                        <span>Teléfono para coordinar rápido</span>
                      </div>

                      <div className="flex items-center gap-3 text-sm text-slate-700">
                        <MessageCircle className="h-5 w-5 text-green-600" />
                        <span>Contacto directo por WhatsApp</span>
                      </div>
                    </div>

                    <Link href="/products">
                      <Button className="mt-5 h-12 w-full rounded-xl bg-orange-600 text-base hover:bg-orange-700">
                        Ver productos disponibles
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>
        </section>

        {/* CATEGORÍAS */}
        <section className="px-4 py-10">
          <div className="mx-auto max-w-7xl">
            <div className="mb-7 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-3xl font-black text-slate-950 md:text-4xl">
                  Encuentra buenas oportunidades
                </h2>

                <p className="mt-2 max-w-2xl text-slate-600">
                  Explora productos publicados por personas reales y coordina
                  directamente con el vendedor.
                </p>
              </div>

              <Link href="/products">
                <Button variant="outline" className="rounded-xl bg-white">
                  Ver todo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {popularCategories.map((category) => {
                const Icon = category.icon;

                return (
                  <Card
                    key={category.title}
                    className="group rounded-3xl border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    <CardContent className="p-6">
                      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-950 transition group-hover:bg-blue-950 group-hover:text-white">
                        <Icon className="h-7 w-7" />
                      </div>

                      <h3 className="text-xl font-black text-slate-950">
                        {category.title}
                      </h3>

                      <p className="mt-2 text-sm text-slate-500">
                        {category.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* CÓMO FUNCIONA */}
        <section className="px-4 py-12">
          <div className="mx-auto max-w-7xl rounded-[2rem] bg-slate-950 p-6 text-white md:p-10">
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <div>
                <h2 className="text-3xl font-black md:text-4xl">
                  Publicar y vender debe ser simple
                </h2>

                <p className="mt-4 max-w-xl text-slate-300">
                  La Segunda Market está pensada para que cualquier persona
                  pueda publicar un producto, mostrar sus datos de contacto y
                  recibir consultas de compradores interesados.
                </p>

                <Link href="/auth/register">
                  <Button className="mt-6 rounded-xl bg-orange-600 hover:bg-orange-700">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Crear cuenta gratis
                  </Button>
                </Link>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-blue-950">
                    <UserPlus className="h-5 w-5" />
                  </div>

                  <h3 className="font-bold">1. Regístrate</h3>
                  <p className="mt-2 text-sm text-slate-300">
                    Crea tu perfil y agrega tus datos de contacto.
                  </p>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-blue-950">
                    <PackagePlus className="h-5 w-5" />
                  </div>

                  <h3 className="font-bold">2. Publica</h3>
                  <p className="mt-2 text-sm text-slate-300">
                    Sube fotos, precio, descripción y ciudad.
                  </p>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-blue-950">
                    <MessageCircle className="h-5 w-5" />
                  </div>

                  <h3 className="font-bold">3. Coordina</h3>
                  <p className="mt-2 text-sm text-slate-300">
                    Recibe consultas directas de compradores.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* BENEFICIOS */}
        <section className="px-4 py-12">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-black text-slate-950 md:text-4xl">
                Una forma práctica de comprar y vender
              </h2>

              <p className="mx-auto mt-3 max-w-2xl text-slate-600">
                El objetivo es facilitar conexiones reales entre personas,
                reduciendo pasos innecesarios y mejorando la confianza.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
                <CardHeader>
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 text-green-700">
                    <Wallet className="h-6 w-6" />
                  </div>

                  <CardTitle>Mejores precios</CardTitle>

                  <CardDescription>
                    Encuentra productos usados, nuevos o seminuevos con precios
                    más accesibles.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
                <CardHeader>
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-950">
                    <Clock className="h-6 w-6" />
                  </div>

                  <CardTitle>Contacto más rápido</CardTitle>

                  <CardDescription>
                    Comunícate con el vendedor por teléfono, correo o WhatsApp
                    desde el detalle del producto.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
                <CardHeader>
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-700">
                    <ShieldCheck className="h-6 w-6" />
                  </div>

                  <CardTitle>Más confianza</CardTitle>

                  <CardDescription>
                    Revisa la información del producto y coordina directamente
                    con la persona que lo vende.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* SEGURIDAD */}
        <section className="bg-white px-4 py-14">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
            <div>
              <h2 className="text-3xl font-black text-slate-950 md:text-4xl">
                Compra con criterio y coordina con seguridad
              </h2>

              <p className="mt-4 text-slate-600">
                La plataforma facilita el contacto entre usuarios. Antes de
                concretar una compra, revisa el producto, valida la información
                y conversa con el vendedor.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link href="/products">
                  <Button className="rounded-xl bg-blue-950 hover:bg-blue-900">
                    Explorar productos
                  </Button>
                </Link>

                <Link href="/seller/dashboard">
                  <Button variant="outline" className="rounded-xl bg-white">
                    Publicar ahora
                  </Button>
                </Link>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {safetyTips.map((tip) => (
                <div
                  key={tip}
                  className="flex gap-3 rounded-3xl border bg-slate-50 p-5"
                >
                  <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-700" />
                  <p className="text-sm leading-relaxed text-slate-700">
                    {tip}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="px-4 py-14">
          <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-950 via-slate-950 to-blue-900 p-8 text-white shadow-xl md:p-12">
            <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <h2 className="text-3xl font-black md:text-4xl">
                  Dale una segunda vida a lo que ya no usas
                </h2>

                <p className="mt-3 max-w-2xl text-slate-300">
                  Publica tus productos, conecta con compradores y convierte
                  artículos guardados en nuevas oportunidades.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/auth/register">
                  <Button className="rounded-xl bg-orange-600 hover:bg-orange-700">
                    Crear cuenta
                  </Button>
                </Link>

                <Link href="/products">
                  <Button
                    variant="outline"
                    className="rounded-xl border-white/20 bg-white/10 text-white hover:bg-white/20"
                  >
                    Ver productos
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t bg-white px-4 py-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
          <p>© 2026 La Segunda Market. Todos los derechos reservados.</p>

          <div className="flex flex-wrap gap-4">
            <Link href="/products" className="hover:text-slate-950">
              Productos
            </Link>

            <Link href="/seller/dashboard" className="hover:text-slate-950">
              Publicar
            </Link>

            <Link href="/auth/register" className="hover:text-slate-950">
              Crear cuenta
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
