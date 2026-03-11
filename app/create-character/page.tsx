"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import PixelBackground from "@/components/PixelBackground";
import { useEffect } from "react";

const CLASSES = [
  {
    value: "guerreiro",
    label: "Guerreiro",
    img: "https://res.cloudinary.com/dbxwiln0a/image/upload/v1773266348/rnanhvyyxswz97muunjb.png",
    desc: "Força e resistência",
  },
  {
    value: "mago",
    label: "Mago",
    img: "https://res.cloudinary.com/dbxwiln0a/image/upload/v1773266025/zmxcwbnzlcjuyinlql8y.png",
    desc: "Poder arcano",
  },
  {
    value: "druida",
    label: "Druida",
    img: "https://res.cloudinary.com/dbxwiln0a/image/upload/v1773266352/wlv51tbtkw6orieaf6v3.png",
    desc: "Poder da natureza e metamorfose",
  },
  {
    value: "arqueiro",
    label: "Arqueiro",
    img: "https://res.cloudinary.com/dbxwiln0a/image/upload/v1773266354/tnsbow0hjps23y8bgt1h.png",
    desc: "Precisão e ataques à distância",
  },
];

const createCharacter = () => {
  const supabase = createClient();
  const router = useRouter();

  const [name, setName] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  // Verifica se já existe personagem ao carregar a página

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass) {
      alert("Escolhe uma classe!");
      return;
    }
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase.from("characters").insert([
        {
          user_id: user.id,
          name,
          class: selectedClass,
        },
      ]);
      if (error) console.log("Erro:", error.message);
    }

    setLoading(false);
    router.push("/dashboard");
  };

  const chosen = CLASSES.find((c) => c.value === selectedClass);

  return (
    <>
      <PixelBackground />

      <div className="min-h-screen flex items-center justify-center p-6 relative z-10">
        <div className="rpg-card rpg-border w-full max-w-4xl grid md:grid-cols-2 overflow-hidden bg-[#13111e]">
          {/* Left — Form */}
          <div className="p-10 flex flex-col justify-center border-r border-[#2a2540]">
            <div className="mb-6">
              <h1 className="rpg-title">CRIAR HERÓI</h1>
              <p className="rpg-subtitle">&gt; escolhe o teu destino</p>
            </div>

            <div className="rpg-divider">
              <div className="rpg-divider-line" />
              <span className="rpg-divider-dot">◆</span>
              <div className="rpg-divider-line" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="rpg-label">⚔ NOME DO PERSONAGEM</label>
                <input
                  type="text"
                  className="rpg-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Arathor, o Valente"
                  required
                />
              </div>

              <div>
                <label className="rpg-label" style={{ marginBottom: 12 }}>
                  ✦ ESCOLHE A TUA CLASSE
                </label>
                <div className="class-grid">
                  {CLASSES.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      className={`class-card ${selectedClass === c.value ? "selected" : ""}`}
                      onClick={() => setSelectedClass(c.value)}
                    >
                      <span className="class-img">
                        <img
                          src={c.img}
                          alt={c.label}
                          style={{ width: 40, height: 40 }}
                        />
                      </span>
                      <span className="class-name">{c.label}</span>
                      <span className="class-desc">{c.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-1">
                <button type="submit" className="rpg-btn" disabled={loading}>
                  {loading ? "A CRIAR..." : "✦  COMEÇAR AVENTURA"}
                </button>
              </div>

              <p
                style={{
                  fontFamily: "'VT323', monospace",
                  fontSize: 15,
                  color: "#6b6480",
                  textAlign: "center",
                  letterSpacing: 1,
                }}
              >
                Já tens herói?{" "}
                <Link
                  href="/dashboard"
                  style={{ color: "#f5c542", textDecoration: "none" }}
                >
                  Ir ao reino
                </Link>
              </p>
            </form>
          </div>

          {/* Right — Preview */}
          <div className="hidden md:flex flex-col justify-center p-10 bg-[#0f0d1a]">
            <p
              className="rpg-label"
              style={{ textAlign: "center", marginBottom: 20 }}
            >
              👁 PRÉ-VISUALIZAÇÃO
            </p>

            <div className="preview-box">
              <span className="preview-img">
                {chosen ? (
                  <img
                    src={chosen.img}
                    alt={chosen.label}
                    style={{ width: 60, height: 60 }}
                  />
                ) : (
                  <span style={{ fontSize: 40 }}>❓</span>
                )}
              </span>
              <p className="preview-name">{name || "???"}</p>
              <p className="preview-class">
                {chosen ? chosen.label : "Sem classe"}
              </p>

              {/* Stat bars — change by class */}
              {(() => {
                const stats: Record<
                  string,
                  { str: number; int: number; agi: number; fth: number }
                > = {
                  guerreiro: { str: 90, int: 20, agi: 45, fth: 30 },
                  mago: { str: 15, int: 95, agi: 35, fth: 55 },
                  ladino: { str: 40, int: 50, agi: 95, fth: 20 },
                  clerigo: { str: 35, int: 60, agi: 30, fth: 90 },
                };
                const s = selectedClass
                  ? stats[selectedClass]
                  : { str: 0, int: 0, agi: 0, fth: 0 };
                return (
                  <div style={{ textAlign: "left" }}>
                    {[
                      { key: "str", label: "FORÇA", cls: "str", val: s.str },
                      {
                        key: "int",
                        label: "INTELIGÊNCIA",
                        cls: "int",
                        val: s.int,
                      },
                      {
                        key: "agi",
                        label: "AGILIDADE",
                        cls: "agi",
                        val: s.agi,
                      },
                      { key: "fth", label: "FÉ", cls: "fth", val: s.fth },
                    ].map((stat) => (
                      <div key={stat.key} className="stat-row">
                        <div className="stat-label-row">
                          <span>{stat.label}</span>
                          <span>{stat.val}</span>
                        </div>
                        <div className="stat-track">
                          <div
                            className={`stat-fill ${stat.cls}`}
                            style={{ width: `${stat.val}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}

              {!selectedClass && (
                <p className="preview-placeholder">seleciona uma classe...</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default createCharacter;
