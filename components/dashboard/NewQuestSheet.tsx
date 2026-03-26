"use client";

import * as React from "react";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger } from
"@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue } from
"@/components/ui/select";
import { Sword, Brain, ZapIcon, Cross, ShieldAlert, Zap } from "lucide-react";
import {
  Difficulty,
  QUEST_DIFFICULTY_CONFIG } from
"@/components/dashboard/dashboardUtils";

type TaskType = "habito" | "diaria" | "afazer";
type Direction = "positivo" | "negativo";
type SkillType = "forca" | "inteligencia" | "agilidade" | "fe";

const skillIcons: Record<SkillType, React.ReactNode> = {
  forca: <Sword size={14} />,
  inteligencia: <Brain size={14} />,
  agilidade: <ZapIcon size={14} />,
  fe: <Cross size={14} />
};

export function NewQuestSheet({
  onQuestCreated


}: {onQuestCreated?: () => void;}) {
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [taskType, setTaskType] = useState<TaskType>("afazer");
  const [title, setTitle] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [direction, setDirection] = useState<Direction>("positivo");
  const [skillType, setSkillType] = useState<SkillType>("forca");

  const config = QUEST_DIFFICULTY_CONFIG[difficulty];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (!user) return setLoading(false);

    const attrRewardValue =
    direction === "negativo" ? -config.attr : config.attr;

    const attrRewards = {
      forca_reward: skillType === "forca" ? attrRewardValue : 0,
      inteligencia_reward: skillType === "inteligencia" ? attrRewardValue : 0,
      agilidade_reward: skillType === "agilidade" ? attrRewardValue : 0,
      fe_reward: skillType === "fe" ? attrRewardValue : 0
    };

    const taskData = {
      user_id: user.id,
      title,
      type: taskType,
      skill_type: skillType,
      difficulty,
      direction: taskType === "habito" ? direction : "positivo",
      xp_reward: direction === "negativo" ? 0 : config.xp,
      hp_reward: direction === "negativo" ? 0 : config.hp,
      penalty_hp: config.hp,
      mana_cost: config.mana,
      is_completed: false,
      ...attrRewards
    };

    console.log("📋 Task a enviar:", taskData);

    const { error } = await supabase.from("tasks").insert([taskData]);

    if (error) {
      console.error("❌ Erro ao criar task:", error);
    } else {
      setTitle("");
      setOpen(false);
      onQuestCreated?.();
    }
    setLoading(false);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="trigger-btn hover:text-[#f5c542] cursor-pointer font-mono tracking-widest text-xs">
          ✦ NOVA QUEST
        </button>
      </SheetTrigger>

      <SheetContent className="rpg-sheet-content border-0 sm:max-w-110 bg-[#0f0d1a] text-white font-mono p-0 flex flex-col overflow-hidden">
        {}
        <div className="flex-1 overflow-y-auto p-6 pt-8 scrollbar-hide">
          {}
          <SheetHeader className="mb-6 text-left">
            <SheetTitle className="text-[#f5c542] text-2xl font-bold italic tracking-tighter uppercase">
              📜 REGISTAR DESTINO
            </SheetTitle>
            <SheetDescription className="text-[#cbd5e1] text-[10px] uppercase">
              Define o atributo e o tipo de missão.
            </SheetDescription>
          </SheetHeader>

          {}
          <form id="quest-form" onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <label className="rpg-label text-[10px]">TIPO DE MISSÃO</label>
              <div className="grid grid-cols-3 gap-2">
                {["habito", "diaria", "afazer"].map((t) =>
                <button
                  key={t}
                  type="button"
                  onClick={() => setTaskType(t as TaskType)}
                  aria-pressed={taskType === t}
                  aria-label={`Selecionar tipo ${t}`}
                  className={`p-2 text-[10px] border font-bold uppercase transition-all ${taskType === t ? "bg-[#f5c542] text-black border-[#f5c542]" : "border-[#2a2540] text-[#cbd5e1] hover:border-[#f5c542]"}`}>
                  
                    {t}
                  </button>
                )}
              </div>
            </div>

            <div className="grid gap-2">
              <label className="rpg-label text-[10px]">TÍTULO</label>
              <Input
                value={title}
                required
                placeholder="Ex: Treinar Espada..."
                onChange={(e) => setTitle(e.target.value)}
                className="rpg-input bg-black/40 border-[#2a2540] rounded-none h-11" />
              
            </div>

            <div className="grid gap-2">
              <label className="rpg-label text-[10px]">ATRIBUTO FOCO</label>
              <div className="grid grid-cols-2 gap-2">
                {(
                ["forca", "inteligencia", "agilidade", "fe"] as SkillType[]).
                map((s) =>
                <button
                  key={s}
                  type="button"
                  onClick={() => setSkillType(s)}
                  className={`p-2 text-[9px] border font-bold uppercase flex items-center justify-center gap-2 transition-all ${
                  skillType === s ?
                  "bg-white/10 border-[#f5c542] text-[#f5c542]" :
                  "border-[#2a2540] text-[#cbd5e1] hover:border-[#f5c542]/50"}`
                  }>
                  
                    {skillIcons[s]} {s}
                  </button>
                )}
              </div>
            </div>

            {taskType === "habito" &&
            <div className="grid gap-2">
                <label className="rpg-label text-[10px]">META</label>
                <Select
                value={direction}
                onValueChange={(v: Direction) => setDirection(v)}>
                
                  <SelectTrigger className="rpg-select-trigger h-10 border-[#2a2540] bg-black/40 rounded-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rpg-select-content bg-[#13111e] text-white border-[#2a2540]">
                    <SelectItem value="positivo">(+) BOM (Ganha XP)</SelectItem>
                    <SelectItem value="negativo">(-) MAU (Perde HP)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            }

            <div className="grid gap-2">
              <label className="rpg-label text-[10px]">DIFICULDADE</label>
              <Select
                value={difficulty}
                onValueChange={(v: Difficulty) => setDifficulty(v)}>
                
                <SelectTrigger className="rpg-select-trigger h-10 border-[#2a2540] bg-black/40 rounded-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rpg-select-content bg-[#13111e] text-white border-[#2a2540]">
                  {Object.entries(QUEST_DIFFICULTY_CONFIG).map(([key, val]) =>
                  <SelectItem key={key} value={key}>
                      {val.label} — {val.sublabel}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {}
            <div
              className={`rounded-none border p-3 bg-black/20 ${direction === "negativo" ? "border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.1)]" : "border-[#f5c542]/50 shadow-[0_0_15px_rgba(245,197,66,0.1)]"}`}>
              
              <div className="space-y-2">
                {direction === "negativo" ?
                <div className="flex items-center gap-2 text-red-500">
                    <ShieldAlert size={16} />
                    <span className="text-[10px] tracking-tighter">
                      -{config.hp} HP -{config.attr} {skillType.toUpperCase()}
                    </span>
                  </div> :

                <div className="flex items-center gap-3 text-yellow-500">
                    <div className="flex items-center gap-2">
                      <Zap size={16} fill="#f5c542" />
                      <span className="text-[10px] tracking-tighter">
                        +{config.xp} XP
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {skillIcons[skillType]}
                      <span className="text-[10px] tracking-tighter">
                        +{config.attr} {skillType.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-[10px] uppercase text-[#7dd3fc] mt-2">
                      -{config.mana} MP
                    </div>
                  </div>
                }
                <div className="text-blue-400 text-[10px] uppercase">
                  • {difficulty}
                </div>
              </div>
            </div>
          </form>
        </div>

        {}
        <SheetFooter className="p-6 bg-black/40 border-t border-white/5">
          <Button
            type="submit"
            form="quest-form"
            disabled={loading}
            className="w-full bg-[#f5c542] text-black font-bold hover:bg-[#e4b532] h-11 rounded-none uppercase tracking-widest text-xs">
            
            {loading ? "A FORJAR..." : "✦ PUBLICAR MISSÃO"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>);

}