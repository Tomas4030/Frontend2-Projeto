"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import PixelBackground from "@/components/PixelBackground";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { rpgMessages } from "@/lib/auth";

const CLASSES = [
  {
    value: "guerreiro",
    label: "Guerreiro",
    img: "https://res.cloudinary.com/dbxwiln0a/image/upload/v1773266348/rnanhvyyxswz97muunjb.png",
    desc: "Força e resistência",
    stats: { str: 90, int: 20, agi: 45, fth: 30 },
  },
  {
    value: "mago",
    label: "Mago",
    img: "https://res.cloudinary.com/dbxwiln0a/image/upload/v1773266025/zmxcwbnzlcjuyinlql8y.png",
    desc: "Poder arcano",
    stats: { str: 15, int: 95, agi: 35, fth: 55 },
  },
  {
    value: "druida",
    label: "Druida",
    img: "https://res.cloudinary.com/dbxwiln0a/image/upload/v1773266352/wlv51tbtkw6orieaf6v3.png",
    desc: "Poder da natureza",
    stats: { str: 45, int: 70, agi: 40, fth: 85 },
  },
  {
    value: "arqueiro",
    label: "Arqueiro",
    img: "https://res.cloudinary.com/dbxwiln0a/image/upload/v1773266354/tnsbow0hjps23y8bgt1h.png",
    desc: "Precisão e distância",
    stats: { str: 40, int: 30, agi: 95, fth: 20 },
  },
];

const DEFAULT_IMG =
  "https://res.cloudinary.com/dbxwiln0a/image/upload/v1773266348/rnanhvyyxswz97muunjb.png";

const CreateCharacter = () => {
  const supabase = createClient();
  const router = useRouter();

  const [name, setName] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [loading, setLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const hasCheckedRef = useRef(false);

  useEffect(() => {
    if (hasCheckedRef.current) return;
    hasCheckedRef.current = true;

    const validateAuth = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        toast.error("Acesso negado", {
          description: "Não tens permissão para entrar neste local.",
        });
        router.replace("/login");
        return;
      }

      const { data: character, error: charError } = await supabase
        .from("characters")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (charError) {
        console.error("Erro ao verificar personagem:", charError.message);
        toast.error("Erro ao validar os registos", {
          description: rpgMessages.error.serverError,
        });
        setLoading(false);
        return;
      }

      if (character) {
        toast.info("O teu herói já caminha neste reino!", {
          description: "O portal leva-te de volta ao teu destino.",
        });
        router.push("/dashboard");
        return;
      }

      setLoading(false);
    };

    validateAuth();
  }, [router, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Nome em falta", {
        description: "O teu herói precisa de um nome para entrar no reino.",
      });
      return;
    }

    if (name.trim().length > 16) {
      toast.error("Nome demasiado longo", {
        description: "O nome do herói pode ter, no máximo, 16 caracteres.",
      });
      return;
    }

    if (!selectedClass) {
      toast.error("Classe por escolher", {
        description:
          "Escolhe a classe do teu herói antes de começares a aventura.",
      });
      return;
    }

    setIsAuthenticating(true);

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        toast.error("Sessão expirada", {
          description: rpgMessages.warning.expiredSession,
        });
        router.replace("/login");
        return;
      }

      const { data: existingCharacter, error: existingCharacterError } =
        await supabase
          .from("characters")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();

      if (existingCharacterError) {
        console.error(
          "Erro ao verificar personagem existente:",
          existingCharacterError.message,
        );
        toast.error("Erro ao validar os registos", {
          description: rpgMessages.error.serverError,
        });
        setIsAuthenticating(false);
        return;
      }

      if (existingCharacter) {
        toast.info("Já tens um herói neste reino.", {
          description: "Serás conduzido para o teu painel de aventuras.",
        });
        setIsAuthenticating(false);
        router.replace("/dashboard");
        return;
      }

      const chosen = CLASSES.find((c) => c.value === selectedClass);

      if (!chosen) {
        toast.error("Classe inválida", {
          description: "A classe escolhida não foi reconhecida pelo reino.",
        });
        setIsAuthenticating(false);
        return;
      }

      const { data: characterData, error: insertError } = await supabase
        .from("characters")
        .insert([
          {
            user_id: user.id,
            name: name.trim(),
            class: selectedClass,
            forca: chosen.stats.str,
            inteligencia: chosen.stats.int,
            agilidade: chosen.stats.agi,
            fe: chosen.stats.fth,
            hp: 100,
            max_hp: 100,
            mp: 50,
            max_mp: 50,
            gold: 0,
            level: 1,
            xp: 0,
            xp_boost_multiplier: 1,
            xp_boost_expires_at: null,
          },
        ])
        .select()
        .single();

      if (insertError) {
        console.error("Erro ao inserir personagem:", insertError.message);

        if (
          insertError.message.toLowerCase().includes("duplicate") ||
          insertError.message.toLowerCase().includes("unique")
        ) {
          toast.info("Já existe um herói ligado à tua conta.", {
            description: "Serás encaminhado para o teu painel de aventuras.",
          });
          setIsAuthenticating(false);
          router.replace("/dashboard");
          return;
        }

        toast.error("Falha ao invocar o herói", {
          description: "Não foi possível criar a tua personagem.",
        });
        setIsAuthenticating(false);
        return;
      }

      if (!characterData) {
        toast.error("Falha ao invocar o herói", {
          description: "Não foi possível criar a tua personagem.",
        });
        setIsAuthenticating(false);
        return;
      }

      toast.success("O teu herói despertou! ⚔️", {
        description: `${name.trim()} inicia agora a sua jornada como ${chosen.label}.`,
      });

      setIsAuthenticating(false);

      setTimeout(() => {
        router.replace("/dashboard");
      }, 500);
    } catch (err) {
      console.error("Erro inesperado ao criar personagem:", err);
      toast.error("Erro no Portal Arcano", {
        description: rpgMessages.error.serverError,
      });
      setIsAuthenticating(false);
    }
  };

  const chosen = CLASSES.find((c) => c.value === selectedClass);

  return (
    <>
      <PixelBackground />

      <div className="relative z-10 flex min-h-screen items-center justify-center p-6 font-['VT323']">
        <div className="rpg-card rpg-border grid w-full max-w-4xl overflow-hidden bg-[#13111e] shadow-2xl md:grid-cols-2">
          <div className="flex flex-col justify-center border-r border-[#2a2540] p-8">
            <div className="mb-6">
              <h1 className="rpg-title text-3xl tracking-[4px]">CRIAR HERÓI</h1>
              <p className="mt-1 text-base tracking-widest text-[#cbd5e1]">
                &gt; escolhe o teu destino
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-1 block text-xs uppercase tracking-widest text-[#f5c542]">
                  ⚔ Nome
                </label>
                <input
                  type="text"
                  className="rpg-input w-full rounded border-2 border-[#2a2540] bg-[#0f0d1a] p-3 text-lg text-white outline-none transition-all focus:border-[#f5c542]"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nome do herói..."
                  maxLength={16}
                  required
                />
              </div>

              <div>
                <label className="mb-3 block text-xs uppercase tracking-widest text-[#f5c542]">
                  ✦ Classe
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {CLASSES.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      className={`flex flex-col items-center border-2 p-3 transition-all ${
                        selectedClass === c.value
                          ? "border-[#f5c542] bg-[#2a2540]"
                          : "border-[#2a2540] bg-[#0f0d1a] hover:border-[#6b6480]"
                      }`}
                      onClick={() => setSelectedClass(c.value)}
                    >
                      <Image
                        src={c.img}
                        alt={c.label}
                        width={40}
                        height={40}
                        className="mb-1 h-10 w-10 object-contain"
                      />
                      <span className="text-xs uppercase tracking-tighter">
                        {c.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="rpg-btn w-full cursor-pointer py-3 text-xl tracking-[2px] transition-all"
                  style={{
                    backgroundColor:
                      isAuthenticating || !selectedClass || loading
                        ? "#2a2540"
                        : "#f5c542",
                    color:
                      isAuthenticating || !selectedClass || loading
                        ? "#6b6480"
                        : "black",
                    border: "none",
                  }}
                  disabled={isAuthenticating || !selectedClass || loading}
                >
                  {isAuthenticating
                    ? "A CRIAR..."
                    : loading
                      ? "A VALIDAR..."
                      : "COMEÇAR AVENTURA"}
                </button>
              </div>
            </form>
          </div>

          <div className="hidden flex-col items-center justify-center bg-[#0f0d1a] p-8 md:flex">
            <div className="flex w-full max-w-60 flex-col items-center">
              <div className="relative mb-4 flex h-48 w-48 items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedClass || "empty"}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: [0, -8, 0] }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{
                      y: { repeat: Infinity, duration: 3, ease: "easeInOut" },
                    }}
                  >
                    <Image
                      src={chosen ? chosen.img : DEFAULT_IMG}
                      width={200}
                      height={200}
                      className={`h-50 w-50 object-contain ${
                        !chosen ? "invert grayscale opacity-10" : ""
                      }`}
                      alt="Preview"
                    />
                  </motion.div>
                </AnimatePresence>
                <div className="absolute bottom-2 h-4 w-24 rounded-full bg-black/40 blur-lg" />
              </div>

              <div className="mb-6 text-center">
                <h2 className="mb-1 text-2xl uppercase tracking-widest text-white">
                  {name || "???"}
                </h2>
                <p className="text-sm uppercase tracking-[3px] text-[#f5c542]">
                  {chosen ? chosen.label : "Sem Classe"}
                </p>
              </div>

              <div className="w-full space-y-3">
                {[
                  { key: "str", label: "FORÇA", color: "#ef4444" },
                  { key: "int", label: "INTELIGÊNCIA", color: "#3b82f6" },
                  { key: "agi", label: "AGILIDADE", color: "#eab308" },
                  { key: "fth", label: "FÉ", color: "#22c55e" },
                ].map((stat) => {
                  const val = chosen
                    ? chosen.stats[stat.key as keyof typeof chosen.stats]
                    : 0;

                  return (
                    <div key={stat.key}>
                      <div className="mb-1 flex justify-between text-[10px] tracking-wider text-[#cbd5e1]">
                        <span>{stat.label}</span>
                        <span>{val}</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full border border-[#2a2540] bg-[#1d1b2e]">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${val}%` }}
                          className="h-full"
                          style={{ backgroundColor: stat.color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .rpg-card {
          border: 4px solid #2a2540;
        }
        .rpg-title {
          color: #f5c542;
          text-shadow: 2px 2px 0px #000;
        }
        .rpg-btn {
          border-bottom: 4px solid rgba(0, 0, 0, 0.3) !important;
        }
        .rpg-btn:active {
          transform: translateY(2px);
          border-bottom: 2px solid rgba(0, 0, 0, 0.3) !important;
        }
      `}</style>
    </>
  );
};

export default CreateCharacter;
