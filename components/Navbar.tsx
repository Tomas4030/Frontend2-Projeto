"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, Sword } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

type NavItem = { href: string; label: string };

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = useMemo(() => createClient(), []);

  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [authReady, setAuthReady] = useState(false);

  const isLandingPage = pathname === "/";
  const isLoginPage = pathname === "/login" || pathname === "/register";

  const landingLinks: NavItem[] = useMemo(
    () => [
      { href: "#features", label: "Funcionalidades" },
      { href: "#gamificacao", label: "Gamificação" },
    ],
    [],
  );

  // Fecha menu mobile quando muda de rota
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Sessão + listener
  useEffect(() => {
    let mounted = true;

    async function init() {
      const { data } = await supabase.auth.getUser();
      if (!mounted) return;
      setUser(data.user ?? null);
      setAuthReady(true);
    }

    init();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthReady(true);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

  // Scroll suave para anchors (e dá um “offset” por causa da navbar fixa)
  const handleAnchorNav = (href: string) => (e: React.MouseEvent) => {
    if (!href.startsWith("#")) return;

    e.preventDefault();
    const id = href.slice(1);
    const el = document.getElementById(id);
    if (!el) return;

    const navOffset = 72; // ~ h-16 + margin
    const top = el.getBoundingClientRect().top + window.scrollY - navOffset;
    window.scrollTo({ top, behavior: "smooth" });
    setIsOpen(false);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsOpen(false);
    router.push("/");
  };

  if (isLoginPage) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#2d2d4e]/60 bg-[#0f0f18]/70 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Sword className="h-6 w-6 text-primary" aria-hidden="true" />
          <Link
            href="/"
            className="font-pixel text-lg text-primary focus:outline-none focus:ring-2 focus:ring-primary/40 rounded-sm"
          >
            Veydral
          </Link>
        </div>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6">
          {isLandingPage && (
            <NavLinks items={landingLinks} onAnchorClick={handleAnchorNav} />
          )}

          <AuthActions
            authReady={authReady}
            user={user}
            onSignOut={signOut}
          />
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          className="md:hidden inline-flex items-center justify-center rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
          aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={isOpen}
          aria-controls="mobile-menu"
          onClick={() => setIsOpen((v) => !v)}
        >
          <span className="sr-only">{isOpen ? "Fechar menu" : "Abrir menu"}</span>
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div
          id="mobile-menu"
          className="md:hidden border-b border-border bg-card px-4 py-4 space-y-3"
        >
          {isLandingPage && (
            <NavLinks
              items={landingLinks}
              mobile
              onAnchorClick={handleAnchorNav}
              onNavigate={() => setIsOpen(false)}
            />
          )}

          <div className="pt-2">
            <AuthActions
              authReady={authReady}
              user={user}
              onSignOut={signOut}
              mobile
              onNavigate={() => setIsOpen(false)}
            />
          </div>
        </div>
      )}
    </nav>
  );
}

function NavLinks({
  items,
  mobile,
  onAnchorClick,
  onNavigate,
}: {
  items: { href: string; label: string }[];
  mobile?: boolean;
  onAnchorClick: (href: string) => (e: React.MouseEvent) => void;
  onNavigate?: () => void;
}) {
  const base =
    "text-xs text-muted-foreground hover:text-foreground transition-colors";
  const mobileCls = "block text-sm text-muted-foreground hover:text-foreground";

  return (
    <div className={mobile ? "space-y-2" : "flex items-center gap-6"}>
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={mobile ? mobileCls : base}
          onClick={(e) => {
            if (item.href.startsWith("#")) return onAnchorClick(item.href)(e);
            onNavigate?.();
          }}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}

function AuthActions({
  authReady,
  user,
  onSignOut,
  mobile,
  onNavigate,
}: {
  authReady: boolean;
  user: any;
  onSignOut: () => Promise<void>;
  mobile?: boolean;
  onNavigate?: () => void;
}) {
  if (!authReady) {
    return (
      <div className={mobile ? "flex flex-col gap-2" : ""}>
        <Button size="sm" disabled className={mobile ? "w-full" : ""}>
          A carregar...
        </Button>
      </div>
    );
  }

  if (user) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className={mobile ? "w-full" : ""}
        onClick={onSignOut}
      >
        Sair
      </Button>
    );
  }

  return (
    <div className={mobile ? "flex flex-col gap-2" : "flex gap-3"}>
      <Link href="/login" onClick={onNavigate}>
        <Button variant="default" size="sm" className={mobile ? "w-full" : ""}>
          Entrar
        </Button>
      </Link>
      <Link href="/register" onClick={onNavigate}>
        <Button variant="default" size="sm" className={mobile ? "w-full" : ""}>
          Registrar
        </Button>
      </Link>
    </div>
  );
}