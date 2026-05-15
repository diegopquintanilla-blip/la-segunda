'use client';

import { Header } from '@/components/header';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertCircle,
  Bot,
  CheckCircle,
  Clock,
  Inbox,
  LifeBuoy,
  Loader2,
  MessageCircle,
  RefreshCw,
  Send,
  ShieldCheck,
  User,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

type SupportMessage = {
  id: string;
  user_id: string | null;
  user_name: string | null;
  user_email: string | null;
  category: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  page_url: string | null;
  bot_reply: string | null;
  created_at: string;
  updated_at: string;
};

const categories = [
  { value: 'general', label: 'Consulta general' },
  { value: 'cuenta', label: 'Cuenta o acceso' },
  { value: 'publicacion', label: 'Publicar producto' },
  { value: 'membresia', label: 'Membresía' },
  { value: 'pago', label: 'Pagos' },
  { value: 'reporte', label: 'Reportar problema' },
];

function formatDate(value?: string | null) {
  if (!value) return '';

  return new Intl.DateTimeFormat('es-PE', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function getStatusLabel(status: string) {
  if (status === 'open') return 'Abierto';
  if (status === 'in_progress') return 'En revisión';
  if (status === 'resolved') return 'Resuelto';
  if (status === 'closed') return 'Cerrado';

  return 'Abierto';
}

function getStatusClass(status: string) {
  if (status === 'resolved') return 'bg-green-100 text-green-800';
  if (status === 'closed') return 'bg-slate-100 text-slate-700';
  if (status === 'in_progress') return 'bg-blue-100 text-blue-800';

  return 'bg-amber-100 text-amber-800';
}

function getPriorityLabel(priority: string) {
  if (priority === 'urgent') return 'Urgente';
  if (priority === 'high') return 'Alta';
  if (priority === 'low') return 'Baja';

  return 'Normal';
}

function getCategoryLabel(category: string) {
  return categories.find((item) => item.value === category)?.label || 'Consulta general';
}

export default function MessagesPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const [pageError, setPageError] = useState('');
  const [pageSuccess, setPageSuccess] = useState('');

  const [category, setCategory] = useState('general');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  const selectedMessage = useMemo(() => {
    return messages.find((item) => item.id === selectedMessageId) || messages[0] || null;
  }, [messages, selectedMessageId]);

  const loadSupportMessages = async () => {
    setIsLoading(true);
    setPageError('');

    try {
      const { data, error } = await supabase
        .from('support_messages')
        .select(
          `
          id,
          user_id,
          user_name,
          user_email,
          category,
          subject,
          message,
          status,
          priority,
          page_url,
          bot_reply,
          created_at,
          updated_at
        `
        )
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      const supportMessages = (data || []) as SupportMessage[];

      setMessages(supportMessages);

      if (!selectedMessageId && supportMessages.length > 0) {
        setSelectedMessageId(supportMessages[0].id);
      }

      if (
        selectedMessageId &&
        supportMessages.length > 0 &&
        !supportMessages.some((item) => item.id === selectedMessageId)
      ) {
        setSelectedMessageId(supportMessages[0].id);
      }
    } catch (error: any) {
      setPageError(
        error?.message ||
          'No se pudieron cargar tus mensajes de soporte.'
      );
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      loadSupportMessages();
    }
  }, [isAuthenticated, user]);

  const handleSendSupportMessage = async (event: React.FormEvent) => {
    event.preventDefault();

    if (isSending) return;

    setPageError('');
    setPageSuccess('');

    if (!subject.trim()) {
      setPageError('Ingresa el asunto de tu consulta.');
      return;
    }

    if (!message.trim() || message.trim().length < 10) {
      setPageError('El mensaje debe tener al menos 10 caracteres.');
      return;
    }

    setIsSending(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;

      if (!accessToken) {
        throw new Error('Tu sesión expiró. Vuelve a iniciar sesión.');
      }

      const response = await fetch('/api/support/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          userName:
            user?.fullName ||
            user?.name ||
            user?.email ||
            'Usuario La Segunda',
          userEmail: user?.email || '',
          category,
          subject: subject.trim(),
          message: message.trim(),
          pageUrl: window.location.href,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || 'No se pudo enviar el mensaje.');
      }

      setPageSuccess('Tu mensaje fue enviado a soporte correctamente.');
      setSubject('');
      setMessage('');
      setCategory('general');

      await loadSupportMessages();

      if (data?.messageId) {
        setSelectedMessageId(data.messageId);
      }
    } catch (error: any) {
      setPageError(error?.message || 'No se pudo enviar el mensaje.');
    } finally {
      setIsSending(false);
    }
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
              <LifeBuoy className="h-3.5 w-3.5" />
              Centro de soporte
            </div>

            <h1 className="text-3xl font-bold">Mensajes de soporte</h1>

            <p className="mt-1 text-muted-foreground">
              Revisa tus consultas enviadas al soporte de La Segunda Market.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={loadSupportMessages}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Actualizar
          </Button>
        </div>

        {pageSuccess && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              {pageSuccess}
            </div>
          </div>
        )}

        {pageError && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {pageError}
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
          <section className="rounded-2xl border bg-white shadow-sm">
            <div className="border-b p-4">
              <div className="relative">
                <MessageCircle className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value="Soporte La Segunda Market"
                  readOnly
                  className="pl-9"
                />
              </div>
            </div>

            <div className="max-h-[650px] overflow-y-auto">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center px-4 py-16 text-center text-muted-foreground">
                  <Loader2 className="mb-3 h-8 w-8 animate-spin" />
                  Cargando mensajes...
                </div>
              ) : messages.length > 0 ? (
                messages.map((item) => {
                  const isSelected = selectedMessage?.id === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedMessageId(item.id)}
                      className={`w-full border-b p-4 text-left transition hover:bg-slate-50 ${
                        isSelected ? 'bg-blue-50' : 'bg-white'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-900 text-white">
                          <Bot className="h-5 w-5" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <h3 className="line-clamp-1 font-semibold">
                              {item.subject}
                            </h3>

                            <span
                              className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${getStatusClass(
                                item.status
                              )}`}
                            >
                              {getStatusLabel(item.status)}
                            </span>
                          </div>

                          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                            {item.message}
                          </p>

                          <div className="mt-2 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                            <span>{getCategoryLabel(item.category)}</span>
                            <span>{formatDate(item.created_at)}</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                  <Inbox className="mb-3 h-12 w-12 text-muted-foreground" />
                  <h3 className="font-semibold">Aún no tienes mensajes</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Envía tu primera consulta de soporte desde el formulario.
                  </p>
                </div>
              )}
            </div>
          </section>

          <section className="rounded-2xl border bg-white shadow-sm">
            <div className="flex items-center justify-between border-b p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-900 text-white">
                  <Bot className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="font-bold">Soporte La Segunda Market</h2>
                  <p className="text-sm text-muted-foreground">
                    Canal oficial de atención
                  </p>
                </div>
              </div>

              <ShieldCheck className="h-5 w-5 text-blue-900" />
            </div>

            <div className="min-h-[420px] space-y-5 bg-slate-50 p-5">
              {selectedMessage ? (
                <>
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-700">
                      <User className="h-4 w-4" />
                    </div>

                    <div className="max-w-2xl rounded-2xl rounded-tl-sm bg-white p-4 shadow-sm">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="font-semibold">
                          {selectedMessage.user_name || 'Tú'}
                        </span>

                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                          {getCategoryLabel(selectedMessage.category)}
                        </span>

                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                          Prioridad {getPriorityLabel(selectedMessage.priority)}
                        </span>
                      </div>

                      <h3 className="mb-2 font-bold">
                        {selectedMessage.subject}
                      </h3>

                      <p className="whitespace-pre-line text-sm leading-6 text-slate-700">
                        {selectedMessage.message}
                      </p>

                      <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        {formatDate(selectedMessage.created_at)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-blue-900 text-white">
                      <Bot className="h-4 w-4" />
                    </div>

                    <div className="max-w-2xl rounded-2xl rounded-tl-sm bg-blue-900 p-4 text-white shadow-sm">
                      <div className="mb-2 font-semibold">
                        Bot de soporte
                      </div>

                      <p className="text-sm leading-6 text-white/90">
                        {selectedMessage.bot_reply ||
                          'Gracias por escribirnos. Hemos recibido tu consulta y será revisada por soporte.'}
                      </p>

                      <div className="mt-3 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs">
                        Estado: {getStatusLabel(selectedMessage.status)}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex min-h-[380px] flex-col items-center justify-center text-center">
                  <MessageCircle className="mb-3 h-12 w-12 text-muted-foreground" />
                  <h3 className="font-semibold">Selecciona un mensaje</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Aquí verás la conversación con soporte.
                  </p>
                </div>
              )}
            </div>

            <form
              onSubmit={handleSendSupportMessage}
              className="border-t bg-white p-5"
            >
              <div className="grid gap-3 md:grid-cols-[180px_1fr]">
                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  disabled={isSending}
                  className="rounded-xl border bg-white px-3 py-3 text-sm outline-none focus:border-blue-900"
                >
                  {categories.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>

                <Input
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                  placeholder="Asunto de tu consulta"
                  disabled={isSending}
                  className="h-12 rounded-xl"
                />
              </div>

              <div className="mt-3 flex gap-3">
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Escribe tu mensaje al soporte..."
                  disabled={isSending}
                  rows={3}
                  className="min-h-[52px] flex-1 resize-none rounded-xl border px-4 py-3 text-sm outline-none focus:border-blue-900 disabled:opacity-60"
                />

                <Button
                  type="submit"
                  disabled={isSending}
                  className="h-auto min-w-[120px] rounded-xl bg-blue-900 hover:bg-blue-950"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Enviar
                    </>
                  )}
                </Button>
              </div>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}
