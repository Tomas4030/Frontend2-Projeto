"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import PixelBackground from "@/components/PixelBackground";
import Link from "next/link";
import { NewQuestSheet } from "@/components/dashboard/NewQuestSheet";
import { ConfettiButton } from "@/components/lightswind/confetti-button";

/* ─────────────────────────────────────────────
   TIPOS & HELPERS (Mantidos)
───────────────────────────────────────────── */
type Task = {
  id: string;
  title: string;
  type: "habito" | "diaria" | "afazer";
  direction?: "positivo" | "negativo";
  xp_reward?: number;
  hp_reward?: number;
  penalty_hp?: number;
  is_completed?: boolean;
  notes?: string;
  difficulty?: "trivial" | "facil" | "medio" | "dificil";
  streak?: number;
};

type Character = {
  id: string;
  user_id: string;
  name: string;
  class: "guerreiro" | "mago" | "druida" | "ladrao";
  level: number;
  xp: number;
  hp: number;
  max_hp: number;
  mp: number;
  max_mp: number;
  gold?: number;
  streak_days?: number;
  tasks_completed?: number;
};

const CLASS_AVATARS: Record<string, string> = {
  guerreiro:
    "https://res.cloudinary.com/dbxwiln0a/image/upload/v1773266348/rnanhvyyxswz97muunjb.png",
  mago: "https://res.cloudinary.com/dbxwiln0a/image/upload/v1773266025/zmxcwbnzlcjuyinlql8y.png",
  druida:
    "https://res.cloudinary.com/dbxwiln0a/image/upload/v1773266352/wlv51tbtkw6orieaf6v3.png",
  ladrao:
    "https://res.cloudinary.com/dbxwiln0a/image/upload/v1773266354/tnsbow0hjps23y8bgt1h.png",
};

const CLASS_TITLE: Record<string, string> = {
  guerreiro: "Guerreiro",
  mago: "Mago",
  druida: "Druida",
  ladrao: "Ladrão",
};

const DIFFICULTY_COLORS: Record<string, string> = {
  trivial: "#6b6480",
  facil: "#4ade80",
  medio: "#f5c542",
  dificil: "#ef4444",
};

function handleLevelUp(xp: number, level: number) {
  let currentXP = xp;
  let currentLevel = level;
  let xpForNextLevel = 100 * currentLevel;
  while (currentXP >= xpForNextLevel) {
    currentXP -= xpForNextLevel;
    currentLevel += 1;
    xpForNextLevel = 100 * currentLevel;
  }
  return { xp: currentXP, level: currentLevel };
}

/* ─────────────────────────────────────────────
   COMPONENTE PRINCIPAL
───────────────────────────────────────────── */
export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [character, setCharacter] = useState<Character | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeFilter, setActiveFilter] = useState<
    "todos" | "habito" | "diaria" | "afazer"
  >("todos");
  const [toast, setToast] = useState<{
    msg: string;
    type: "xp" | "hp" | "lvl" | "dmg";
  } | null>(null);

  const showToast = (msg: string, type: "xp" | "hp" | "lvl" | "dmg") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  };

  const fetchTasks = useCallback(
    async (userId: string) => {
      const { data } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", userId)
        .or("is_completed.eq.false,type.eq.habito")
        .order("created_at", { ascending: false });
      if (data) setTasks(data as Task[]);
    },
    [supabase],
  );

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        router.push("/login");
        return;
      }
      const { data: char, error: charError } = await supabase
        .from("characters")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (charError) return;
      if (char) {
        if (char.hp <= 0) {
          router.push("/dashboard/revive");
          return;
        }
        const { xp, level } = handleLevelUp(char.xp || 0, char.level || 1);
        setCharacter({ ...char, xp, level } as Character);
      }
      await fetchTasks(user.id);
      setLoading(false);
    };
    fetchData();
  }, [router, supabase, fetchTasks]);

  const completeTask = async (task: Task) => {
    if (!character) return;
    let newXp = character.xp;
    let newLevel = character.level;
    let newHp = character.hp;
    if (task.direction === "negativo") {
      const dmg = task.penalty_hp || 10;
      newHp = Math.max(0, character.hp - dmg);
      showToast(`-${dmg} HP`, "dmg");
    } else {
      const gained = task.xp_reward || 0;
      const leveled = handleLevelUp(character.xp + gained, character.level);
      if (leveled.level > character.level) showToast("NÍVEL ACIMA! 🎉", "lvl");
      else showToast(`+${gained} XP`, "xp");
      newXp = leveled.xp;
      newLevel = leveled.level;
      newHp = Math.min(character.max_hp, character.hp + (task.hp_reward || 0));
    }
    const { data: updatedChar } = await supabase
      .from("characters")
      .update({ xp: newXp, level: newLevel, hp: newHp })
      .eq("id", character.id)
      .select()
      .single();
    if (task.type !== "habito") {
      const { error: taskError } = await supabase
        .from("tasks")
        .update({ is_completed: true })
        .eq("id", task.id);
      if (!taskError) setTasks((prev) => prev.filter((t) => t.id !== task.id));
    }
    if (updatedChar) setCharacter(updatedChar as Character);
    if (newHp <= 0) router.push("/dashboard/revive");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0910]">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-2 border-[#f5c542] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-[#f5c542] font-mono text-base tracking-widest animate-pulse">
            A CARREGAR REINO...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <PixelBackground />
      {toast && (
        <div
          className={`fixed top-10 left-1/2 -translate-x-1/2 z-50 px-8 py-4 font-mono text-base font-bold uppercase tracking-widest border pointer-events-none animate-[fadeSlideDown_0.3s_ease-out] ${toast.type === "dmg" ? "bg-red-950 border-red-500 text-red-400" : toast.type === "lvl" ? "bg-yellow-950 border-yellow-400 text-yellow-300" : "bg-[#0f1a0d] border-green-500 text-green-400"}`}
        >
          {toast.msg}
        </div>
      )}

      {/* min-h-screen + flex + flex-col garante que o conteúdo possa ser centralizado */}
      <main className="min-h-screen relative z-10 font-mono flex flex-col">
        {/* CONTAINER CENTRALIZADO: flex-1 e items-center colocam o grid no meio da tela verticalmente */}
        <div className="flex-1 flex items-center py-12">
          <div className="max-w-7xl mx-auto w-full px-4 md:px-6 grid grid-cols-1 xl:grid-cols-12 gap-8">
            {/* COLUNA ESQUERDA — HERÓI */}
            <aside className="xl:col-span-3 space-y-6">
              <div className="bg-[#13111e] border border-[#2a2540] p-6 shadow-xl">
                {character ? (
                  <>
                    <div className="relative mb-6 flex flex-col items-center">
                      <div className="w-24 h-24 bg-[#1a162e] border-2 border-[#3a3558] flex items-center justify-center mb-4 relative shadow-[0_0_20px_rgba(245,197,66,0.1)]">
                        <img
                          src={CLASS_AVATARS[character.class]}
                          alt={character.class}
                          className="w-20 h-20 object-contain"
                        />
                        <span className="absolute -bottom-3 -right-3 bg-[#f5c542] text-black text-xs font-black px-2 py-1 uppercase tracking-tighter shadow-md">
                          LVL {character.level}
                        </span>
                      </div>
                      <h3 className="text-[#f5c542] text-xl uppercase tracking-tight font-bold">
                        {character.name}
                      </h3>
                      <p className="text-[#6b6480] text-xs tracking-[0.2em] uppercase mt-1">
                        {CLASS_TITLE[character.class]}
                      </p>
                    </div>

                    <div className="space-y-4 mb-6">
                      <StatBar
                        label="HP"
                        icon="♥"
                        current={character.hp}
                        max={character.max_hp}
                        color="#ef4444"
                        trackColor="#3d1010"
                      />
                      <StatBar
                        label="MP"
                        icon="✦"
                        current={character.mp}
                        max={character.max_mp}
                        color="#3b82f6"
                        trackColor="#0d1f3d"
                      />
                      <StatBar
                        label="XP"
                        icon="★"
                        current={character.xp}
                        max={100 * character.level}
                        color="#f5c542"
                        trackColor="#2d2205"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3 border-t border-[#2a2540] pt-5">
                      {[
                        { label: "FOR", val: 12 },
                        { label: "INT", val: 8 },
                        { label: "DES", val: 10 },
                      ].map((s) => (
                        <div
                          key={s.label}
                          className="text-center bg-[#1a162e]/50 border border-[#2a2540] py-3"
                        >
                          <div className="text-[10px] text-[#6b6480] uppercase mb-1">
                            {s.label}
                          </div>
                          <div className="text-[#f5c542] text-base font-bold">
                            {s.val}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <Link
                      href="/create-character"
                      className="rpg-btn text-sm p-4"
                    >
                      CRIAR PERSONAGEM
                    </Link>
                  </div>
                )}
              </div>
            </aside>

            {/* COLUNA CENTRAL — MISSÕES */}
            <section className="xl:col-span-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-[#f5c542] text-lg uppercase tracking-widest font-bold flex items-center gap-3">
                  <span className="animate-pulse">⚔</span> Mural de Missões
                </h2>
                <NewQuestSheet
                  onQuestCreated={() =>
                    character && fetchTasks(character.user_id)
                  }
                />
              </div>

              {/* Filtros Maiores */}
              <div className="flex gap-1 bg-[#0a0910] border border-[#2a2540] p-1.5 shadow-lg">
                {(["todos", "habito", "diaria", "afazer"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setActiveFilter(f)}
                    className={`flex-1 py-3 text-xs uppercase tracking-widest font-bold transition-all flex items-center justify-center gap-2 ${activeFilter === f ? "bg-[#f5c542] text-black shadow-inner" : "text-[#6b6480] hover:text-[#f5c542] hover:bg-[#1a162e]"}`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                {tasks.filter(
                  (t) => activeFilter === "todos" || t.type === activeFilter,
                ).length > 0 ? (
                  tasks
                    .filter(
                      (t) =>
                        activeFilter === "todos" || t.type === activeFilter,
                    )
                    .map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onComplete={completeTask}
                      />
                    ))
                ) : (
                  <div className="bg-[#13111e]/50 border-2 border-[#2a2540] border-dashed py-24 text-center">
                    <p className="text-[#6b6480] text-sm uppercase tracking-[0.3em]">
                      Mural Vazio
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* COLUNA DIREITA */}
            <aside className="xl:col-span-3">
              <div className="bg-[#13111e] border border-[#2a2540] p-6">
                <h4 className="text-xs text-[#6b6480] uppercase tracking-widest mb-5 flex items-center gap-2">
                  <span className="text-yellow-400">◆</span> Loja de Itens
                </h4>
                <div className="space-y-3">
                  {[
                    { name: "Poção de Vida", cost: 25, icon: "🧪" },
                    { name: "Pergaminho XP", cost: 60, icon: "📜" },
                  ].map((item) => (
                    <button
                      key={item.name}
                      className="w-full flex items-center justify-between p-4 bg-[#1a162e] border border-[#2a2540] hover:border-[#f5c542] transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{item.icon}</span>
                        <span className="text-xs text-[#ccc] uppercase font-bold group-hover:text-[#f5c542]">
                          {item.name}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-yellow-400">
                        ◆ {item.cost}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <style jsx global>{`
        @keyframes fadeSlideDown {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
      `}</style>
    </>
  );
}

/* ─────────────────────────────────────────────
   COMPONENTE: TASK CARD (Texto aumentado)
───────────────────────────────────────────── */
function TaskCard({
  task,
  onComplete,
}: {
  task: Task;
  onComplete: (t: Task) => void;
}) {
  const cfg = {
    habito: { icon: "♾", label: "HÁBITO", color: "#a78bfa" },
    diaria: { icon: "◷", label: "DIÁRIA", color: "#38bdf8" },
    afazer: { icon: "◈", label: "AFAZER", color: "#f5c542" },
  }[task.type];

  const isNegative = task.direction === "negativo";

  return (
    <div
      className={`group flex items-center gap-5 p-5 bg-[#13111e] border-2 transition-all ${isNegative ? "border-[#3d1010] hover:border-red-700" : "border-[#2a2540] hover:border-[#423a63]"}`}
    >
      <div
        className="shrink-0 w-12 text-center"
        style={{ color: isNegative ? "#ef4444" : cfg.color }}
      >
        <div className="text-2xl mb-1">{cfg.icon}</div>
        <div className="text-[8px] font-black uppercase tracking-tighter opacity-70">
          {cfg.label}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <h4
          className={`text-base font-bold uppercase tracking-tight truncate ${isNegative ? "text-red-400" : "text-[#e8e0f0]"}`}
        >
          {task.title}
        </h4>
        {task.notes && (
          <p className="text-xs text-[#6b6480] mt-1 italic">{task.notes}</p>
        )}
        <div className="flex items-center gap-4 mt-2">
          <span
            className={`text-[10px] font-bold uppercase ${isNegative ? "text-red-500" : "text-yellow-500"}`}
          >
            {isNegative
              ? `-${task.penalty_hp ?? 10} HP`
              : `+${task.xp_reward ?? 0} XP`}
          </span>
          {task.difficulty && (
            <span
              className="text-[10px] font-bold uppercase"
              style={{ color: DIFFICULTY_COLORS[task.difficulty] }}
            >
              • {task.difficulty}
            </span>
          )}
        </div>
      </div>
      <div className="shrink-0">
        <ConfettiButton
          onClick={() => onComplete(task)}
          className={`h-12 px-5 text-xs font-black border-2 transition-all ${isNegative ? "border-red-800 text-red-500 hover:bg-red-800 hover:text-white" : "border-[#3a3558] text-[#f5c542] hover:bg-[#f5c542] hover:text-black"}`}
        >
          {isNegative ? "FALHOU" : "CONCLUIR"}
        </ConfettiButton>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   COMPONENTE: STAT BAR (Aumentada)
───────────────────────────────────────────── */
function StatBar({ label, icon, current, max, color, trackColor }: any) {
  const percent = Math.min(Math.round((current / max) * 100), 100);
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span
          className="text-xs font-black tracking-widest flex items-center gap-2"
          style={{ color }}
        >
          <span className="text-sm">{icon}</span> {label}
        </span>
        <span className="text-xs font-bold text-[#6b6480]">
          {current} / {max}
        </span>
      </div>
      <div className="h-3 w-full bg-black/40 border border-[#2a2540] p-[2px]">
        <div
          className="h-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(0,0,0,0.5)]"
          style={{ width: `${percent}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
