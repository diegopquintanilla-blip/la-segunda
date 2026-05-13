'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertCircle,
  ArrowLeft,
  Loader2,
  Lock,
  LogIn,
  Mail,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setEmail('');
    setPassword('');
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/profile');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) return;

    setError('');

    if (!email.trim()) {
      setError('Ingresa tu correo electrónico.');
      return;
    }

    if (!password.trim()) {
      setError('Ingresa tu contraseña.');
      return;
    }

    setIsSubmitting(true);

    try {
      await login(email.trim().toLowerCase(), password);
      router.push('/profile');
    } catch (err: any) {
      setError(err?.message || 'No se pudo iniciar sesión. Revisa tus datos.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border bg-white p-6 shadow-lg md:p-8">
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-xl font-bold text-primary-foreground"
          >
            S
          </Link>

          <h1 className="text-3xl font-bold text-slate-950">
            Iniciar sesión
          </h1>

          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            Accede a tu cuenta de La Segunda para comprar, vender y publicar productos.
          </p>
        </div>

        {error && (
          <div className="mb-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          autoComplete="off"
          className="space-y-5"
        >
          <div className="space-y-2">
            <label className="text-sm font-medium">Correo electrónico</label>

            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

              <Input
                type="email"
                name="la-segunda-login-email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="correo@ejemplo.com"
                className="pl-9"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="none"
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
                name="la-segunda-login-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                className="pl-9"
                autoComplete="new-password"
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
      </div>
    </div>
  );
}
