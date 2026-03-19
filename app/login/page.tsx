"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import PixelBackground from "@/components/PixelBackground";
import { toast } from "sonner";

const Auth = () => {
  const supabase = createClient();
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validação básica de campos vazios (UI)
    if (!email || !password) {
      toast.error("Campos incompletos", {
        description: "Precisas de preencher todos os pergaminhos!",
      });
      return;
    }

    setLoading(true);

    // 2. Tentativa de Login no Supabase
    // O Supabase verifica automaticamente se o email existe e se a senha coincide
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // 3. Tratamento de erros específicos
      // Se o erro for de credenciais, significa que a conta não existe ou a senha está errada
      if (error.status === 400 || error.message.includes("credentials")) {
        toast.error("Acesso Negado!", {
          description:
            "Este herói não existe ou a chave (senha) está incorreta.",
        });
      } else {
        toast.error("Erro no Portal", {
          description: error.message,
        });
      }
      setLoading(false);
      return;
    }

    // 4. Sucesso no Login
    if (data?.session) {
      // Guarda o token (opcional, o Supabase já gere cookies automaticamente)
      localStorage.setItem("token", data.session.access_token);

      toast.success("Bem-vindo de volta!", {
        description: "As portas do reino abriram-se para ti.",
      });

      router.push("/dashboard");
    }

    setLoading(false);
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
            <img
              src="https://res.cloudinary.com/dgwn9kjrb/image/upload/v1772657207/n5mdiixbggyimoadgzdq.png"
              alt="Login"
              className="h-full w-full object-cover object-right"
              style={{ filter: "brightness(0.85) saturate(1.2)" }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#13111e]/60 to-transparent" />
          </div>
        </div>
      </div>
    </>
  );
};

export default function Page() {
  return <Auth />;
}
