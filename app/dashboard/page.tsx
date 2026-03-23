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
        setCharacter({ ...char, xp, level });
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

    if (
      task.strength_reward ||
      task.intelligence_reward ||
      task.dexterity_reward ||
      task.faith_reward
    ) {
      const newCharacter = { ...character };
      newCharacter.strength += task.strength_reward || 0;
      newCharacter.intelligence += task.intelligence_reward || 0;
      newCharacter.dexterity += task.dexterity_reward || 0;
      newCharacter.faith += task.faith_reward || 0;

      // Atualiza no Supabase
      await supabase
        .from("characters")
        .update({
          strength: newCharacter.strength,
          intelligence: newCharacter.intelligence,
          dexterity: newCharacter.dexterity,
          faith: newCharacter.faith,
        })
        .eq("id", character.id);

      // Atualiza estado local
      setCharacter(newCharacter);
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
