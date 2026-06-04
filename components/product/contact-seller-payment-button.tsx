'use client';

import { useState } from 'react';
import { Loader2, MessageCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';

type ContactSellerPaymentButtonProps = {
  productId: string;
  productTitle: string;
};

export function ContactSellerPaymentButton({
  productId,
  productTitle,
}: ContactSellerPaymentButtonProps) {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleContactSeller = async () => {
    if (isLoading) return;

    setErrorMessage('');
    setIsLoading(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;

      if (!accessToken) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch('/api/payments/create-contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          productId,
          productTitle,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.error || 'No se pudo crear el pago para contactar al vendedor.'
        );
      }

      if (!data?.initPoint) {
        throw new Error('Mercado Pago no devolvió un enlace válido.');
      }

      window.location.href = data.initPoint;
    } catch (error: any) {
      setErrorMessage(
        error?.message || 'No se pudo iniciar el contacto protegido.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {errorMessage && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      <Button
        type="button"
        onClick={handleContactSeller}
        disabled={isLoading}
        className="w-full bg-blue-900 hover:bg-blue-950"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Redirigiendo a Mercado Pago...
          </>
        ) : (
          <>
            <MessageCircle className="mr-2 h-4 w-4" />
            Contactar vendedor
          </>
        )}
      </Button>
    </div>
  );
}
