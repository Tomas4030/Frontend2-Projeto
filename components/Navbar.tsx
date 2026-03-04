"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu, X, Sword } from "lucide-react";
import Link from "next/link";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const isLandingPage = pathname === "/";
  const isLoginPage = pathname === "/login" || pathname === "/register";

  // Simulação de autenticação
  const [isAuth, setIsAuth] = useState(false);

  // Não mostra navbar nas páginas de login/register
  if (isLoginPage) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sword className="h-6 w-6 text-primary" />
          <Link href="/" className="font-pixel text-lg text-primary">
            Veydral
          </Link>
        </div>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6">
          {isLandingPage && (
            <>
              <Link
                href="#features"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Funcionalidades
              </Link>

              <Link
                href="#gamificacao"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Gamificação
              </Link>
            </>
          )}

          {isAuth ? (
            <div className="flex gap-3">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  Dashboard
                </Button>
              </Link>
              <Link href="/logout">
                <Button variant="ghost" size="sm">
                  Sair
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex gap-3">
              <Link href="/login">
                <Button variant="default" size="sm">
                  Entrar
                </Button>
              </Link>

              <Link href="/register">
                <Button variant="default" size="sm">
                  Registrar
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-foreground"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-card border-b border-border px-4 py-4 space-y-3">
          {isLandingPage && (
            <>
              <Link
                href="#features"
                className="block text-sm text-muted-foreground hover:text-foreground"
                onClick={() => setIsOpen(false)}
              >
                Funcionalidades
              </Link>

              <Link
                href="#gamificacao"
                className="block text-sm text-muted-foreground hover:text-foreground"
                onClick={() => setIsOpen(false)}
              >
                Gamificação
              </Link>

              <Link
                href="#beneficios"
                className="block text-sm text-muted-foreground hover:text-foreground"
                onClick={() => setIsOpen(false)}
              >
                Benefícios
              </Link>
            </>
          )}

          <div className="flex flex-col gap-2 pt-2">
            {isAuth ? (
              <>
                <Link
                  href="/dashboard"
                  className="w-full"
                  onClick={() => setIsOpen(false)}
                >
                  <Button variant="ghost" size="sm" className="w-full">
                    Dashboard
                  </Button>
                </Link>
                <Link
                  href="/logout"
                  className="w-full"
                  onClick={() => setIsOpen(false)}
                >
                  <Button variant="ghost" size="sm" className="w-full">
                    Sair
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="w-full"
                  onClick={() => setIsOpen(false)}
                >
                  <Button variant="default" size="sm" className="w-full">
                    Entrar
                  </Button>
                </Link>

                <Link
                  href="/register"
                  className="w-full"
                  onClick={() => setIsOpen(false)}
                >
                  <Button variant="default" size="sm" className="w-full">
                    Registrar
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
