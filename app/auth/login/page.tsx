'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
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
  ArrowLeft,
  CheckCircle,
  Loader2,
  Lock,
  LogIn,
  Mail,
} from 'lucide-react';

function getFriendlyError(message: string) {
  const text = message.toLowerCase();

  if (
    text.includes('email not confirmed') ||
    text.includes('not confirmed') ||
    text.includes('confirm')
  ) {
    return 'Debes confirmar tu correo electrónico antes de iniciar sesión. Revisa tu bandeja de entrada o spam.';
  }

  if (
    text.includes('invalid login credentials') ||
    text.includes('invalid credentials') ||
    text.includes('login credentials')
  ) {
    return 'Correo o contraseña incorrectos.';
  }

  if (text.includes('rate limit')) {
    return 'Has realizado demasiados intentos. Espera unos minutos e intenta nuevamente.';
  }

  if (
    text.includes('failed to fetch') ||
    text.includes('fetch failed') ||
    text.includes('network')
  ) {
    return 'No se pudo conectar con Supabase. Revisa tus variables de entorno en Vercel.';
  }

  return message || 'No se pudo iniciar sesión. Intenta nuevamente.';
}

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('hookaps@gmail.com');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isSubmitting) return;

    const timer = window.setTimeout(() => {
      setIsSubmitting(false);
      setError(
        'La validación está demorando demasiado. El botón fue desbloqueado. Intenta nuevamente.'
      );
    }, 15000);

    return () => window.clearTimeout(timer);
  }, [isSubmitting]);

  const validateForm = () => {
    if (!email.trim()) {
      return 'Ingresa tu correo electrónico.';
    }

    if (!email.includes('@')) {
      return 'Ingresa un correo electrónico válido.';
    }

    if (!password) {
      return 'Ingresa tu contraseña.';
    }

    if (password.length < 6) {
      return 'La contraseña debe tener al menos 6 caracteres.';
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
      await login(email, password);

      setSuccess('Inicio de sesión correcto. Redirigiendo...');

      window.setTimeout(() => {
        router.replace('/profile');
      }, 500);
    } catch (err: any) {
      setError(getFriendlyError(err?.message || 'Error al iniciar sesión.'));
      setIsSubmitting(false);
    }
  };

  const handleUnlockButton = () => {
    setIsSubmitting(false);
    setError('');
    setSuccess('');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-3 text-center">
          <Link
            href="/"
            className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-xl font-bold text-primary-foreground"
          >
            S
          </Link>

          <CardTitle className="text-3xl">Iniciar sesión</CardTitle>

          <CardDescription>
            Accede a tu cuenta de La Segunda para comprar, vender y publicar productos.
          </CardDescription>
        </CardHeader>

        <CardContent>
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
                <span className="text-sm">{success}</span>
              </div>
            )}

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
                  autoComplete="email"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

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
                  autoComplete="current-password"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Validando...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Iniciar sesión
                </>
              )}
            </Button>
          </form>

          {isSubmitting && (
            <Button
              type="button"
              variant="ghost"
              className="mt-3 w-full text-sm"
              onClick={handleUnlockButton}
            >
              Desbloquear botón
            </Button>
          )}

          <div className="mt-6 border-t pt-6">
            <p className="mb-4 text-center text-sm text-muted-foreground">
              ¿No tienes cuenta?
            </p>

            <Link href="/auth/register">
              <Button variant="outline" className="w-full">
                Crear cuenta
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
        </CardContent>
      </Card>
    </div>
  );
}
