"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import PixelBackground from "@/components/PixelBackground";
import { NewQuestSheet } from "@/components/dashboard/NewQuestSheet";
import CharacterPanel from "@/components/dashboard/CharacterPanel";
import TaskFilter from "@/components/dashboard/TaskFilter";
import TaskCard from "@/components/dashboard/TaskCard";
import ItemShop from "@/components/dashboard/ItemShop";
import ToastMessage from "@/components/dashboard/ToastMessage";
import {
  handleLevelUp,
  Task,
  Character,
} from "@/components/dashboard/dashboardUtils";

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

  const deleteTask = async (taskId: string) => {
    if (!character) return;

    const { error } = await supabase.from("tasks").delete().eq("id", taskId);

    if (error) {
      console.error("Erro ao apagar task:", error.message);
      return;
    }

    // Atualiza state local para remover a task da lista imediatamente
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) return router.push("/login");

      const { data: char } = await supabase
        .from("characters")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (char) {
        if (char.hp <= 0) return router.push("/dashboard/revive");
        const { xp, level } = handleLevelUp(char.xp || 0, char.level || 1);
        setCharacter({
          ...char,
          xp,
          level,
          forca: char.forca,
          inteligencia: char.inteligencia,
          agilidade: char.agilidade,
          fe: char.fe,
        });
      }

      await fetchTasks(user.id);
      setLoading(false);
    };
    fetchData();
  }, [router, supabase, fetchTasks]);

  const completeTask = async (task: Task) => {
    if (!character) return;

    let newHp = character.hp;
    let newXp = character.xp;
    let newLevel = character.level;

    // HP e XP
    if (task.direction === "negativo") {
      const dmg = task.penalty_hp || 10;
      newHp = Math.max(0, character.hp - dmg);
      showToast(`-${dmg} HP`, "dmg");
    } else {
      const gainedXp = task.xp_reward || 0;
      const leveled = handleLevelUp(character.xp + gainedXp, character.level);
      newXp = leveled.xp;
      newLevel = leveled.level;

      if (leveled.level > character.level) showToast("NÍVEL ACIMA! 🎉", "lvl");
      else if (gainedXp > 0) showToast(`+${gainedXp} XP`, "xp");

      newHp = Math.min(character.max_hp, character.hp + (task.hp_reward || 0));
    }

    const updatedAttrs = {
      forca: character.forca + (task.forca_reward || 0),
      inteligencia: character.inteligencia + (task.inteligencia_reward || 0),
      agilidade: character.agilidade + (task.agilidade_reward || 0),
      fe: character.fe + (task.fe_reward || 0),
      xp: newXp,
      level: newLevel,
      hp: newHp,
    };

    // Atualiza DB
    const { error } = await supabase
      .from("characters")
      .update(updatedAttrs)
      .eq("id", character.id);

    if (error) {
      console.error("Erro ao atualizar personagem:", error.message);
      return;
    }

    // Atualiza state local **imediatamente** sem depender do DB
    setCharacter((prev) => (prev ? { ...prev, ...updatedAttrs } : prev));

    // Marca a task como completa
    if (task.type !== "habito") {
      await supabase
        .from("tasks")
        .update({ is_completed: true })
        .eq("id", task.id);

      setTasks((prev) => prev.filter((t) => t.id !== task.id));
    }

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
      {toast && <ToastMessage toast={toast} />}
      <main className="min-h-screen relative z-10 font-mono flex flex-col">
        <div className="flex-1 flex items-center py-12">
          <div className="max-w-7xl mx-auto w-full px-4 md:px-6 grid grid-cols-1 xl:grid-cols-12 gap-8">
            <aside className="xl:col-span-3">
              <CharacterPanel character={character} />
            </aside>

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

              <TaskFilter
                activeFilter={activeFilter}
                setActiveFilter={setActiveFilter}
              />

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
                        onDelete={deleteTask}
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

            <aside className="xl:col-span-3">
              <ItemShop />
            </aside>
          </div>
        </div>
      </main>
    </>
  );
}
