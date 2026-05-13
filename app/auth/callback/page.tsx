'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AuthCallbackPage() {
  const router = useRouter();

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading'
  );
  const [message, setMessage] = useState('Confirmando tu correo...');

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        const currentUrl = new URL(window.location.href);
        const hashParams = new URLSearchParams(
          window.location.hash.replace('#', '')
        );

        const code = currentUrl.searchParams.get('code');
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const errorDescription =
          hashParams.get('error_description') ||
          currentUrl.searchParams.get('error_description');

        if (errorDescription) {
          throw new Error(errorDescription);
        }

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);

          if (error) {
            throw error;
          }
        } else if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            throw error;
          }
        } else {
          const { data, error } = await supabase.auth.getSession();

          if (error) {
            throw error;
          }

          if (!data.session) {
            throw new Error(
              'No se encontró una sesión válida. Vuelve a iniciar sesión.'
            );
          }
        }

        setStatus('success');
        setMessage('Correo confirmado correctamente. Redirigiendo a tu perfil...');

        window.setTimeout(() => {
          router.replace('/profile');
        }, 1500);
      } catch (error: any) {
        setStatus('error');
        setMessage(
          error?.message ||
            'No se pudo confirmar el correo. Intenta iniciar sesión nuevamente.'
        );
      }
    };

    confirmEmail();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl border bg-white p-8 text-center shadow-sm">
        {status === 'loading' && (
          <>
            <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-primary" />

            <h1 className="mb-2 text-2xl font-bold">
              Confirmando correo
            </h1>

            <p className="text-muted-foreground">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-600" />

            <h1 className="mb-2 text-2xl font-bold">
              Correo confirmado
            </h1>

            <p className="text-muted-foreground">{message}</p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="mx-auto mb-4 h-12 w-12 text-red-600" />

            <h1 className="mb-2 text-2xl font-bold">
              No se pudo confirmar
            </h1>

            <p className="mb-6 text-muted-foreground">{message}</p>

            <Link href="/auth/login">
              <Button className="w-full">Ir a iniciar sesión</Button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
