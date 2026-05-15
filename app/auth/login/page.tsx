'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle,
  KeyRound,
  Loader2,
  Lock,
  LogIn,
  Mail,
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [isRecoveryLoading, setIsRecoveryLoading] = useState(false);

  const [showRecovery, setShowRecovery] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const clearMessages = () => {
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();

    if (isLoginLoading) return;

    clearMessages();

    if (!email.trim()) {
      setErrorMessage('Ingresa tu correo electrónico.');
      return;
    }

    if (!password.trim()) {
      setErrorMessage('Ingresa tu contraseña.');
      return;
    }

    setIsLoginLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        throw new Error(error.message);
      }

      router.push('/seller/dashboard');
      router.refresh();
    } catch (error: any) {
      setErrorMessage(
        error?.message || 'No se pudo iniciar sesión. Revisa tus datos.'
      );
    } finally {
      setIsLoginLoading(false);
    }
  };

  const handlePasswordRecovery = async (event: React.FormEvent) => {
    event.preventDefault();

    if (isRecoveryLoading) return;

    clearMessages();

    if (!email.trim()) {
      setErrorMessage('Ingresa tu correo para enviarte la recuperación.');
      return;
    }

    setIsRecoveryLoading(true);

    try {
      const redirectTo =
        typeof window !== 'undefined'
          ? `${window.location.origin}/auth/update-password`
          : 'https://lasegundamarket.app/auth/update-password';

      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo,
        }
      );

      if (error) {
        throw new Error(error.message);
      }

      setSuccessMessage(
        'Si el correo está registrado, recibirás un enlace para recuperar tu contraseña.'
      );
    } catch (error: any) {
      setErrorMessage(
        error?.message || 'No se pudo enviar el correo de recuperación.'
      );
    } finally {
      setIsRecoveryLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border bg-white p-8 shadow-xl">
        <div className="mb-8 text-center">
          <Link href="/" className="mb-6 inline-flex justify-center">
            <Image
              src="/lasegunda.png"
              alt="La Segunda Market"
              width={190}
              height={70}
              priority
              className="h-auto w-48 object-contain"
            />
          </Link>

          <h1 className="text-3xl font-bold">
            {showRecovery ? 'Recuperar contraseña' : 'Iniciar sesión'}
          </h1>

          <p className="mt-3 text-sm text-muted-foreground">
            {showRecovery
              ? 'Ingresa tu correo y te enviaremos un enlace para cambiar tu contraseña.'
              : 'Accede a tu cuenta de La Segunda para comprar, vender y publicar productos.'}
          </p>
        </div>

        {successMessage && (
          <div className="mb-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            <div className="flex items-start gap-2">
              <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        {!showRecovery ? (
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Correo electrónico
              </label>

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="correo@ejemplo.com"
                  className="pl-10"
                  disabled={isLoginLoading}
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Contraseña
              </label>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Ingresa tu contraseña"
                  className="pl-10"
                  disabled={isLoginLoading}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  clearMessages();
                  setShowRecovery(true);
                }}
                className="text-sm font-semibold text-blue-900 hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-900 hover:bg-blue-950"
              disabled={isLoginLoading}
            >
              {isLoginLoading ? (
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

            <div className="border-t pt-5 text-center">
              <p className="mb-3 text-sm text-muted-foreground">
                ¿No tienes cuenta?
              </p>

              <Link href="/auth/register">
                <Button type="button" variant="outline" className="w-full">
                  Crear cuenta
                </Button>
              </Link>
            </div>
          </form>
        ) : (
          <form onSubmit={handlePasswordRecovery} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Correo electrónico
              </label>

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="correo@ejemplo.com"
                  className="pl-10"
                  disabled={isRecoveryLoading}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-900 hover:bg-blue-950"
              disabled={isRecoveryLoading}
            >
              {isRecoveryLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <KeyRound className="mr-2 h-4 w-4" />
                  Enviar enlace de recuperación
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={isRecoveryLoading}
              onClick={() => {
                clearMessages();
                setShowRecovery(false);
              }}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al inicio de sesión
            </Button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-blue-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>
        </div>
      </div>
    </main>
  );
}
