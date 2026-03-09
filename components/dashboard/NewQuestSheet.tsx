"use client";

import * as React from "react";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { format } from "date-fns";
import { CalendarIcon, ChevronDownIcon, Zap } from "lucide-react";

type Difficulty = "easy" | "medium" | "hard";

const difficultyConfig: Record<
  Difficulty,
  {
    xp: number;
    hp: number;
    label: string;
    sublabel: string;
    color: string;
    glow: string;
    bars: number;
  }
> = {
  easy: {
    xp: 10,
    hp: 5,
    label: "RANK E",
    sublabel: "Fácil",
    color: "#4ade80",
    glow: "rgba(74,222,128,0.35)",
    bars: 1,
  },
  medium: {
    xp: 25,
    hp: 10,
    label: "RANK C",
    sublabel: "Médio",
    color: "#60a5fa",
    glow: "rgba(96,165,250,0.35)",
    bars: 2,
  },
  hard: {
    xp: 50,
    hp: 20,
    label: "RANK S",
    sublabel: "Difícil",
    color: "#f5c542",
    glow: "rgba(245,197,66,0.4)",
    bars: 3,
  },
};

export function NewQuestSheet({
  onQuestCreated,
}: {
  onQuestCreated?: () => void;
}) {
  const supabase = createClient();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [date, setDate] = useState<Date>();

  const config = difficultyConfig[difficulty];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    // No teu handleSubmit, antes do insert:
    const { error } = await supabase.from("tasks").insert([
      {
        user_id: user.id,
        title: title,
        xp_reward: config.xp,
        hp_reward: config.hp,
        // Se ainda não criaste a coluna no Supabase, comenta a linha abaixo:
        due_date: date ? date.toISOString() : null,
        is_completed: false,
      },
    ]);

    if (error) {
      console.error(error.message);
      setLoading(false);
      return;
    }

    setTitle("");
    setDifficulty("easy");
    setDate(undefined);
    setOpen(false);

    onQuestCreated?.();
    setLoading(false);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="trigger-btn">✦ NOVA QUEST</button>
      </SheetTrigger>

      {/* Alteração na largura e paddings aqui */}
      <SheetContent className="rpg-sheet-content border-0 sm:max-w-[440px] p-0 flex flex-col">
        <div className="flex-1 overflow-y-auto p-8 pt-10">
          <SheetHeader className="space-y-3 mb-8">
            <SheetTitle className="text-[#f5c542] text-2xl font-bold tracking-wider">
              📜 NOVA MISSÃO
            </SheetTitle>

            <SheetDescription className="text-sm text-[#b4a07890]">
              Regista o teu destino no mural dos heróis.
            </SheetDescription>
          </SheetHeader>

          <form id="quest-form" onSubmit={handleSubmit} className="grid gap-6">
            {/* Title */}
            <div className="grid gap-2">
              <label className="rpg-label">Título da Missão</label>
              <Input
                value={title}
                required
                placeholder="Ex: Treinar 30min de Espada"
                onChange={(e) => setTitle(e.target.value)}
                className="rpg-input h-11"
              />
            </div>

            {/* Difficulty */}
            <div className="grid gap-2">
              <label className="rpg-label">Dificuldade</label>
              <Select
                value={difficulty}
                onValueChange={(v) => setDifficulty(v as Difficulty)}
              >
                <SelectTrigger className="rpg-select-trigger h-11 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rpg-select-content">
                  {Object.entries(difficultyConfig).map(([key, val]) => (
                    <SelectItem key={key} value={key}>
                      {val.label} — {val.sublabel} (+{val.xp} XP)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date */}
            <div className="grid gap-2">
              <label className="rpg-label">Data Limite</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="date-btn h-11 w-full flex justify-between px-3"
                  >
                    <div className="flex items-center gap-2">
                      <CalendarIcon size={14} />
                      <span>
                        {date ? format(date, "PPP") : "Sem prazo definido"}
                      </span>
                    </div>
                    <ChevronDownIcon size={14} className="opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={date} onSelect={setDate} />
                </PopoverContent>
              </Popover>
            </div>

            {/* Reward Card */}
            <div
              className="rounded-lg border p-5 transition-all bg-black/20"
              style={{
                borderColor: config.color,
                boxShadow: `0 0 15px ${config.glow}`,
              }}
            >
              <p className="text-[10px] uppercase tracking-widest opacity-60 mb-3 font-bold">
                Recompensa Estimada
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Zap size={20} fill={config.color} color={config.color} />
                  <span
                    className="text-xl font-bold italic"
                    style={{ color: config.color }}
                  >
                    +{config.xp} XP
                  </span>
                </div>
                <span className="text-red-400 font-bold">+{config.hp} HP</span>
              </div>
            </div>
          </form>
        </div>

        <SheetFooter className="p-8 bg-black/10 border-t border-[#ffffff05]">
          <Button
            type="submit"
            form="quest-form"
            disabled={loading}
            className="submit-btn w-full h-12 text-md font-bold"
          >
            {loading ? "A PUBLICAR..." : "✦ PUBLICAR MISSÃO"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
