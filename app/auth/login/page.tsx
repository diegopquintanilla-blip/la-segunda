'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  PackagePlus,
  Search,
  ShieldCheck,
  Store,
  UserPlus,
} from 'lucide-react';

import { Header } from '@/components/header';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

type ProfileRow = {
  id?: string | null;
  user_id?: string | null;
  full_name?: string | null;
  username?: string | null;
  email?: string | null;
  phone?: string | null;
  city?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
  gender?: string | null;
  account_type?: string | null;
};

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/products');
    }
  }, [isLoading, isAuthenticated, router]);

  const loadUserProfile = async (userId: string) => {
    let profile: ProfileRow | null = null;

    const byUserId = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (!byUserId.error && byUserId.data) {
      profile = byUserId.data as ProfileRow;
    }

    if (!profile) {
      const byId = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (!byId.error && byId.data) {
        profile = byId.data as ProfileRow;
      }
    }

    return profile;
  };

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setErrorMessage('');
    setSuccessMessage('');

    if (!email.trim()) {
      setErrorMessage('Ingresa tu correo electrónico.');
      return;
    }

    if (!password.trim()) {
      setErrorMessage('Ingresa tu contraseña.');
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        throw error;
      }

      if (!data.user) {
        throw new Error('No se pudo iniciar sesión. Intenta nuevamente.');
      }

      const profile = await loadUserProfile(data.user.id);

      const localUser = {
        id: data.user.id,
        email: profile?.email || data.user.email || email.trim(),
        name:
          profile?.full_name ||
          profile?.username ||
          data.user.email?.split('@')?.[0] ||
          'Usuario La Segunda',
        full_name: profile?.full_name || '',
        phone: profile?.phone || '',
        city: profile?.city || '',
        bio: profile?.bio || '',
        avatar: profile?.avatar_url || '',
        gender: profile?.gender || 'neutral',
        accountType: profile?.account_type || 'buyer',
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem('la-segunda-auth', 'true');
        localStorage.setItem('la-segunda-user', JSON.stringify(localUser));
      }

      setSuccessMessage('Ingreso correcto. Redirigiendo...');

      setTimeout(() => {
        router.push('/products');
        router.refresh();
      }, 700);
    } catch (error: any) {
      console.error('[La Segunda] Error iniciando sesión:', error?.message);

      const message = String(error?.message || '').toLowerCase();

      if (
        message.includes('invalid login credentials') ||
        message.includes('invalid credentials')
      ) {
        setErrorMessage('Correo o contraseña incorrectos.');
      } else if (message.includes('email not confirmed')) {
        setErrorMessage(
          'Tu correo aún no ha sido confirmado. Revisa tu bandeja de entrada.'
        );
      } else {
        setErrorMessage(
          error?.message || 'No se pudo iniciar sesión. Intenta nuevamente.'
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FB] text-slate-950">
      <Header />

      <main className="relative overflow-hidden px-4 py-10 md:py-16">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-blue-100 blur-3xl" />
          <div className="absolute -right-24 bottom-10 h-80 w-80 rounded-full bg-orange-100 blur-3xl" />
        </div>

        <div className="relative mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1fr_460px]">
          {/* COLUMNA COMERCIAL */}
          <section className="hidden lg:block">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-950 text-white shadow-xl">
              <Store className="h-8 w-8" />
            </div>

            <h1 className="max-w-3xl text-5xl font-black leading-tight tracking-tight text-slate-950">
              Entra a tu cuenta y sigue comprando o vendiendo
            </h1>

            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-600">
              Accede a tus publicaciones, edita tus datos de contacto y conecta
              con compradores interesados en tus productos.
            </p>

            <div className="mt-8 grid max-w-2xl gap-4 md:grid-cols-3">
              <div className="rounded-3xl border bg-white p-5 shadow-sm">
                <Search className="mb-3 h-6 w-6 text-blue-950" />
                <h3 className="font-black text-slate-950">Explora</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Encuentra productos cerca de ti.
                </p>
              </div>

              <div className="rounded-3xl border bg-white p-5 shadow-sm">
                <PackagePlus className="mb-3 h-6 w-6 text-orange-600" />
                <h3 className="font-black text-slate-950">Publica</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Sube artículos en minutos.
                </p>
              </div>

              <div className="rounded-3xl border bg-white p-5 shadow-sm">
                <ShieldCheck className="mb-3 h-6 w-6 text-green-700" />
                <h3 className="font-black text-slate-950">Coordina</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Contacta de forma directa.
                </p>
              </div>
            </div>
          </section>

          {/* FORMULARIO */}
          <Card className="rounded-[2rem] border-slate-200 bg-white shadow-2xl">
            <div className="h-3 rounded-t-[2rem] bg-gradient-to-r from-blue-950 via-blue-700 to-orange-500" />

            <CardHeader className="px-6 pt-8 md:px-8">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-950">
                <Lock className="h-7 w-7" />
              </div>

              <CardTitle className="text-3xl font-black text-slate-950">
                Iniciar sesión
              </CardTitle>

              <CardDescription className="text-base">
                Accede para publicar, administrar tus productos y actualizar tus
                datos de vendedor.
              </CardDescription>
            </CardHeader>

            <CardContent className="px-6 pb-8 md:px-8">
              {errorMessage && (
                <div className="mb-5 flex gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <p>{errorMessage}</p>
                </div>
              )}

              {successMessage && (
                <div className="mb-5 flex gap-2 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                  <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <p>{successMessage}</p>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">
                    Correo electrónico
                  </label>

                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="correo@ejemplo.com"
                      className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm outline-none transition focus:border-blue-950 focus:bg-white focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">
                    Contraseña
                  </label>

                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Ingresa tu contraseña"
                      className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-12 text-sm outline-none transition focus:border-blue-950 focus:bg-white focus:ring-2 focus:ring-blue-100"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 text-sm">
                  <label className="flex items-center gap-2 text-slate-500">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300"
                    />
                    Recordarme
                  </label>

                  <Link
                    href="/auth/forgot-password"
                    className="font-semibold text-blue-950 hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-12 w-full rounded-xl bg-blue-950 text-base hover:bg-blue-900"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Ingresando...
                    </>
                  ) : (
                    <>
                      Ingresar
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 rounded-3xl bg-slate-50 p-5 text-center">
                <p className="text-sm text-slate-600">
                  ¿Todavía no tienes cuenta?
                </p>

                <Link href="/auth/register">
                  <Button
                    variant="outline"
                    className="mt-3 h-11 w-full rounded-xl bg-white"
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Crear cuenta gratis
                  </Button>
                </Link>
              </div>

              <div className="mt-5 rounded-3xl border border-blue-100 bg-blue-50/70 p-4 text-sm text-blue-900">
                <div className="mb-2 flex items-center gap-2 font-black">
                  <ShieldCheck className="h-4 w-4" />
                  Recomendación
                </div>

                <p className="leading-relaxed">
                  Mantén tus datos de contacto actualizados para que los
                  compradores puedan comunicarse contigo sin problemas.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
