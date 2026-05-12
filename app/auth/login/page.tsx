'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAuth } from '@/lib/auth-context';
import {
  AlertCircle,
  CheckCircle,
  Lock,
  Mail,
  ArrowLeft,
  LogIn,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const getFriendlyError = (message: string) => {
    const lowerMessage = message.toLowerCase();

    if (
      lowerMessage.includes('email not confirmed') ||
      lowerMessage.includes('not confirmed') ||
      lowerMessage.includes('confirm')
    ) {
      return 'Debes confirmar tu correo electrónico antes de iniciar sesión. Revisa tu bandeja de entrada o spam.';
    }

    if (
      lowerMessage.includes('invalid login credentials') ||
      lowerMessage.includes('invalid credentials') ||
      lowerMessage.includes('login credentials')
    ) {
      return 'Correo o contraseña incorrectos.';
    }

    if (lowerMessage.includes('rate limit')) {
      return 'Has realizado demasiados intentos. Espera unos minutos e intenta nuevamente.';
    }

    return message || 'No se pudo iniciar sesión. Intenta nuevamente.';
  };

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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    setError('');
    setSuccess(false);

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      await login(email.trim().toLowerCase(), password);

      setSuccess(true);

      setTimeout(() => {
        router.push('/profile');
        router.refresh();
      }, 800);
    } catch (err: any) {
      setError(getFriendlyError(err?.message || 'Error al iniciar sesión'));
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
                <span className="text-sm">
                  Inicio de sesión correcto. Redirigiendo...
                </span>
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
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || success}
            >
              {isLoading ? (
                'Validando...'
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

          <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
            Si acabas de registrarte, primero confirma tu correo electrónico desde
            el email enviado por Supabase.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
