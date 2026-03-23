"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import PixelBackground from "@/components/PixelBackground";
import { motion, AnimatePresence } from "framer-motion";

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
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass) return;
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const chosen = CLASSES.find((c) => c.value === selectedClass);
    if (!chosen) return;

    // Insert usando exatamente os nomes das colunas na database
    const { error } = await supabase.from("characters").insert([
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
        level: 1,
        xp: 0,
      },
    ]);

    if (error) {
      console.error("Erro:", error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  };

  const chosen = CLASSES.find((c) => c.value === selectedClass);

  return (
    <>
      <PixelBackground />

      <div className="min-h-screen flex items-center justify-center p-6 relative z-10 font-['VT323']">
        <div className="rpg-card rpg-border w-full max-w-4xl grid md:grid-cols-2 overflow-hidden bg-[#13111e] shadow-2xl">
          <div className="p-8 flex flex-col justify-center border-r border-[#2a2540]">
            <div className="mb-6">
              <h1 className="rpg-title text-3xl tracking-[4px]">CRIAR HERÓI</h1>
              <p className="text-[#6b6480] text-base mt-1 tracking-widest">
                &gt; escolhe o teu destino
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-[#f5c542] block mb-1 tracking-widest text-xs uppercase">
                  ⚔ Nome
                </label>
                <input
                  type="text"
                  className="rpg-input w-full bg-[#0f0d1a] border-2 border-[#2a2540] p-3 text-white rounded outline-none focus:border-[#f5c542] transition-all text-lg"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nome do herói..."
                  maxLength={16}
                  required
                />
              </div>

              <div>
                <label className="text-[#f5c542] block mb-3 tracking-widest text-xs uppercase">
                  ✦ Classe
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {CLASSES.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      className={`flex flex-col items-center p-3 border-2 transition-all ${
                        selectedClass === c.value
                          ? "bg-[#2a2540] border-[#f5c542]"
                          : "bg-[#0f0d1a] border-[#2a2540] hover:border-[#6b6480]"
                      }`}
                      onClick={() => setSelectedClass(c.value)}
                    >
                      <img
                        src={c.img}
                        alt={c.label}
                        className="w-10 h-10 mb-1 object-contain"
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
                  className="rpg-btn w-full py-3 text-xl tracking-[2px] transition-all cursor-pointer"
                  style={{
                    backgroundColor:
                      loading || !selectedClass ? "#2a2540" : "#f5c542",
                    color: loading || !selectedClass ? "#6b6480" : "black",
                    border: "none",
                  }}
                  disabled={loading || !selectedClass}
                >
                  {loading ? "A CRIAR..." : "COMEÇAR AVENTURA"}
                </button>
              </div>
            </form>
          </div>

          <div className="hidden md:flex flex-col justify-center items-center p-8 bg-[#0f0d1a]">
            <div className="flex flex-col items-center w-full max-w-[240px]">
              <div className="relative h-48 w-48 flex items-center justify-center mb-4">
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
                    <img
                      src={chosen ? chosen.img : DEFAULT_IMG}
                      className={`w-50 h-50 object-contain ${
                        !chosen ? "opacity-10 grayscale invert" : ""
                      }`}
                      alt="Preview"
                    />
                  </motion.div>
                </AnimatePresence>
                <div className="absolute bottom-2 w-24 h-4 bg-black/40 blur-lg rounded-full" />
              </div>

              <div className="text-center mb-6">
                <h2 className="text-2xl text-white tracking-widest uppercase mb-1">
                  {name || "???"}
                </h2>
                <p className="text-[#f5c542] text-sm uppercase tracking-[3px]">
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
                      <div className="flex justify-between text-[10px] text-[#6b6480] mb-1 tracking-wider">
                        <span>{stat.label}</span>
                        <span>{val}</span>
                      </div>
                      <div className="h-1.5 bg-[#1d1b2e] rounded-full overflow-hidden border border-[#2a2540]">
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
