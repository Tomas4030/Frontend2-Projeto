"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import PixelBackground from "@/components/PixelBackground";
import Link from "next/link";
import { NewQuestSheet } from "@/components/dashboard/NewQuestSheet"; 

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [character, setCharacter] = useState<any | null>(null);
  const [tasks, setTasks] = useState<any[]>([]);

  // Função para buscar as missões (agora reutilizável)
  const fetchTasks = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", userId)
      .eq("is_completed", false)
      .order("created_at", { ascending: false });
    
    if (data) setTasks(data);
  }, [supabase]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        router.push("/login");
        return;
      }

      const { data: char } = await supabase
        .from("characters")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (char) setCharacter(char);
      await fetchTasks(user.id);
      setLoading(false);
    };

    fetchData();
  }, [router, supabase, fetchTasks]);

  const completeTask = async (taskId: string, xpReward: number) => {
    const { error: taskError } = await supabase
      .from("tasks")
      .update({ is_completed: true })
      .eq("id", taskId);

    if (!taskError && character) {
      const newXp = character.xp + xpReward;
      
      await supabase
        .from("characters")
        .update({ xp: newXp })
        .eq("id", character.id);

      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      setCharacter((prev: any) => ({ ...prev, xp: newXp }));
    }
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
                    {character.class === "guerreiro" ? "⚔️" : character.class === "mago" ? "🜔" : character.class === "ladino" ? "🗡️" : "✦"}
                  </div>
                  <h3 className="text-2xl text-[#f5c542] uppercase tracking-tighter">{character.name}</h3>
                  <p className="text-[#6b6480] mb-8 text-xs tracking-widest uppercase">Nível {character.level || 1} {character.class}</p>

                  <div className="space-y-5 text-left">
                    <StatBar label="HP" current={character.hp} max={character.max_hp} color="bg-red-500" />
                    <StatBar label="MP" current={character.mp} max={character.max_mp} color="bg-blue-500" />
                    <StatBar label="XP" current={character.xp} max={100} color="bg-yellow-500" isXP />
                  </div>
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="mb-4 text-[#6b6480]">Ainda não tens um herói.</p>
                  <Link href="/create-character" className="rpg-btn block text-center text-sm">CRIAR PERSONAGEM</Link>
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
                <NewQuestSheet onQuestCreated={() => character && fetchTasks(character.user_id)} />
              </div>

              <div className="space-y-4 overflow-y-auto max-h-[600px] pr-2">
                {tasks.length > 0 ? (
                  tasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-4 bg-[#1a162e] border border-[#2a2540] hover:border-[#f5c542] transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="text-[#f5c542] font-bold text-xl">!</div>
                        <div>
                          <h4 className="text-[#eee] group-hover:text-[#f5c542] transition-colors">{task.title}</h4>
                          <p className="text-[10px] text-[#6b6480] uppercase">
                            Recompensa: <span className="text-yellow-500">+{task.xp_reward} XP</span> | <span className="text-red-400">+{task.hp_reward} HP</span>
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => completeTask(task.id, task.xp_reward)}
                        className="text-[10px] border border-[#2a2540] px-4 py-2 hover:bg-[#f5c542] hover:text-black transition-all uppercase font-bold"
                      >
                        Completar
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center opacity-40">
                    <p className="text-[#6b6480] text-center italic">Não há missões disponíveis no mural...</p>
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
        <span className={isXP ? "text-yellow-500" : label === "HP" ? "text-red-400" : "text-blue-400"}>{label}</span>
        <span className="text-[#6b6480]">{current} / {max}</span>
      </div>
      <div className="stat-track h-2 bg-[#0a0910] border border-[#2a2540]">
        <div className={`stat-fill ${color} h-full transition-all duration-500`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}