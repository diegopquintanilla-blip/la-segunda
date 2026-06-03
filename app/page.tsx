'use client';

import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle,
  Mail,
  MessageCircle,
  PackagePlus,
  Phone,
  Search,
  ShieldCheck,
  Sparkles,
  UserPlus,
  Users,
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

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#F7F8FB]">
      <Header />

      <main>
        {/* HERO */}
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 px-4 py-20 text-white md:py-28">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute left-10 top-10 h-40 w-40 rounded-full bg-blue-500 blur-3xl" />
            <div className="absolute bottom-10 right-10 h-56 w-56 rounded-full bg-orange-500 blur-3xl" />
          </div>

          <div className="relative mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm backdrop-blur">
                <Sparkles className="h-4 w-4 text-orange-300" />
                Marketplace libre para comprar y vender en Perú
              </div>

              <h1 className="mb-6 max-w-3xl text-4xl font-black leading-tight tracking-tight md:text-6xl">
                Compra, vende y contacta directamente con otros usuarios
              </h1>

              <p className="mb-8 max-w-2xl text-lg leading-relaxed text-slate-200 md:text-xl">
                La Segunda Market ahora es una plataforma de acceso libre.
                Explora productos, revisa los datos del vendedor y comunícate
                por teléfono, correo o WhatsApp sin pagar por desbloquear
                contacto.
              </p>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/products">
                  <Button size="lg" className="bg-orange-600 hover:bg-orange-700">
                    <Search className="mr-2 h-5 w-5" />
                    Explorar productos
                  </Button>
                </Link>

                <Link href="/auth/register">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/20 bg-white/10 text-white hover:bg-white/20"
                  >
                    <UserPlus className="mr-2 h-5 w-5" />
                    Registrarme gratis
                  </Button>
                </Link>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur">
              <div className="rounded-2xl bg-white p-5 text-slate-950">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Nuevo modelo</p>
                    <h2 className="text-xl font-bold">Contacto visible</h2>
                  </div>

                  <div className="rounded-full bg-green-100 p-3 text-green-700">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                </div>

                <div className="space-y-3 rounded-xl bg-slate-50 p-4">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-blue-900" />
                    <span className="font-semibold">Nombre del vendedor</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-blue-900" />
                    <span>Teléfono visible</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-blue-900" />
                    <span>Correo visible</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <MessageCircle className="h-5 w-5 text-green-600" />
                    <span>Contacto directo por WhatsApp</span>
                  </div>
                </div>

                <p className="mt-4 text-sm text-slate-500">
                  Estrategia inicial para generar tráfico, confianza y adopción
                  de usuarios en la plataforma.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* COMO FUNCIONA */}
        <section className="px-4 py-16">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 text-center">
              <h2 className="mb-3 text-3xl font-black text-slate-950 md:text-4xl">
                ¿Cómo funciona La Segunda Market?
              </h2>

              <p className="mx-auto max-w-2xl text-slate-600">
                Publica productos usados o nuevos, muestra tus datos de contacto
                y permite que compradores interesados se comuniquen directamente.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
                <CardHeader>
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-900">
                    <PackagePlus className="h-6 w-6" />
                  </div>

                  <CardTitle>Publica gratis</CardTitle>

                  <CardDescription>
                    Regístrate y sube tus productos para que otros usuarios
                    puedan verlos sin barreras.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
                <CardHeader>
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-700">
                    <Phone className="h-6 w-6" />
                  </div>

                  <CardTitle>Contacto directo</CardTitle>

                  <CardDescription>
                    Los compradores pueden ver nombre, teléfono y correo del
                    vendedor para coordinar rápidamente.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
                <CardHeader>
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-700">
                    <ShieldCheck className="h-6 w-6" />
                  </div>

                  <CardTitle>Confianza y crecimiento</CardTitle>

                  <CardDescription>
                    Modelo abierto para posicionar la marca, atraer usuarios y
                    validar el mercado.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* ACCIONES */}
        <section className="px-4 pb-16">
          <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-3">
            <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
              <CardContent className="p-6">
                <h3 className="mb-2 text-xl font-bold text-slate-950">
                  Comprar productos
                </h3>

                <p className="mb-5 text-slate-600">
                  Encuentra oportunidades publicadas por usuarios de La Segunda
                  Market.
                </p>

                <Link href="/products">
                  <Button variant="outline" className="bg-white">
                    Explorar productos
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
              <CardContent className="p-6">
                <h3 className="mb-2 text-xl font-bold text-slate-950">
                  Publicar producto
                </h3>

                <p className="mb-5 text-slate-600">
                  Crea una cuenta y empieza a vender tus artículos nuevos o de
                  segunda mano.
                </p>

                <Link href="/seller/dashboard">
                  <Button variant="outline" className="bg-white">
                    Publicar ahora
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
              <CardContent className="p-6">
                <h3 className="mb-2 text-xl font-bold text-slate-950">
                  Crear cuenta
                </h3>

                <p className="mb-5 text-slate-600">
                  Completa tu perfil para mostrar tus datos comerciales y
                  generar más confianza.
                </p>

                <Link href="/auth/register">
                  <Button variant="outline" className="bg-white">
                    Registrarme gratis
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* SEGURIDAD */}
        <section className="bg-white px-4 py-16">
          <div className="mx-auto grid max-w-7xl items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-900">
                <ShieldCheck className="h-4 w-4" />
                Recomendaciones de seguridad
              </div>

              <h2 className="mb-4 text-3xl font-black text-slate-950 md:text-4xl">
                Contacto libre, pero compra con cuidado
              </h2>

              <p className="text-slate-600">
                La plataforma facilita el contacto entre usuarios, pero cada
                comprador y vendedor debe verificar la información del producto,
                coordinar en lugares seguros y conservar evidencia de la
                conversación.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border bg-slate-50 p-5">
                <CheckCircle className="mb-3 h-6 w-6 text-green-700" />
                <h3 className="mb-1 font-bold text-slate-950">
                  Revisa el producto
                </h3>
                <p className="text-sm text-slate-600">
                  Solicita fotos reales, detalles del estado y condiciones antes
                  de concretar la compra.
                </p>
              </div>

              <div className="rounded-2xl border bg-slate-50 p-5">
                <CheckCircle className="mb-3 h-6 w-6 text-green-700" />
                <h3 className="mb-1 font-bold text-slate-950">
                  Coordina con seguridad
                </h3>
                <p className="text-sm text-slate-600">
                  Elige puntos seguros, evita adelantos innecesarios y confirma
                  los datos del vendedor.
                </p>
              </div>

              <div className="rounded-2xl border bg-slate-50 p-5">
                <CheckCircle className="mb-3 h-6 w-6 text-green-700" />
                <h3 className="mb-1 font-bold text-slate-950">
                  Conserva evidencia
                </h3>
                <p className="text-sm text-slate-600">
                  Guarda mensajes, comprobantes y acuerdos realizados con la
                  otra parte.
                </p>
              </div>

              <div className="rounded-2xl border bg-slate-50 p-5">
                <CheckCircle className="mb-3 h-6 w-6 text-green-700" />
                <h3 className="mb-1 font-bold text-slate-950">
                  Evita datos sensibles
                </h3>
                <p className="text-sm text-slate-600">
                  No compartas claves, códigos bancarios ni información privada
                  innecesaria.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t bg-white px-4 py-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
          <p>© 2026 La Segunda Market. Todos los derechos reservados.</p>
          <p>Marketplace libre de compra y venta entre usuarios.</p>
        </div>
      </footer>
    </div>
  );
}
