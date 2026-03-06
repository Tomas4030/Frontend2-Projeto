"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import PixelBackground from "@/components/PixelBackground";

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

    const { data: userData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      alert(signUpError.message);
      setLoading(false);
      return;
    }

    if (userData.user) {
      const { error: profileError } = await supabase
        .from("profiles")
        .insert([{ id: userData.user.id, name, email }]);
      if (profileError)
        console.log("Erro ao criar perfil:", profileError.message);
    }

    setLoading(false);
    alert("Conta criada com sucesso! Faça login.");
    router.push("/login");
  };

  return (
    <>
      <PixelBackground />

      <div className="min-h-screen flex items-center justify-center p-6 relative z-10">
        <div className="rpg-card rpg-border w-full max-w-4xl grid md:grid-cols-2 overflow-hidden bg-[#13111e]">
          {/* Left — Form */}
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
                <label className="rpg-label">⚔ NOME</label>
                <input
                  type="text"
                  className="rpg-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="O teu nome de herói"
                  required
                />
              </div>

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

              <div>
                <label className="rpg-label">🔒 CONFIRMAR SENHA</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    className="rpg-input"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{ paddingRight: 44 }}
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

          {/* Right — Image */}
          <div className="hidden md:block relative">
            <img
              src="https://res.cloudinary.com/dgwn9kjrb/image/upload/v1772658391/mqpx4pcsz0xzkn2utesj.png"
              alt="Register"
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

export default Register;
