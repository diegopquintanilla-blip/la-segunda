'use client';

import { Header } from '@/components/header';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { mockChatMessages, mockUsers } from '@/lib/mock-data';
import { Send, Search, MoreVertical } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  avatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unread: boolean;
}

export default function ChatPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [selectedConversation, setSelectedConversation] = useState<string | null>('conv1');
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState(mockChatMessages);

  if (!isAuthenticated || !user) {
    router.push('/auth/login');
    return null;
  }

  // Mock conversations
  const conversations: Conversation[] = [
    {
      id: 'conv1',
      participantId: '2',
      participantName: 'Carlos López',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos',
      lastMessage: 'Esta tarde alrededor de las 5 pm?',
      lastMessageTime: '2024-05-03 15:00',
      unread: true,
    },
    {
      id: 'conv2',
      participantId: '3',
      participantName: 'Ana Rodríguez',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana',
      lastMessage: 'Perfecto, el producto llegó en perfectas condiciones',
      lastMessageTime: '2024-05-02 14:30',
      unread: false,
    },
    {
      id: 'conv3',
      participantId: '1',
      participantName: 'María García',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
      lastMessage: '¿Aún disponible el iPhone?',
      lastMessageTime: '2024-05-01 10:00',
      unread: false,
    },
  ];

  const currentConversation = conversations.find(
    (c) => c.id === selectedConversation
  );
  const conversationMessages = messages.filter(
    (m) => m.conversationId === selectedConversation
  );

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedConversation) return;

    const newMessage = {
      id: `msg-${Date.now()}`,
      conversationId: selectedConversation,
      senderId: user.id,
      senderName: user.name,
      message: messageInput,
      timestamp: new Date().toLocaleString('es-PE'),
      read: true,
    };

    setMessages([...messages, newMessage]);
    setMessageInput('');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Mensajes</h1>

        <div className="grid lg:grid-cols-3 gap-6 h-[600px]">
          {/* Conversations List */}
          <div className="lg:col-span-1 bg-card rounded-lg border overflow-hidden flex flex-col">
            {/* Search */}
            <div className="p-4 border-b">
              <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
                <Search className="w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar conversaciones..."
                  className="bg-transparent outline-none text-sm flex-1"
                />
              </div>
            </div>

            {/* Conversations */}
            <div className="flex-1 overflow-y-auto">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv.id)}
                  className={`w-full p-4 border-b text-left hover:bg-muted transition ${
                    selectedConversation === conv.id ? 'bg-muted' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={conv.avatar}
                      alt={conv.participantName}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-sm">
                          {conv.participantName}
                        </h3>
                        {conv.unread && (
                          <div className="w-2 h-2 bg-primary rounded-full" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {conv.lastMessage}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {conv.lastMessageTime}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Chat Window */}
          <div className="lg:col-span-2 bg-card rounded-lg border overflow-hidden flex flex-col">
            {currentConversation ? (
              <>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                  <div className="flex items-center gap-3">
                    <img
                      src={currentConversation.avatar}
                      alt={currentConversation.participantName}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <h2 className="font-semibold">
                        {currentConversation.participantName}
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        Línea 👀 Activo ahora
                      </p>
                    </div>
                  </div>
                  <button className="p-2 hover:bg-muted rounded-lg">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {conversationMessages.map((msg) => {
                    const isOwn = msg.senderId === user.id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className="max-w-xs">
                          <div
                            className={`px-4 py-2 rounded-lg ${
                              isOwn
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-foreground'
                            }`}
                          >
                            <p className="text-sm">{msg.message}</p>
                          </div>
                          <p
                            className={`text-xs text-muted-foreground mt-1 ${
                              isOwn ? 'text-right' : 'text-left'
                            }`}
                          >
                            {msg.timestamp}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Input */}
                <div className="p-4 border-t flex gap-2">
                  <Input
                    type="text"
                    placeholder="Escribe tu mensaje..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim()}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <p className="text-lg mb-2">Selecciona una conversación</p>
                  <p className="text-sm">
                    Elige una conversación de la lista para empezar
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
