"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import PixelBackground from "@/components/PixelBackground";
import { toast } from "sonner";
import { rpgMessages } from "@/lib/auth";

const Auth = () => {
  const supabase = createClient();
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Campos incompletos", {
        description: rpgMessages.error.incompleteForm,
      });
      return;
    }

    setLoading(true);

    try {
      // 1. Fazer login
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.status === 400 || error.message.includes("credentials")) {
          toast.error("Acesso Negado!", {
            description: rpgMessages.error.invalidCredentials,
          });
        } else {
          toast.error("Erro no Portal", {
            description: error.message,
          });
        }
        setLoading(false);
        return;
      }

      if (!data?.user || !data?.session) {
        toast.error("Erro na autenticação", {
          description: rpgMessages.error.noSession,
        });
        setLoading(false);
        return;
      }

      // 2. Verificar se existe personagem
      const { data: character, error: charError } = await supabase
        .from("characters")
        .select("id")
        .eq("user_id", data.user.id)
        .maybeSingle();

      if (charError) {
        console.error("Erro ao verificar personagem:", charError.message);
        toast.error("Erro no Portal", {
          description: rpgMessages.error.serverError,
        });
        setLoading(false);
        return;
      }

      // 3. Guardar token localmente
      localStorage.setItem("token", data.session.access_token);

      // 4. Redirecionar para o destino correto
      if (!character) {
        // Sem personagem, criar uma
        toast.success("Login bem-sucedido! 🎉", {
          description: rpgMessages.warning.noCharacterFound,
        });
        router.push("/create-character");
      } else {
        // Com personagem, ir para o dashboard
        toast.success("Bem-vindo de volta!", {
          description: rpgMessages.success.login,
        });
        router.push("/dashboard");
      }
    } catch (err) {
      console.error("Erro inesperado no login:", err);
      toast.error("Erro no Portal Arcano", {
        description: rpgMessages.error.serverError,
      });
      setLoading(false);
    }
  };

  return (
    <>
      <PixelBackground />
      <div className="min-h-screen flex items-center justify-center p-6 relative z-10">
        <div className="rpg-card rpg-border w-full max-w-4xl grid md:grid-cols-2 overflow-hidden bg-[#13111e]">
          <div className="p-10 flex flex-col justify-center border-r border-[#2a2540]">
            <div className="mb-8">
              <h1 className="rpg-title">BEM-VINDO</h1>
              <p className="rpg-subtitle">&gt; entra no reino, aventureiro</p>
            </div>

            <div className="rpg-divider">
              <div className="rpg-divider-line" />
              <span className="rpg-divider-dot">◆</span>
              <div className="rpg-divider-line" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="rpg-label">📜 EMAIL</label>
                <input
                  type="email"
                  className="rpg-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="heroi@reino.com"
                  required
                />
              </div>

              <div>
                <label className="rpg-label">🗝 SENHA</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="rpg-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{ paddingRight: 44 }}
                    required
                  />

                  <button
                    type="button"
                    className="eye-btn"
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className={`rpg-btn ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                  disabled={loading}
                >
                  {loading ? "A VERIFICAR..." : "⚔  ENTRAR NO REINO"}
                </button>
              </div>

              <p className="rpg-register">
                Sem conta? <Link href="/register">Criar herói</Link>
              </p>
            </form>
          </div>

          <div className="hidden md:block relative">
            <Image
              src="https://res.cloudinary.com/dgwn9kjrb/image/upload/v1772657207/n5mdiixbggyimoadgzdq.png"
              alt="Login"
              fill
              className="h-full w-full object-cover object-right"
              style={{ filter: "brightness(0.85) saturate(1.2)" }}
            />

            <div className="absolute inset-0 bg-linear-to-r from-[#13111e]/60 to-transparent" />
          </div>
        </div>
      </div>
    </>
  );
};

export default function Page() {
  return <Auth />;
}
