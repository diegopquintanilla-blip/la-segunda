'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Loader2,
  Lock,
  Mail,
  MapPin,
  User,
  Venus,
  Mars,
  CircleUserRound,
} from 'lucide-react';

type Gender = 'male' | 'female' | 'neutral';

const LOGO_SRC = '/lasegunda.png';

function getRegisterErrorMessage(err: any) {
  const rawMessage = String(
    err?.message ||
      err?.error_description ||
      err?.error ||
      err?.code ||
      ''
  ).toLowerCase();

  const rawStatus = String(err?.status || '').toLowerCase();

  if (
    rawMessage.includes('email rate limit exceeded') ||
    rawMessage.includes('over_email_send_rate_limit') ||
    rawMessage.includes('rate limit') ||
    rawMessage.includes('too many requests') ||
    rawStatus === '429'
  ) {
    return 'Estamos recibiendo muchos registros en este momento. Espera unos minutos e intenta nuevamente.';
  }

  if (
    rawMessage.includes('user already registered') ||
    rawMessage.includes('already registered') ||
    rawMessage.includes('already exists') ||
    rawMessage.includes('email already')
  ) {
    return 'Este correo ya está registrado. Intenta iniciar sesión o usa otro correo.';
  }

  if (
    rawMessage.includes('invalid email') ||
    rawMessage.includes('signup requires a valid email')
  ) {
    return 'Ingresa un correo electrónico válido.';
  }

  if (
    rawMessage.includes('password') &&
    rawMessage.includes('weak')
  ) {
    return 'La contraseña es muy débil. Usa una contraseña más segura.';
  }

  if (
    rawMessage.includes('network') ||
    rawMessage.includes('failed to fetch')
  ) {
    return 'No se pudo conectar con el servidor. Revisa tu conexión e intenta nuevamente.';
  }

  return 'No se pudo crear la cuenta. Intenta nuevamente.';
}

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [gender, setGender] = useState<Gender>('neutral');
  const [city, setCity] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const avatarPreview = {
    male: '👨',
    female: '👩',
    neutral: '🙂',
  };

  const validateForm = () => {
    const cleanEmail = email.trim().toLowerCase();

    if (!name.trim()) {
      return 'Ingresa tu nombre completo.';
    }

    if (!cleanEmail) {
      return 'Ingresa tu correo electrónico.';
    }

    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) return;

    setError('');
    setSuccess('');

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      await register(
        name.trim(),
        email.trim().toLowerCase(),
        password,
        gender,
        city.trim()
      );

      setSuccess(
        'Cuenta creada correctamente. Revisa tu correo para confirmar tu cuenta.'
      );

      window.setTimeout(() => {
        router.push('/auth/login');
      }, 1600);
    } catch (err: any) {
      setError(getRegisterErrorMessage(err));
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto w-full max-w-2xl rounded-2xl border bg-white p-6 shadow-sm md:p-8">
        <div className="mb-8 text-center">
          <Link href="/" className="mx-auto mb-5 flex justify-center">
            {!logoError ? (
              <div className="flex h-20 w-[260px] items-center justify-center overflow-hidden rounded-xl bg-white">
                <img
                  src={LOGO_SRC}
                  alt="La Segunda"
                  onError={() => setLogoError(true)}
                  className="h-full w-full object-cover object-center"
                />
              </div>
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-xl font-bold text-primary-foreground">
                S
              </div>
            )}
          </Link>

          <h1 className="text-3xl font-bold text-slate-950">
            Crear cuenta
          </h1>

          <p className="mt-3 text-muted-foreground">
            Regístrate en La Segunda para comprar, vender y publicar productos.
          </p>
        </div>

        <div className="mb-6 rounded-2xl border bg-white p-5 text-center">
          <h2 className="mb-4 font-semibold">Avatar inicial</h2>

          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full border-4 border-slate-200 bg-slate-100 text-4xl">
            {avatarPreview[gender]}
          </div>

          <p className="text-sm text-muted-foreground">
            Tu avatar se asignará según la opción seleccionada.
          </p>
        </div>

        {error && (
          <div className="mb-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-5 flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 p-4 text-green-700">
            <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <p className="text-sm">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nombre completo</label>

            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

              <Input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Ejemplo: Julio Diaz"
                className="pl-9"
                disabled={isSubmitting}
                autoComplete="name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Correo electrónico</label>

            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

              <Input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="correo@ejemplo.com"
                className="pl-9"
                disabled={isSubmitting}
                autoComplete="email"
                autoCapitalize="none"
                autoCorrect="off"
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
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  className="pl-9"
                  disabled={isSubmitting}
                  autoComplete="new-password"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Confirmar contraseña</label>

              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="••••••••"
                  className="pl-9"
                  disabled={isSubmitting}
                  autoComplete="new-password"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium">Género</label>

            <div className="grid gap-3 md:grid-cols-3">
              <button
                type="button"
                onClick={() => setGender('male')}
                disabled={isSubmitting}
                className={`rounded-xl border p-4 text-left transition ${
                  gender === 'male'
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                    : 'hover:bg-slate-50'
                }`}
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-primary">
                  <Mars className="h-5 w-5" />
                </div>

                <p className="font-semibold">Hombre</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Avatar masculino
                </p>
              </button>

              <button
                type="button"
                onClick={() => setGender('female')}
                disabled={isSubmitting}
                className={`rounded-xl border p-4 text-left transition ${
                  gender === 'female'
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                    : 'hover:bg-slate-50'
                }`}
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-primary">
                  <Venus className="h-5 w-5" />
                </div>

                <p className="font-semibold">Mujer</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Avatar femenino
                </p>
              </button>

              <button
                type="button"
                onClick={() => setGender('neutral')}
                disabled={isSubmitting}
                className={`rounded-xl border p-4 text-left transition ${
                  gender === 'neutral'
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                    : 'hover:bg-slate-50'
                }`}
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <CircleUserRound className="h-5 w-5" />
                </div>

                <p className="font-semibold">Prefiero no decirlo</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Avatar neutral
                </p>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Ciudad opcional</label>

            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

              <Input
                value={city}
                onChange={(event) => setCity(event.target.value)}
                placeholder="Ejemplo: Lima"
                className="pl-9"
                disabled={isSubmitting}
                autoComplete="address-level2"
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creando cuenta...
              </>
            ) : (
              'Crear cuenta'
            )}
          </Button>
        </form>

        <div className="mt-6 border-t pt-6">
          <p className="mb-4 text-center text-sm text-muted-foreground">
            ¿Ya tienes cuenta?
          </p>

          <Link href="/auth/login">
            <Button variant="outline" className="w-full">
              Iniciar sesión
            </Button>
          </Link>
        </div>

        <div className="mt-4">
          <Link href="/">
            <Button variant="ghost" className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al inicio
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
