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

const Register = () => {
  const supabase = createClient();
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("As senhas não coincidem!");
      return;
    }

    setLoading(true);

    // Criar conta no Supabase
    const { data: userData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      alert(signUpError.message);
      setLoading(false);
      return;
    }

    // Opcional: criar perfil do utilizador
    if (userData.user) {
      const { error: profileError } = await supabase.from("profiles").insert([
        {
          id: userData.user.id,
          name,
          email,
        },
      ]);

      if (profileError) {
        console.log("Erro ao criar perfil:", profileError.message);
      }
    }

    setLoading(false);
    alert("Conta criada com sucesso! Faça login.");
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="py-0 w-full max-w-5xl grid md:grid-cols-2 overflow-hidden rounded-2xl shadow-2xl border border-zinc-800 bg-zinc-900/70 backdrop-blur">
        {/* Left Side - Form */}
        <div className="p-10 flex flex-col justify-center">
          <CardHeader className="px-0 pb-8">
            <CardTitle className="text-3xl font-bold text-white">
              Criar Conta 📝
            </CardTitle>
            <CardDescription className="text-zinc-400">
              Preencha os dados abaixo para criar sua conta
            </CardDescription>
          </CardHeader>

          <CardContent className="px-0">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-zinc-300">
                  Nome
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="bg-zinc-800 border-zinc-700 focus:ring-2 focus:ring-white"
                />
              </div>

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

              <div className="space-y-2 relative">
                <Label htmlFor="confirmPassword" className="text-zinc-300">
                  Confirmar Senha
                </Label>
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="bg-zinc-800 border-zinc-700 pr-10 focus:ring-2 focus:ring-white"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-[50%] text-zinc-400 hover:text-white transition"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>

              <Button
                type="submit"
                className="w-full bg-white text-black hover:bg-zinc-200 transition-all"
                disabled={loading}
              >
                {loading ? "Criando..." : "Registrar"}
              </Button>

              <p className="text-sm text-zinc-500 text-center">
                Já tem conta?{" "}
                <span className="text-white hover:underline cursor-pointer">
                  <Link href="/login">Entrar</Link>
                </span>
              </p>
            </form>
          </CardContent>
        </div>

        {/* Right Side - Image */}
        <div className="hidden md:block relative">
          <img
            src="https://res.cloudinary.com/dgwn9kjrb/image/upload/v1772658391/mqpx4pcsz0xzkn2utesj.png"
            alt="Register"
            className="h-full w-full object-cover object-right"
          />
          <div className="absolute inset-0 " />
        </div>
      </Card>
    </div>
  );
};

export default Register;
