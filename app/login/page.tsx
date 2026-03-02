"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Auth = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4">
      <Card className="w-full max-w-md shadow-xl">
        <form onSubmit={handleSubmit}>
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="text-2xl font-bold">
              Bem-vindo de volta 👋
            </CardTitle>
            <CardDescription>
              Entre na sua conta para continuar
            </CardDescription>
          </CardHeader>

          <CardContent className="grid gap-5">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                required
              />
            </div>

            <div className="grid gap-2 relative">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Digite sua senha"
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[38px] text-sm text-muted-foreground hover:text-foreground"
              >
                {showPassword ? "Ocultar" : "Mostrar"}
              </button>

              <div className="text-right">
                <a
                  href="#"
                  className="text-sm text-primary hover:underline"
                >
                  Esqueci minha senha
                </a>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Entrando..." : "Entrar"}
            </Button>

            <p className="text-sm text-muted-foreground text-center">
              Não tem conta?{" "}
              <a href="#" className="text-primary hover:underline">
                Criar conta
              </a>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Auth;