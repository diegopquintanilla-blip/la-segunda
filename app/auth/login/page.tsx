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
  ArrowLeft,
  CheckCircle,
  Loader2,
  Lock,
  LogIn,
  Mail,
} from 'lucide-react';

type LoginResult = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  user: {
    id: string;
    email?: string;
    user_metadata?: {
      full_name?: string;
      name?: string;
    };
  };
};

function getSupabaseStorageKey() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';

  try {
    const host = new URL(supabaseUrl).hostname;
    const projectRef = host.split('.')[0];

    return `sb-${projectRef}-auth-token`;
  } catch {
    return 'supabase-auth-token';
  }
}

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
    return 'No se pudo conectar con Supabase. Revisa NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en Vercel.';
  }

  return message || 'No se pudo iniciar sesión. Intenta nuevamente.';
}

async function loginWithRestFallback(email: string, password: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Faltan variables NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY.'
    );
  }

  const controller = new AbortController();

  const timeout = window.setTimeout(() => {
    controller.abort();
  }, 12000);

  try {
    const response = await fetch(
      `${supabaseUrl}/auth/v1/token?grant_type=password`,
      {
        method: 'POST',
        signal: controller.signal,
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result?.error_description ||
          result?.msg ||
          result?.message ||
          'No se pudo iniciar sesión.'
      );
    }

    return result as LoginResult;
  } finally {
    window.clearTimeout(timeout);
  }
}

function saveSessionInBrowser(result: LoginResult) {
  const expiresAt = Math.floor(Date.now() / 1000) + Number(result.expires_in || 3600);

  const supabaseSession = {
    access_token: result.access_token,
    refresh_token: result.refresh_token,
    expires_in: result.expires_in,
    expires_at: expiresAt,
    token_type: result.token_type || 'bearer',
    user: result.user,
  };

  const storageKey = getSupabaseStorageKey();

  localStorage.setItem(storageKey, JSON.stringify(supabaseSession));

  localStorage.setItem(
    'currentUser',
    JSON.stringify({
      id: result.user.id,
      email: result.user.email || '',
      name:
        result.user.user_metadata?.full_name ||
        result.user.user_metadata?.name ||
        result.user.email?.split('@')[0] ||
        'Usuario La Segunda',
      avatar: '',
      rating: 0,
      reviewCount: 0,
      isSeller: false,
      joinDate: new Date().toISOString().split('T')[0],
      verificationStatus: 'pending',
      gender: 'neutral',
      city: 'Lima',
      accountType: 'buyer',
      membershipType: 'free',
    })
  );
}

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('hookaps@gmail.com');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      const cleanEmail = email.trim().toLowerCase();

      const result = await loginWithRestFallback(cleanEmail, password);

      saveSessionInBrowser(result);

      try {
        await supabase.auth.setSession({
          access_token: result.access_token,
          refresh_token: result.refresh_token,
        });
      } catch {
        console.log('[La Segunda] Sesión guardada en localStorage.');
      }

      setSuccess('Inicio de sesión correcto. Redirigiendo...');

      window.setTimeout(() => {
        router.replace('/profile');
        router.refresh();
      }, 700);
    } catch (err: any) {
      setError(getFriendlyError(err?.message || 'Error al iniciar sesión.'));
      setIsSubmitting(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (isSubmitting) return;

    setError('');
    setSuccess('');

    if (!email.trim() || !email.includes('@')) {
      setError('Ingresa tu correo electrónico para reenviar la confirmación.');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim().toLowerCase(),
      });

      if (resendError) {
        throw resendError;
      }

      setSuccess('Correo de confirmación reenviado. Revisa tu bandeja o spam.');
    } catch (err: any) {
      setError(
        getFriendlyError(
          err?.message || 'No se pudo reenviar el correo de confirmación.'
        )
      );
    } finally {
      setIsSubmitting(false);
    }
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

          <div className="mt-4">
            <Button
              type="button"
              variant="ghost"
              className="w-full text-sm"
              onClick={handleResendConfirmation}
              disabled={isSubmitting}
            >
              Reenviar correo de confirmación
            </Button>
          </div>

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

          <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
            Si el usuario está en estado “Waiting for verification” en Supabase,
            primero confirma el correo o desactiva la confirmación por email para pruebas.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
