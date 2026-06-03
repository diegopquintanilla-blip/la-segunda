'use client';

import { useState } from 'react';
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
  MapPin,
  Phone,
  ShieldCheck,
  Store,
  User,
} from 'lucide-react';

import { Header } from '@/components/header';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

type ProfilePayload = {
  full_name: string;
  email: string;
  phone: string;
  city: string;
  bio: string;
  gender: string;
  account_type: string;
  verification_status: string;
  is_seller: boolean;
  membership_type: string;
  monthly_listing_limit: number;
  rating: number;
  review_count: number;
};

export default function RegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [gender, setGender] = useState('neutral');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const createProfile = async (userId: string, payload: ProfilePayload) => {
    const byId = await supabase.from('profiles').upsert({
      id: userId,
      ...payload,
    });

    if (!byId.error) return;

    const byUserId = await supabase.from('profiles').upsert({
      user_id: userId,
      ...payload,
    });

    if (byUserId.error) {
      throw byUserId.error;
    }
  };

  const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setErrorMessage('');
    setSuccessMessage('');

    if (!fullName.trim()) {
      setErrorMessage('Ingresa tu nombre completo.');
      return;
    }

    if (!email.trim()) {
      setErrorMessage('Ingresa tu correo electrónico.');
      return;
    }

    if (!phone.trim()) {
      setErrorMessage('Ingresa tu número de teléfono.');
      return;
    }

    if (!city.trim()) {
      setErrorMessage('Ingresa tu ciudad.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('La contraseña debe tener mínimo 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden.');
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            phone: phone.trim(),
            city: city.trim(),
            gender,
          },
        },
      });

      if (error) {
        throw error;
      }

      if (!data.user) {
        throw new Error('No se pudo crear el usuario. Intenta nuevamente.');
      }

      const profilePayload: ProfilePayload = {
        full_name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        city: city.trim(),
        bio: '',
        gender,
        account_type: 'both',
        verification_status: 'pending',
        is_seller: true,
        membership_type: 'free',
        monthly_listing_limit: 2,
        rating: 0,
        review_count: 0,
      };

      try {
        await createProfile(data.user.id, profilePayload);
      } catch (profileError) {
        console.warn('[La Segunda] Perfil pendiente de crear:', profileError);
      }

      const localUser = {
        id: data.user.id,
        email: email.trim(),
        name: fullName.trim(),
        full_name: fullName.trim(),
        phone: phone.trim(),
        city: city.trim(),
        bio: '',
        avatar: '',
        gender,
        accountType: 'both',
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem('la-segunda-auth', 'true');
        localStorage.setItem('la-segunda-user', JSON.stringify(localUser));
      }

      setSuccessMessage('Cuenta creada correctamente. Redirigiendo...');

      setTimeout(() => {
        router.push('/profile');
        router.refresh();
      }, 900);
    } catch (error: any) {
      console.error('[La Segunda] Error registrando usuario:', error?.message);

      const message = String(error?.message || '').toLowerCase();

      if (message.includes('already registered') || message.includes('already exists')) {
        setErrorMessage('Este correo ya está registrado. Inicia sesión.');
      } else if (message.includes('password')) {
        setErrorMessage('La contraseña no cumple los requisitos mínimos.');
      } else {
        setErrorMessage(
          error?.message || 'No se pudo crear la cuenta. Intenta nuevamente.'
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

        <div className="relative mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1fr_500px]">
          <section className="hidden lg:block">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-950 text-white shadow-xl">
              <Store className="h-8 w-8" />
            </div>

            <h1 className="max-w-3xl text-5xl font-black leading-tight tracking-tight text-slate-950">
              Crea tu cuenta y empieza a comprar o vender
            </h1>

            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-600">
              Publica productos, muestra tus datos de contacto y permite que
              compradores interesados se comuniquen contigo directamente.
            </p>

            <div className="mt-8 grid max-w-2xl gap-4 md:grid-cols-3">
              <div className="rounded-3xl border bg-white p-5 shadow-sm">
                <User className="mb-3 h-6 w-6 text-blue-950" />
                <h3 className="font-black text-slate-950">Perfil público</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Muestra nombre, ciudad y contacto.
                </p>
              </div>

              <div className="rounded-3xl border bg-white p-5 shadow-sm">
                <Phone className="mb-3 h-6 w-6 text-orange-600" />
                <h3 className="font-black text-slate-950">Contacto directo</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Facilita llamadas y WhatsApp.
                </p>
              </div>

              <div className="rounded-3xl border bg-white p-5 shadow-sm">
                <ShieldCheck className="mb-3 h-6 w-6 text-green-700" />
                <h3 className="font-black text-slate-950">Más confianza</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Datos claros para concretar ventas.
                </p>
              </div>
            </div>
          </section>

          <Card className="rounded-[2rem] border-slate-200 bg-white shadow-2xl">
            <div className="h-3 rounded-t-[2rem] bg-gradient-to-r from-blue-950 via-blue-700 to-orange-500" />

            <CardHeader className="px-6 pt-8 md:px-8">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-950">
                <User className="h-7 w-7" />
              </div>

              <CardTitle className="text-3xl font-black text-slate-950">
                Crear cuenta
              </CardTitle>

              <CardDescription className="text-base">
                Completa tus datos para publicar productos y recibir consultas.
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

              <form onSubmit={handleRegister} className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-semibold text-slate-700">
                      Nombre completo
                    </label>

                    <div className="relative">
                      <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                      <input
                        value={fullName}
                        onChange={(event) => setFullName(event.target.value)}
                        placeholder="Ejemplo: Diego Palomino"
                        className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm outline-none transition focus:border-blue-950 focus:bg-white focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2">
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
                      Teléfono
                    </label>

                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                      <input
                        value={phone}
                        onChange={(event) => setPhone(event.target.value)}
                        placeholder="929676542"
                        className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm outline-none transition focus:border-blue-950 focus:bg-white focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">
                      Ciudad
                    </label>

                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                      <input
                        value={city}
                        onChange={(event) => setCity(event.target.value)}
                        placeholder="Lima"
                        className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm outline-none transition focus:border-blue-950 focus:bg-white focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-semibold text-slate-700">
                      Género para avatar
                    </label>

                    <select
                      value={gender}
                      onChange={(event) => setGender(event.target.value)}
                      className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-blue-950 focus:bg-white focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="neutral">Neutral</option>
                      <option value="male">Masculino</option>
                      <option value="female">Femenino</option>
                    </select>
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
                        placeholder="Mínimo 6 caracteres"
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

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">
                      Confirmar contraseña
                    </label>

                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(event) =>
                          setConfirmPassword(event.target.value)
                        }
                        placeholder="Repite tu contraseña"
                        className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-12 text-sm outline-none transition focus:border-blue-950 focus:bg-white focus:ring-2 focus:ring-blue-100"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword((value) => !value)
                        }
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-blue-100 bg-blue-50/70 p-4 text-sm text-blue-900">
                  <div className="mb-2 flex items-center gap-2 font-black">
                    <ShieldCheck className="h-4 w-4" />
                    Importante
                  </div>

                  <p className="leading-relaxed">
                    Tu nombre, teléfono, correo y ciudad se usarán como datos de
                    contacto en tus publicaciones.
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-12 w-full rounded-xl bg-blue-950 text-base hover:bg-blue-900"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Creando cuenta...
                    </>
                  ) : (
                    <>
                      Crear cuenta
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 rounded-3xl bg-slate-50 p-5 text-center">
                <p className="text-sm text-slate-600">
                  ¿Ya tienes una cuenta?
                </p>

                <Link href="/auth/login">
                  <Button
                    variant="outline"
                    className="mt-3 h-11 w-full rounded-xl bg-white"
                  >
                    Iniciar sesión
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
