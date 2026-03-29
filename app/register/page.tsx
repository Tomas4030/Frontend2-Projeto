"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import PixelBackground from "@/components/PixelBackground";
import { toast } from "sonner";
import {
  validatePassword,
  formatPasswordErrors,
  validateEmail,
  rpgMessages,
} from "@/lib/auth";
import PasswordRequirements from "@/components/PasswordRequirements";

const Register = () => {
  const supabase = createClient();
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar email
    if (!email.trim()) {
      toast.error("Campo incompleto", {
        description: "Precisas de um email para entrar no reino!",
      });
      return;
    }

    if (!validateEmail(email)) {
      toast.error("Email inválido", {
        description: "O email não parece ser válido. Verifica a formatação.",
      });
      return;
    }

    // Validar password
    if (!password) {
      toast.error("Campo incompleto", {
        description: rpgMessages.error.incompleteForm,
      });
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      toast.error("Password fraca para um herói!", {
        description: formatPasswordErrors(passwordValidation.errors),
      });
      return;
    }

    // Validar confirmação de password
    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem!", {
        description: "Verifica se digitaste a mesma senha nos dois campos.",
      });
      return;
    }

    setLoading(true);

    try {
      const { data: userData, error: signUpError } = await supabase.auth.signUp(
        {
          email,
          password,
        },
      );

      if (signUpError) {
        // Verificar se email já existe
        if (
          signUpError.message.includes("User already registered") ||
          signUpError.status === 422
        ) {
          toast.error("Este herói já existe!", {
            description: rpgMessages.error.emailExists,
          });
        } else {
          toast.error("Erro ao criar herói", {
            description: signUpError.message,
          });
        }
        setLoading(false);
        return;
      }

      if (!userData.user) {
        toast.error("Erro no Portal", {
          description: rpgMessages.error.serverError,
        });
        setLoading(false);
        return;
      }

      // Tentar criar perfil (opcional, para compatibilidade)
      const { error: profileError } = await supabase
        .from("profiles")
        .insert([{ id: userData.user.id, email }])
        .select()
        .single();

      if (profileError) {
        console.warn("Aviso ao criar perfil:", profileError.message);
        // Não falhar o registo se o perfil não for criado
      }

      toast.success("Herói registado com sucesso!", {
        description: rpgMessages.success.register,
      });

      setLoading(false);
      router.push("/create-character");
    } catch (err) {
      console.error("Erro inesperado:", err);
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
            <div className="mb-6">
              <h1 className="rpg-title">CRIAR HERÓI</h1>
              <p className="rpg-subtitle">&gt; regista-te no reino</p>
            </div>

            <div className="rpg-divider">
              <div className="rpg-divider-line" />
              <span className="rpg-divider-dot">◆</span>
              <div className="rpg-divider-line" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
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
                <PasswordRequirements password={password} />
              </div>

              <div>
                <label className="rpg-label">🔒 CONFIRMAR SENHA</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    className="rpg-input"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />

                  <button
                    type="button"
                    className="eye-btn"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={15} />
                    ) : (
                      <Eye size={15} />
                    )}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button type="submit" className="rpg-btn" disabled={loading}>
                  {loading ? "A CRIAR..." : "✦  CRIAR HERÓI"}
                </button>
              </div>

              <p className="rpg-register">
                Já tens conta? <Link href="/login">Entrar</Link>
              </p>
            </form>
          </div>

          <div className="hidden md:block relative">
            <Image
              src="https://res.cloudinary.com/dgwn9kjrb/image/upload/v1772658391/mqpx4pcsz0xzkn2utesj.png"
              alt="Register"
              fill
              className="h-full w-full object-cover object-right"
            />

            <div className="absolute inset-0 bg-linear-to-r from-[#13111e]/60 to-transparent" />
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;
