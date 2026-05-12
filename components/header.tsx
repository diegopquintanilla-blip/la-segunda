'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { Search, Heart, MessageSquare, User, Menu, LogOut } from 'lucide-react';
import { useState } from 'react';

export function Header() {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <header className="border-b bg-card sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold">
              S
            </div>
            <span className="font-bold text-lg">La Segunda</span>
          </Link>

          {/* Search */}
          <div className="hidden md:flex flex-1 max-w-md">
            <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2 w-full">
              <Search className="w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar productos..."
                className="bg-transparent outline-none text-sm flex-1"
              />
            </div>
          </div>

          {/* Navigation */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2 md:gap-4">
              <button className="hidden sm:inline-flex p-2 hover:bg-muted rounded-lg transition">
                <Heart className="w-5 h-5" />
              </button>
              <button className="hidden sm:inline-flex p-2 hover:bg-muted rounded-lg transition">
                <MessageSquare className="w-5 h-5" />
              </button>

              {user.isSeller && (
                <Link href="/seller/dashboard">
                  <Button variant="outline" size="sm" className="hidden sm:inline-flex">
                    Mi tienda
                  </Button>
                </Link>
              )}

              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 hover:bg-muted rounded-lg transition"
              >
                <User className="w-5 h-5" />
              </button>

              {menuOpen && (
                <div className="absolute top-16 right-4 bg-card border rounded-lg shadow-lg p-2 min-w-48">
                  <Link href="/profile">
                    <button className="w-full text-left px-4 py-2 hover:bg-muted rounded transition">
                      Mi perfil
                    </button>
                  </Link>
                  {user.isSeller && (
                    <Link href="/seller/dashboard">
                      <button className="w-full text-left px-4 py-2 hover:bg-muted rounded transition">
                        Mi tienda
                      </button>
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 hover:bg-destructive/10 text-destructive rounded transition flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/auth/login">
                <Button variant="outline" size="sm">
                  Inicia sesión
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button size="sm">
                  Registrarse
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Search */}
        <div className="md:hidden mt-4">
          <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar productos..."
              className="bg-transparent outline-none text-sm flex-1"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
