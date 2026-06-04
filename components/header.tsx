'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  LogIn,
  LogOut,
  Menu,
  PackagePlus,
  Search,
  Store,
  User,
  UserPlus,
  X,
} from 'lucide-react';

import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';

const navItems = [
  {
    label: 'Inicio',
    href: '/',
    icon: Home,
  },
  {
    label: 'Productos',
    href: '/products',
    icon: Search,
  },
  {
    label: 'Publicar',
    href: '/seller/dashboard',
    icon: PackagePlus,
  },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();

  const { user, isAuthenticated, isLoading } = useAuth();
  const currentUser = user as any;

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const displayName =
    currentUser?.name ||
    currentUser?.full_name ||
    currentUser?.email?.split('@')?.[0] ||
    'Mi cuenta';

  const isActiveRoute = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }

    return pathname?.startsWith(href);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await supabase.auth.signOut();

      if (typeof window !== 'undefined') {
        localStorage.removeItem('la-segunda-user');
        localStorage.removeItem('la-segunda-auth');
      }

      closeMenu();
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('[La Segunda] Error cerrando sesión:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4">
        {/* LOGO */}
        <Link
          href="/"
          onClick={closeMenu}
          className="group flex items-center gap-3"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-950 text-white shadow-md transition group-hover:scale-105">
            <Store className="h-6 w-6" />
          </div>

          <div className="leading-tight">
            <p className="text-xl font-black tracking-tight text-slate-950">
              La Segunda
            </p>
            <p className="text-xs font-medium text-slate-500">
              Market Perú
            </p>
          </div>
        </Link>

        {/* NAV DESKTOP */}
        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActiveRoute(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  isActive
                    ? 'bg-blue-50 text-blue-950'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-blue-950'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* ACCIONES DESKTOP */}
        <div className="hidden items-center gap-3 lg:flex">
          {!isLoading && isAuthenticated ? (
            <>
              <Link href="/profile">
                <Button
                  variant="outline"
                  className="h-11 rounded-xl bg-white px-4"
                >
                  <User className="mr-2 h-4 w-4" />
                  {displayName}
                </Button>
              </Link>

              <Button
                onClick={handleLogout}
                disabled={isLoggingOut}
                variant="outline"
                className="h-11 rounded-xl bg-white px-4 text-slate-600 hover:text-red-600"
              >
                {isLoggingOut ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
                    Saliendo
                  </span>
                ) : (
                  <>
                    <LogOut className="mr-2 h-4 w-4" />
                    Salir
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <Link href="/auth/login">
                <Button
                  variant="outline"
                  className="h-11 rounded-xl bg-white px-4"
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Ingresar
                </Button>
              </Link>

              <Link href="/auth/register">
                <Button className="h-11 rounded-xl bg-orange-600 px-5 hover:bg-orange-700">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Crear cuenta
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* BOTÓN MOBILE */}
        <button
          type="button"
          onClick={() => setIsMenuOpen((value) => !value)}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm lg:hidden"
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* NAV MOBILE */}
      {isMenuOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-4 shadow-lg lg:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActiveRoute(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMenu}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                    isActive
                      ? 'bg-blue-50 text-blue-950'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-blue-950'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}

            <div className="my-2 h-px bg-slate-100" />

            {!isLoading && isAuthenticated ? (
              <>
                <Link
                  href="/profile"
                  onClick={closeMenu}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                    isActiveRoute('/profile')
                      ? 'bg-blue-50 text-blue-950'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-blue-950'
                  }`}
                >
                  <User className="h-5 w-5" />
                  {displayName}
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                >
                  <LogOut className="h-5 w-5" />
                  {isLoggingOut ? 'Cerrando sesión...' : 'Cerrar sesión'}
                </button>
              </>
            ) : (
              <div className="grid gap-2">
                <Link href="/auth/login" onClick={closeMenu}>
                  <Button
                    variant="outline"
                    className="h-12 w-full rounded-xl bg-white"
                  >
                    <LogIn className="mr-2 h-4 w-4" />
                    Ingresar
                  </Button>
                </Link>

                <Link href="/auth/register" onClick={closeMenu}>
                  <Button className="h-12 w-full rounded-xl bg-orange-600 hover:bg-orange-700">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Crear cuenta
                  </Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
