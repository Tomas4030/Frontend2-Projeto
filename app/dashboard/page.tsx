"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import PixelBackground from "@/components/PixelBackground";
import { NewQuestSheet } from "@/components/dashboard/NewQuestSheet";
import TaskFilter from "@/components/dashboard/TaskFilter";
import TaskCard from "@/components/dashboard/TaskCard";
import ItemShop from "@/components/dashboard/ItemShop";
import ToastMessage from "@/components/dashboard/ToastMessage";
import InventorySheet from "@/components/dashboard/equipment/InventorySheet";
import { useEquipment } from "@/hooks/useEquipment";
import { applyGoldMultiplier, applyXpMultiplier } from "@/lib/equipment";
import {
  handleLevelUp,
  Task,
  Character,
  Difficulty,
  getManaCost,
  getRandomGoldReward,
} from "@/components/dashboard/dashboardUtils";
import CharacterPanel from "@/components/dashboard/CharacterPanel";

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

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  const { equipment, finalStats, refreshEquipment } = useEquipment(character);

  const showToast = (msg: string, type: "xp" | "hp" | "lvl" | "dmg") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  };

  const filteredTasks = tasks.filter(
    (t) => activeFilter === "todos" || t.type === activeFilter,
  );

  const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);

  const paginatedTasks = filteredTasks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

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

  const fetchCharacter = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from("characters")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error) {
      console.error("Erro ao atualizar personagem:", error.message);
      return;
    }

    if (data) {
      const { xp, level } = handleLevelUp(data.xp || 0, data.level || 1);

      setCharacter({
        ...data,
        xp,
        level,
        forca: data.forca,
        inteligencia: data.inteligencia,
        agilidade: data.agilidade,
        fe: data.fe,
      } as Character);
    }
  }, [supabase]);

  const deleteTask = async (taskId: string) => {
    if (!character) return;

    const { error } = await supabase.from("tasks").delete().eq("id", taskId);

    if (error) {
      console.error("Erro ao apagar task:", error.message);
      return;
    }

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
        } as Character);
      }

      await fetchTasks(user.id);
      setLoading(false);
    };

    fetchData();
  }, [router, supabase, fetchTasks]);

  const completeTask = async (task: Task) => {
    if (!character) return;

    const difficulty: Difficulty = task.difficulty ?? "easy";
    const manaCost = task.mana_cost ?? getManaCost(difficulty);

    if (character.mp < manaCost) {
      showToast("Mana insuficiente para concluir a missão.", "dmg");
      return;
    }

    const xpBoostActive =
      character.xp_boost_multiplier === 2 &&
      !!character.xp_boost_expires_at &&
      new Date(character.xp_boost_expires_at).getTime() > Date.now();

    const xpBoostExpired =
      character.xp_boost_multiplier === 2 &&
      !!character.xp_boost_expires_at &&
      new Date(character.xp_boost_expires_at).getTime() <= Date.now();

    let newHp = character.hp;
    let newXp = character.xp;
    let newLevel = character.level;
    const newMp = Math.max(0, character.mp - manaCost);
    let newGold = character.gold ?? 0;

    let newForca = character.forca;
    let newInteligencia = character.inteligencia;
    let newAgilidade = character.agilidade;
    let newFe = character.fe;

    let newXpBoostMultiplier = character.xp_boost_multiplier ?? 1;
    let newXpBoostExpiresAt = character.xp_boost_expires_at ?? null;

    if (xpBoostExpired) {
      newXpBoostMultiplier = 1;
      newXpBoostExpiresAt = null;
    }

    if (task.direction === "negativo") {
      const dmg = task.penalty_hp || 10;
      newHp = Math.max(0, character.hp - dmg);

      showToast(`-${dmg} HP • -${manaCost} MP`, "dmg");
    } else {
      const baseXp = task.xp_reward || 0;
      let gainedXp = xpBoostActive ? baseXp * 2 : baseXp;

      if (finalStats && finalStats.final_xp_multiplier > 1) {
        gainedXp = applyXpMultiplier(gainedXp, finalStats);
      }

      const baseGold = getRandomGoldReward(difficulty);
      const gainedGold = finalStats
        ? applyGoldMultiplier(baseGold, finalStats)
        : baseGold;

      const leveled = handleLevelUp(character.xp + gainedXp, character.level);
      newXp = leveled.xp;
      newLevel = leveled.level;
      newGold += gainedGold;

      newHp = Math.min(character.max_hp, character.hp + (task.hp_reward || 0));

      newForca += task.forca_reward || 0;
      newInteligencia += task.inteligencia_reward || 0;
      newAgilidade += task.agilidade_reward || 0;
      newFe += task.fe_reward || 0;

      if (leveled.level > character.level) {
        showToast(`NÍVEL ACIMA! • +${gainedGold} GOLD`, "lvl");
      } else if (gainedXp > 0) {
        showToast(`+${gainedXp} XP • +${gainedGold} GOLD`, "xp");
      }
    }

    const updatedAttrs = {
      forca: newForca,
      inteligencia: newInteligencia,
      agilidade: newAgilidade,
      fe: newFe,
      xp: newXp,
      level: newLevel,
      hp: newHp,
      mp: newMp,
      gold: newGold,
      xp_boost_multiplier: newXpBoostMultiplier,
      xp_boost_expires_at: newXpBoostExpiresAt,
    };

    const { error } = await supabase
      .from("characters")
      .update(updatedAttrs)
      .eq("id", character.id);

    if (error) {
      console.error("Erro ao atualizar personagem:", error.message);
      return;
    }

    setCharacter((prev) => (prev ? { ...prev, ...updatedAttrs } : prev));

    if (task.type !== "habito") {
      const { error: taskError } = await supabase
        .from("tasks")
        .update({ is_completed: true })
        .eq("id", task.id);

      if (!taskError) {
        setTasks((prev) => prev.filter((t) => t.id !== task.id));
      }
    }

    if (newHp <= 0) {
      router.push("/dashboard/revive");
    }
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
    <div className="min-h-screen text-white">
      <PixelBackground />
      {toast && <ToastMessage toast={toast} />}

      <main className="relative z-10 min-h-screen font-mono flex flex-col">
        <div className="flex-1 flex items-center py-12">
          <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-8 px-4 md:px-6 xl:grid-cols-12">
            <aside className="xl:col-span-3 flex flex-col gap-4 h-175">
              {character && finalStats && (
                <CharacterPanel
                  character={character}
                  equipment={equipment}
                  finalStats={finalStats}
                  onSlotClick={(slot) => {
                    console.log("slot clicked:", slot);
                  }}
                />
              )}
            </aside>

            <section className="xl:col-span-6 flex flex-col space-y-6 h-175">
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-3 text-lg font-bold uppercase tracking-widest text-[#f5c542]">
                  <span className="animate-pulse">⚔</span> Mural de Missões
                </h2>

                <div className="shrink-0">
                  <NewQuestSheet
                    onQuestCreated={() =>
                      character && fetchTasks(character.user_id)
                    }
                  />
                </div>
              </div>

              <TaskFilter
                activeFilter={activeFilter}
                setActiveFilter={(f) => {
                  setActiveFilter(f);
                  setCurrentPage(1);
                }}
              />

              <div
                className={`min-h-100 flex-1 space-y-3 ${
                  paginatedTasks.length > 0
                    ? "overflow-y-auto"
                    : "overflow-hidden"
                }`}
              >
                {paginatedTasks.length > 0 ? (
                  paginatedTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onDelete={deleteTask}
                      onComplete={completeTask}
                    />
                  ))
                ) : (
                  <div className="min-h-50 flex items-center justify-center border-2 border-[#2a2540] border-dashed bg-[#13111e]/50 py-24 text-center">
                    <p className="text-sm uppercase tracking-[0.3em] text-[#cbd5e1]">
                      Mural Vazio
                    </p>
                  </div>
                )}

                {paginatedTasks.length < itemsPerPage &&
                  Array(itemsPerPage - paginatedTasks.length)
                    .fill(0)
                    .map((_, idx) => <div key={idx} className="h-24" />)}
              </div>

              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-center gap-4">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className={`rounded px-3 py-1 font-bold ${
                      currentPage === 1
                        ? "cursor-not-allowed bg-gray-700"
                        : "bg-yellow-500 hover:bg-yellow-600"
                    }`}
                  >
                    Anterior
                  </button>

                  <span className="font-bold text-yellow-400">
                    Página {currentPage} de {totalPages}
                  </span>

                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                    className={`rounded px-3 py-1 font-bold ${
                      currentPage === totalPages
                        ? "cursor-not-allowed bg-gray-700"
                        : "bg-yellow-500 hover:bg-yellow-600"
                    }`}
                  >
                    Próxima
                  </button>
                </div>
              )}
            </section>

            <aside className="xl:col-span-3 flex flex-col gap-4 h-175">
              {character && finalStats && (
                <InventorySheet
                  character={character}
                  equipment={equipment}
                  onEquipmentChange={refreshEquipment}
                  onGoldChange={fetchCharacter}
                />
              )}

              <ItemShop
                gold={character?.gold ?? 0}
                characterId={character?.id ?? ""}
                onPurchaseSuccess={fetchCharacter}
              />
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
