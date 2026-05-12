'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  AlertCircle,
  CheckCircle,
  User,
  Mail,
  Lock,
  MapPin,
  Venus,
  Mars,
  CircleUserRound,
} from 'lucide-react';

type Gender = 'male' | 'female' | 'neutral';

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [gender, setGender] = useState<Gender>('neutral');
  const [city, setCity] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const genderOptions: {
    value: Gender;
    label: string;
    description: string;
    icon: React.ReactNode;
    emoji: string;
  }[] = [
    {
      value: 'male',
      label: 'Hombre',
      description: 'Avatar masculino',
      icon: <Mars className="h-4 w-4" />,
      emoji: '👨‍💼',
    },
    {
      value: 'female',
      label: 'Mujer',
      description: 'Avatar femenino',
      icon: <Venus className="h-4 w-4" />,
      emoji: '👩‍💼',
    },
    {
      value: 'neutral',
      label: 'Prefiero no decirlo',
      description: 'Avatar neutral',
      icon: <CircleUserRound className="h-4 w-4" />,
      emoji: '🙂',
    },
  ];

  const selectedGender = genderOptions.find((item) => item.value === gender);

  const getUsernameFromEmail = (emailValue: string) => {
    return emailValue.split('@')[0]?.toLowerCase().replace(/[^a-z0-9._-]/g, '') || '';
  };

  const validateForm = () => {
    if (!name.trim()) {
      return 'Ingresa tu nombre completo.';
    }

    if (!email.trim()) {
      return 'Ingresa tu correo electrónico.';
    }

    if (!email.includes('@')) {
      return 'Ingresa un correo electrónico válido.';
    }

    if (!password) {
      return 'Ingresa una contraseña.';
    }

    if (password.length < 6) {
      return 'La contraseña debe tener al menos 6 caracteres.';
    }

    if (password !== confirmPassword) {
      return 'Las contraseñas no coinciden.';
    }

    return '';
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    setError('');
    setSuccess(false);

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);

    try {
      const cleanName = name.trim();
      const cleanEmail = email.trim().toLowerCase();
      const cleanCity = city.trim();
      const username = getUsernameFromEmail(cleanEmail);

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: cleanName,
            name: cleanName,
            username,
            gender,
            city: cleanCity,
            account_type: 'buyer',
          },
        },
      });

      if (signUpError) {
        throw signUpError;
      }

      /*
        La tabla profiles se crea automáticamente por el trigger:
        public.handle_new_user()

        Si Supabase crea sesión inmediata, reforzamos la actualización del perfil.
        Si Supabase requiere confirmación por correo, el perfil igual se creará con metadata.
      */
      if (data.user && data.session) {
        await supabase
          .from('profiles')
          .update({
            full_name: cleanName,
            username,
            email: cleanEmail,
            gender,
            city: cleanCity,
            account_type: 'buyer',
            is_seller: false,
            membership_type: 'free',
            seller_badge: 'standard',
            subscription_status: 'free',
            commission_rate: 8,
            monthly_listing_limit: 3,
          })
          .eq('user_id', data.user.id);
      }

      setSuccess(true);

      setTimeout(() => {
        if (data.session) {
          router.push('/profile');
        } else {
          router.push('/auth/login');
        }
      }, 1500);
    } catch (err: any) {
      setError(
        err?.message ||
          'No se pudo crear la cuenta. Verifica tus datos e intenta nuevamente.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-xl shadow-lg">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-xl font-bold text-primary-foreground">
            S
          </div>

          <CardTitle className="text-3xl">Crear cuenta</CardTitle>

          <CardDescription>
            Regístrate en La Segunda para comprar, vender y publicar productos.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="mb-6 rounded-2xl border bg-white p-5 text-center">
            <p className="mb-3 text-sm font-medium">Avatar inicial</p>

            <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full border-4 border-primary/10 bg-slate-100">
              <span className="text-4xl">{selectedGender?.emoji}</span>
            </div>

            <p className="text-sm text-muted-foreground">
              Tu avatar se asignará según la opción seleccionada.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-green-700">
                <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span className="text-sm">
                  Cuenta creada correctamente. Redirigiendo...
                </span>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Nombre completo</label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Ejemplo: Diego Palomino"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Correo electrónico</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Confirmar contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">Género</label>

              <div className="grid gap-3 md:grid-cols-3">
                {genderOptions.map((option) => {
                  const isSelected = gender === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setGender(option.value)}
                      className={`rounded-xl border p-4 text-left transition hover:bg-muted ${
                        isSelected
                          ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                          : 'border-border bg-white'
                      }`}
                    >
                      <div className="mb-2 flex items-center gap-2">
                        <div
                          className={`flex h-9 w-9 items-center justify-center rounded-full ${
                            isSelected
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {option.icon}
                        </div>

                        <span className="text-sm font-semibold">
                          {option.label}
                        </span>
                      </div>

                      <p className="text-xs text-muted-foreground">
                        {option.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Ciudad opcional</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Ejemplo: Lima"
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading || success}>
              {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
            </Button>
          </form>

          <div className="mt-6 border-t pt-6">
            <p className="mb-4 text-center text-sm text-muted-foreground">
              ¿Ya tienes cuenta?
            </p>

            <Link href="/auth/login">
              <Button variant="outline" className="w-full">
                Inicia sesión
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
