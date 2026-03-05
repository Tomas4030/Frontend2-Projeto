"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu, X, Sword } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const Navbar = () => {
  const router = useRouter();
  const supabase = createClient();
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null); // estado do utilizador logado

  const isLandingPage = pathname === "/";
  const isLoginPage = pathname === "/login" || pathname === "/register";

  // Buscar sessão do utilizador ao montar
  useEffect(() => {
    async function getUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    }

    getUser();

    // Escutar mudanças de sessão
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      },
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

  // Não mostra navbar nas páginas de login/register
  if (isLoginPage) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
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

          {user ? (
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={async () => {
                await supabase.auth.signOut(); // encerra sessão
                setUser(null);
                setIsOpen(false);
                router.push("/"); // redireciona para a home
              }}
            >
              Sair
            </Button>
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
            {user ? (
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={async () => {
                  await supabase.auth.signOut(); // encerra sessão
                  setUser(null);
                  setIsOpen(false);
                  router.push("/"); // redireciona para a home
                }}
              >
                Sair
              </Button>
            ) : (
              <>
                <Link href="/login" onClick={() => setIsOpen(false)}>
                  <Button variant="default" size="sm" className="w-full">
                    Entrar
                  </Button>
                </Link>

                <Link href="/register" onClick={() => setIsOpen(false)}>
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
