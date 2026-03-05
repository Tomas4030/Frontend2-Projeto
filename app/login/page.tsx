"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const Auth = () => {
  const supabase = createClient();
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    } else {
      console.log("Login feito:", data);
      router.push("/dashboard"); // redireciona para dashboard
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="py-0 w-full max-w-5xl grid md:grid-cols-2 overflow-hidden rounded-2xl shadow-2xl border border-zinc-800 bg-zinc-900/70 backdrop-blur">
        {/* Left Side - Form */}
        <div className="p-10 flex flex-col justify-center">
          <CardHeader className="px-0 pb-8">
            <CardTitle className="text-3xl font-bold text-white">
              Bem-vindo 👋
            </CardTitle>
            <CardDescription className="text-zinc-400">
              Entre com suas credenciais para acessar sua conta
            </CardDescription>
          </CardHeader>

          <CardContent className="px-0">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-zinc-300">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-zinc-800 border-zinc-700 focus:ring-2 focus:ring-white"
                />
              </div>

              <div className="space-y-2 relative">
                <Label htmlFor="password" className="text-zinc-300">
                  Senha
                </Label>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-zinc-800 border-zinc-700 pr-10 focus:ring-2 focus:ring-white"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[50%] text-zinc-400 hover:text-white transition"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <Button
                type="submit"
                className="w-full bg-white text-black hover:bg-zinc-200 transition-all"
                disabled={loading}
              >
                {loading ? "Entrando..." : "Entrar"}
              </Button>

              <p className="text-sm text-zinc-500 text-center">
                Não tem conta?{" "}
                <span className="text-white hover:underline cursor-pointer">
                  <Link href="/register">Criar agora</Link>
                </span>
              </p>
            </form>
          </CardContent>
        </div>

        {/* Right Side - Image */}
        <div className="hidden md:block relative">
          <img
            src="https://res.cloudinary.com/dgwn9kjrb/image/upload/v1772657207/n5mdiixbggyimoadgzdq.png"
            alt="Login"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 " />
        </div>
      </Card>
    </div>
  );
};

export default Auth;
