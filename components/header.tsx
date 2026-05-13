'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  Heart,
  MessageSquare,
  Search,
  Store,
  User,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';

const LOGO_SRC = '/branding/lasegunda.png';

export function Header() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [logoError, setLogoError] = useState(false);

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const cleanSearch = searchTerm.trim();

    if (!cleanSearch) {
      router.push('/products');
      return;
    }

    router.push(`/products?search=${encodeURIComponent(cleanSearch)}`);
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4">
        <Link href="/" className="flex items-center gap-3">
          {!logoError ? (
            <img
              src={LOGO_SRC}
              alt="La Segunda"
              onError={() => setLogoError(true)}
              className="h-10 w-auto max-w-[190px] object-contain"
            />
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">
                S
              </div>

              <span className="text-xl font-bold text-slate-950">
                La Segunda
              </span>
            </div>
          )}
        </Link>

        <form
          onSubmit={handleSearch}
          className="hidden flex-1 justify-center md:flex"
        >
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar productos..."
              className="h-10 w-full rounded-lg border bg-slate-100 px-4 pl-10 text-sm outline-none transition focus:border-primary focus:bg-white"
            />
          </div>
        </form>

        <nav className="flex items-center gap-1">
          <Link href="/favorites">
            <Button variant="ghost" size="icon" title="Favoritos">
              <Heart className="h-5 w-5" />
            </Button>
          </Link>

          <Link href="/messages">
            <Button variant="ghost" size="icon" title="Mensajes">
              <MessageSquare className="h-5 w-5" />
            </Button>
          </Link>

          {isAuthenticated ? (
            <>
              <Link href="/profile">
                <Button variant="ghost" size="icon" title="Mi perfil">
                  <User className="h-5 w-5" />
                </Button>
              </Link>

              <Link href="/seller/dashboard" className="hidden sm:block">
                <Button variant="outline" size="sm">
                  <Store className="mr-2 h-4 w-4" />
                  Mi tienda
                </Button>
              </Link>

              <Button
                variant="ghost"
                size="icon"
                title="Cerrar sesión"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <>
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">
                  Iniciar sesión
                </Button>
              </Link>

              <Link href="/auth/register" className="hidden sm:block">
                <Button size="sm">Registrarme</Button>
              </Link>
            </>
          )}
        </nav>
      </div>

      <div className="border-t px-4 py-2 md:hidden">
        <form onSubmit={handleSearch}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar productos..."
              className="h-10 w-full rounded-lg border bg-slate-100 px-4 pl-10 text-sm outline-none transition focus:border-primary focus:bg-white"
            />
          </div>
        </form>
      </div>
    </header>
  );
}

export default Header;
