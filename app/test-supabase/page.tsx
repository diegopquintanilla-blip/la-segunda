'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function TestSupabasePage() {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [categoriesCount, setCategoriesCount] = useState<number | null>(null);
  const [membershipsCount, setMembershipsCount] = useState<number | null>(null);
  const [error, setError] = useState('');

  const testConnection = async () => {
    setLoading(true);
    setStatus('');
    setError('');

    try {
      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select('*');

      if (categoriesError) {
        throw categoriesError;
      }

      const { data: memberships, error: membershipsError } = await supabase
        .from('memberships')
        .select('*');

      if (membershipsError) {
        throw membershipsError;
      }

      setCategoriesCount(categories?.length || 0);
      setMembershipsCount(memberships?.length || 0);
      setStatus('Conexión exitosa con Supabase');
    } catch (err: any) {
      setError(err.message || 'Error conectando con Supabase');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Prueba de conexión Supabase</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {loading && (
              <p className="text-muted-foreground">
                Probando conexión con Supabase...
              </p>
            )}

            {status && (
              <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-green-800">
                ✅ {status}
              </div>
            )}

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
                ❌ {error}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border bg-white p-4">
                <p className="text-sm text-muted-foreground">Categorías</p>
                <p className="text-3xl font-bold">
                  {categoriesCount ?? '-'}
                </p>
              </div>

              <div className="rounded-lg border bg-white p-4">
                <p className="text-sm text-muted-foreground">Membresías</p>
                <p className="text-3xl font-bold">
                  {membershipsCount ?? '-'}
                </p>
              </div>
            </div>

            <Button onClick={testConnection} disabled={loading}>
              Probar otra vez
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
