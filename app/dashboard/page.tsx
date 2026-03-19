"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import PixelBackground from "@/components/PixelBackground";
import Link from "next/link";
import { NewQuestSheet } from "@/components/dashboard/NewQuestSheet";
import { ConfettiButton } from "@/components/lightswind/confetti-button";
import { Sparkles } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [character, setCharacter] = useState<any | null>(null);
  const [tasks, setTasks] = useState<any[]>([]);

  // Função para buscar as missões (agora reutilizável)
  const fetchTasks = useCallback(
    async (userId: string) => {
      const { data } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", userId)
        // Mostra tarefas não completas OU hábitos (que são sempre ativos)
        .or("is_completed.eq.false,type.eq.habito")
        .order("created_at", { ascending: false });

      if (data) setTasks(data);
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

      if (charError) {
        console.error(
          "Erro detalhado:",
          charError.message,
          charError.details,
          charError.hint,
        );
        return;
      }

      if (char) {
        if (char.hp <= 0) {
          router.push("/dashboard/revive");
          return;
        }

        const { xp, level } = handleLevelUp(char.xp || 0, char.level || 1);

        setCharacter({
          ...char,
          xp,
          level,
        });
      }

      await fetchTasks(user.id);
      setLoading(false);
    };

    fetchData();
  }, [router, supabase, fetchTasks]);

  const completeTask = async (task: any) => {
    if (!character) return;

    // Criamos cópias dos valores atuais
    let newXp = character.xp || 0;
    let newLevel = character.level || 1;
    let newHp = character.hp || 0;

    const isNegative = task.direction === "negativo";

    if (isNegative) {
      // Hábito Ruim: Perde vida, XP não mexe
      newHp = Math.max(0, character.hp - (task.penalty_hp || 10));
      console.log("Perdendo vida: ", newHp);
    } else {
      // Tarefa Boa: Ganha XP e pode recuperar vida
      const gainedTotalXp = (character.xp || 0) + (task.xp_reward || 0);
      const leveled = handleLevelUp(gainedTotalXp, character.level || 1);
      newXp = leveled.xp;
      newLevel = leveled.level;
      newHp = Math.min(character.max_hp, character.hp + (task.hp_reward || 0));
    }

    // ATUALIZAÇÃO NO SUPABASE
    const { data: updatedChar, error: charError } = await supabase
      .from("characters")
      .update({
        xp: newXp,
        level: newLevel,
        hp: newHp,
      })
      .eq("id", character.id)
      .select()
      .single();

    if (charError) {
      console.error("Erro ao atualizar status:", charError);
      return;
    }

    // ATUALIZAÇÃO DA TASK NA UI
    if (task.type !== "habito") {
      // Se não for hábito, marca como concluída e remove da lista
      const { error: taskError } = await supabase
        .from("tasks")
        .update({ is_completed: true })
        .eq("id", task.id);

      if (!taskError) {
        setTasks((prev) => prev.filter((t) => t.id !== task.id));
      }
    }

    // Atualiza o estado local com os dados que vieram do banco
    setCharacter(updatedChar);

    // Se morreu, tchau!
    if (newHp <= 0) router.push("/dashboard/revive");
  };

  const handleLevelUp = (xp: number, level: number) => {
    let currentXP = xp;
    let currentLevel = level;

    let xpForNextLevel = 100 * currentLevel;

    while (currentXP >= xpForNextLevel) {
      currentXP -= xpForNextLevel;
      currentLevel += 1;
      xpForNextLevel = 100 * currentLevel;
    }

    return {
      xp: currentXP,
      level: currentLevel,
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[#f5c542] font-mono bg-[#0f0d1a]">
        &gt; A CARREGAR REINO...
      </div>
    );
  }

  return (
    <>
      <PixelBackground />
      <main className="min-h-screen flex items-center justify-center p-4 md:p-8 relative z-10 font-mono">
        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* PERFIL DO HERÓI */}
          <section className="lg:col-span-4">
            <div className="rpg-card rpg-border p-6 bg-[#13111e]">
              <h2 className="rpg-label text-center mb-6">🛡️ STATUS DO HERÓI</h2>
              {character ? (
                <div className="text-center">
                  <div className="w-24 h-24 bg-[#1a162e] border-2 border-[#2a2540] mx-auto mb-4 flex items-center justify-center text-4xl shadow-inner">
                    <img
                      src={
                        character.class === "guerreiro"
                          ? "https://res.cloudinary.com/dbxwiln0a/image/upload/v1773266348/rnanhvyyxswz97muunjb.png"
                          : character.class === "mago"
                            ? "https://res.cloudinary.com/dbxwiln0a/image/upload/v1773266025/zmxcwbnzlcjuyinlql8y.png"
                            : character.class === "druida"
                              ? "https://res.cloudinary.com/dbxwiln0a/image/upload/v1773266352/wlv51tbtkw6orieaf6v3.png"
                              : "https://res.cloudinary.com/dbxwiln0a/image/upload/v1773266354/tnsbow0hjps23y8bgt1h.png"
                      }
                      alt={character.class}
                      style={{
                        width: "80px",
                        height: "80px",
                        objectFit: "contain",
                        borderRadius: "8px",
                      }}
                    />
                  </div>
                  <h3 className="text-2xl text-[#f5c542] uppercase tracking-tighter">
                    {character.name}
                  </h3>
                  <p className="text-[#6b6480] mb-8 text-xs tracking-widest uppercase">
                    Nível {character.level || 1} {character.class}
                  </p>

                  <div className="space-y-5 text-left">
                    <StatBar
                      label="HP"
                      current={character.hp}
                      max={character.max_hp}
                      color="bg-red-500"
                    />
                    <StatBar
                      label="MP"
                      current={character.mp}
                      max={character.max_mp}
                      color="bg-blue-500"
                    />
                    <StatBar
                      label="XP"
                      current={character.xp}
                      max={100 * (character.level || 1)}
                      color="bg-yellow-500"
                      isXP
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="mb-4 text-[#6b6480]">
                    Ainda não tens um herói.
                  </p>
                  <Link
                    href="/create-character"
                    className="rpg-btn block text-center text-sm"
                  >
                    CRIAR PERSONAGEM
                  </Link>
                </div>
              )}
            </div>
          </section>

          {/* MURAL DE MISSÕES */}
          <section className="lg:col-span-8">
            <div className="rpg-card rpg-border p-6 bg-[#13111e] min-h-[500px] flex flex-col">
              <div className="flex justify-between items-center mb-8 border-b border-[#2a2540] pb-4">
                <h2 className="rpg-title text-2xl">MURAL DE MISSÕES</h2>

                {/* AQUI ESTÁ O COMPONENTE SHEET INTEGRADO */}
                <NewQuestSheet
                  onQuestCreated={() => {
                    if (character) {
                      fetchTasks(character.user_id);
                    }
                  }}
                />
              </div>

              <div className="space-y-4 overflow-y-auto max-h-[600px] pr-2 font-mono">
                {tasks.length > 0 ? (
                  tasks.map((task) => {
                    const isHabit = task.type === "habito";
                    const isDaily = task.type === "diaria";
                    const isNegative = task.direction === "negativo";

                    return (
                      <div
                        key={task.id}
                        className="flex items-center justify-between p-4 bg-[#1a162e] border transition-all"
                      >
                        {/* INFO DA TASK */}
                        <div className="flex items-center gap-4">
                          <div
                            className={`font-bold text-xl ${isNegative ? "text-red-500" : "text-[#f5c542]"}`}
                          >
                            {isHabit ? "♾️" : isDaily ? "📅" : "📜"}
                          </div>
                          <div>
                            <h4
                              className={`font-bold text-sm uppercase ${isNegative ? "text-red-400" : "text-[#eee]"}`}
                            >
                              {task.title}
                            </h4>
                            <p className="text-[9px] uppercase font-bold">
                              {isNegative ? (
                                <span className="text-red-500">
                                  PENALIDADE: -{task.penalty_hp} HP
                                </span>
                              ) : (
                                <span className="text-yellow-500">
                                  RECOMPENSA: +{task.xp_reward} XP
                                </span>
                              )}
                            </p>
                          </div>
                        </div>

                        {/* BOTÕES DE AÇÃO */}
                        <div className="flex items-center gap-2">
                          {isHabit ? (
                            /* Se for hábito negativo, mostra apenas o botão de MENOS */
                            isNegative ? (
                              <button
                                onClick={() => completeTask(task)}
                                className="w-10 h-10 flex items-center justify-center border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white font-black text-xl transition-all"
                              >
                                −
                              </button>
                            ) : (
                              /* Se for hábito positivo, mostra o botão de MAIS */
                              <button
                                onClick={() => completeTask(task)}
                                className="w-10 h-10 flex items-center justify-center border-2 border-green-500 text-green-500 hover:bg-green-500 hover:text-black font-black text-xl transition-all"
                              >
                                +
                              </button>
                            )
                          ) : (
                            /* DIÁRIAS OU AFAZERES */
                            <ConfettiButton
                              confettiOptions={
                                isNegative
                                  ? { particleCount: 0 }
                                  : { particleCount: 100 }
                              }
                              onClick={() => completeTask(task)}
                              className={`text-[10px] px-4 py-2 uppercase font-bold border transition-all ${
                                isDaily
                                  ? "border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-black"
                                  : "border-[#f5c542] text-[#f5c542] hover:bg-[#f5c542] hover:text-black"
                              }`}
                            >
                              {isDaily ? "✔ Diária" : "✦ Concluir"}
                            </ConfettiButton>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-20 text-center opacity-30 italic text-sm">
                    Sem missões no mural...
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

function StatBar({ label, current, max, color, isXP = false }: any) {
  const percent = Math.min((current / max) * 100, 100);
  return (
    <div className="stat-row">
      <div className="flex justify-between text-[10px] mb-1 font-bold tracking-tighter uppercase">
        <span
          className={
            isXP
              ? "text-yellow-500"
              : label === "HP"
                ? "text-red-400"
                : "text-blue-400"
          }
        >
          {label}
        </span>
        <span className="text-[#6b6480]">
          {current} / {max}
        </span>
      </div>
      <div className="stat-track h-2 bg-[#0a0910] border border-[#2a2540]">
        <div
          className={`stat-fill ${color} h-full transition-all duration-500`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
