'use client';

import { useEffect, useState } from 'react';
import {
  Bot,
  CheckCircle,
  LifeBuoy,
  Loader2,
  MessageCircle,
  Send,
  X,
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

const categories = [
  { value: 'general', label: 'Consulta general' },
  { value: 'cuenta', label: 'Cuenta o acceso' },
  { value: 'publicacion', label: 'Publicar producto' },
  { value: 'membresia', label: 'Membresía' },
  { value: 'pago', label: 'Pagos' },
  { value: 'reporte', label: 'Reportar problema' },
];

export function SupportBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [category, setCategory] = useState('general');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const [error, setError] = useState('');
  const [botReply, setBotReply] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const loadCurrentUser = async () => {
      const { data } = await supabase.auth.getUser();

      if (data.user) {
        setUserEmail(data.user.email || '');

        const fullName =
          data.user.user_metadata?.full_name ||
          data.user.user_metadata?.name ||
          '';

        if (fullName) {
          setUserName(fullName);
        }
      }
    };

    loadCurrentUser();
  }, []);

  const resetMessages = () => {
    setError('');
    setBotReply('');
    setSuccess(false);
  };

  const resetForm = () => {
    setCategory('general');
    setSubject('');
    setMessage('');
    resetMessages();
  };

  const handleClose = () => {
    setIsOpen(false);

    window.setTimeout(() => {
      resetForm();
    }, 250);
  };

  const handleSend = async (event: React.FormEvent) => {
    event.preventDefault();

    if (isSending) return;

    resetMessages();

    if (!subject.trim()) {
      setError('Ingresa el asunto de tu consulta.');
      return;
    }

    if (!message.trim() || message.trim().length < 10) {
      setError('Escribe un mensaje de al menos 10 caracteres.');
      return;
    }

    setIsSending(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;

      const response = await fetch('/api/support/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          userName: userName.trim(),
          userEmail: userEmail.trim(),
          category,
          subject: subject.trim(),
          message: message.trim(),
          pageUrl: window.location.href,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || 'No se pudo enviar tu mensaje.');
      }

      setSuccess(true);
      setBotReply(
        data?.botReply ||
          'Gracias por escribirnos. Hemos recibido tu mensaje correctamente.'
      );

      setSubject('');
      setMessage('');
    } catch (error: any) {
      setError(error?.message || 'No se pudo enviar tu mensaje.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-5 right-5 z-[9999] flex items-center gap-2 rounded-full bg-blue-900 px-5 py-3 text-sm font-bold text-white shadow-2xl transition hover:scale-105 hover:bg-blue-950"
        aria-label="Abrir soporte"
      >
        <MessageCircle className="h-5 w-5" />
        Soporte
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-end justify-end bg-black/40 p-4 sm:p-6">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between bg-blue-900 px-5 py-4 text-white">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15">
                  <Bot className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="font-bold">Bot de soporte</h2>
                  <p className="text-xs text-white/80">
                    La Segunda Market
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="rounded-full p-2 hover:bg-white/10"
                aria-label="Cerrar soporte"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[75vh] overflow-y-auto p-5">
              <div className="mb-4 rounded-xl bg-slate-100 p-4 text-sm text-slate-700">
                <div className="mb-2 flex items-center gap-2 font-semibold text-slate-900">
                  <LifeBuoy className="h-4 w-4" />
                  ¿En qué podemos ayudarte?
                </div>
                Escríbenos tu consulta. El bot registrará tu caso y enviará una
                alerta al correo de soporte.
              </div>

              {success && (
                <div className="mb-4 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                  <div className="mb-1 flex items-center gap-2 font-semibold">
                    <CheckCircle className="h-4 w-4" />
                    Mensaje enviado
                  </div>
                  {botReply}
                </div>
              )}

              {error && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {error}
                </div>
              )}

              <form onSubmit={handleSend} className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">
                      Nombre
                    </label>
                    <input
                      value={userName}
                      onChange={(event) => setUserName(event.target.value)}
                      placeholder="Tu nombre"
                      className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-900"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">
                      Correo
                    </label>
                    <input
                      type="email"
                      value={userEmail}
                      onChange={(event) => setUserEmail(event.target.value)}
                      placeholder="correo@ejemplo.com"
                      className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Categoría
                  </label>
                  <select
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                    className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-900"
                  >
                    {categories.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Asunto
                  </label>
                  <input
                    value={subject}
                    onChange={(event) => setSubject(event.target.value)}
                    placeholder="Ejemplo: No puedo publicar mi producto"
                    className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-900"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Mensaje
                  </label>
                  <textarea
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder="Describe tu problema o consulta..."
                    rows={4}
                    className="w-full resize-none rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-900"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSending}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-950 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Enviar mensaje
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
