"use client"; // importante em Next.js 13 para componentes client-side
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu, X, Sword /*LogOut*/ } from "lucide-react";
import Link from "next/link";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sword className="h-6 w-6 text-primary" />
          <Link href="/" className="font-pixel text-xs text-primary">
            QuestLife
          </Link>
        </div>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            href="#features"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Funcionalidades
          </Link>
          <Link
            href="#gamificacao"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Gamificação
          </Link>
          <Link
            href="#beneficios"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Benefícios
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/dashboard")}
          >
            Dashboard
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => router.push("/auth")}
          >
            Entrar
          </Button>
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
          <Link
            href="#features"
            className="block text-sm text-muted-foreground hover:text-foreground"
          >
            Funcionalidades
          </Link>
          <Link
            href="#gamificacao"
            className="block text-sm text-muted-foreground hover:text-foreground"
          >
            Gamificação
          </Link>
          <Link
            href="#beneficios"
            className="block text-sm text-muted-foreground hover:text-foreground"
          >
            Benefícios
          </Link>
          <div className="flex gap-2 pt-2">
            <Button
              variant="ghost"
              size="sm"
              className="flex-1"
              onClick={() => {
                router.push("/dashboard");
                setIsOpen(false);
              }}
            >
              Dashboard
            </Button>
            <Button
              variant="default"
              size="sm"
              className="flex-1"
              onClick={() => {
                router.push("/auth");
                setIsOpen(false);
              }}
            >
              Entrar
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
