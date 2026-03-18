"use client";
import * as React from "react";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { CalendarIcon, ChevronDownIcon, Zap, ShieldAlert } from "lucide-react";

type TaskType = "habito" | "diaria" | "afazer";
type Difficulty = "easy" | "medium" | "hard";
type Direction = "positivo" | "negativo";

const difficultyConfig = {
  easy: { xp: 10, hp: 5, label: "RANK E", sublabel: "Fácil", color: "#4ade80" },
  medium: { xp: 25, hp: 10, label: "RANK C", sublabel: "Médio", color: "#60a5fa" },
  hard: { xp: 50, hp: 20, label: "RANK S", sublabel: "Difícil", color: "#f5c542" },
};

export function NewQuestSheet({ onQuestCreated }: { onQuestCreated?: () => void }) {
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [taskType, setTaskType] = useState<TaskType>("afazer");
  const [title, setTitle] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [direction, setDirection] = useState<Direction>("positivo");
  const [date, setDate] = useState<Date>();

  const config = difficultyConfig[difficulty];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return setLoading(false);

    const { error } = await supabase.from("tasks").insert([{
      user_id: user.id,
      title,
      type: taskType,
      direction: taskType === "habito" ? direction : "positivo",
      xp_reward: direction === "negativo" ? 0 : config.xp,
      hp_reward: direction === "negativo" ? 0 : config.hp,
      penalty_hp: config.hp, // Dano se for hábito ruim ou se falhar diária
      expires_at: date ? date.toISOString() : null,
      is_completed: false,
    }]);

    if (!error) {
      setTitle("");
      setOpen(false);
      onQuestCreated?.();
    }
    setLoading(false);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="trigger-btn hover:text-[#f5c542] cursor-pointer font-mono tracking-widest text-xs">✦ NOVA QUEST</button>
      </SheetTrigger>

      <SheetContent className="rpg-sheet-content border-0 sm:max-w-[440px] bg-[#0f0d1a] text-white font-mono p-0 flex flex-col">
        <div className="flex-1 overflow-y-auto p-8 pt-10">
          <SheetHeader className="mb-8">
            <SheetTitle className="text-[#f5c542] text-2xl font-bold italic tracking-tighter">📜 REGISTAR DESTINO</SheetTitle>
            <SheetDescription className="text-[#6b6480]">Escolhe o tipo de desafio que enfrentarás.</SheetDescription>
          </SheetHeader>

          <form id="quest-form" onSubmit={handleSubmit} className="grid gap-6">
            <div className="grid gap-2">
              <label className="rpg-label text-[10px]">TIPO DE MISSÃO</label>
              <div className="grid grid-cols-3 gap-2">
                {["habito", "diaria", "afazer"].map((t) => (
                  <button key={t} type="button" onClick={() => setTaskType(t as TaskType)}
                    className={`p-2 text-[10px] border font-bold uppercase transition-all ${taskType === t ? "bg-[#f5c542] text-black border-[#f5c542]" : "border-[#2a2540] text-[#6b6480] hover:border-[#f5c542]"}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-2">
              <label className="rpg-label text-[10px]">TÍTULO</label>
              <Input value={title} required placeholder="Ex: Treinar Espada..." onChange={(e) => setTitle(e.target.value)} className="rpg-input bg-black/40 border-[#2a2540]" />
            </div>

            {taskType === "habito" && (
              <div className="grid gap-2">
                <label className="rpg-label text-[10px]">META</label>
                <Select value={direction} onValueChange={(v: Direction) => setDirection(v)}>
                  <SelectTrigger className="rpg-select-trigger h-11"><SelectValue /></SelectTrigger>
                  <SelectContent className="rpg-select-content bg-[#13111e] text-white">
                    <SelectItem value="positivo">(+) Hábito Bom (Ganha XP)</SelectItem>
                    <SelectItem value="negativo">(-) Hábito Ruim (Perde HP)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid gap-2">
              <label className="rpg-label text-[10px]">DIFICULDADE</label>
              <Select value={difficulty} onValueChange={(v: Difficulty) => setDifficulty(v)}>
                <SelectTrigger className="rpg-select-trigger h-11"><SelectValue /></SelectTrigger>
                <SelectContent className="rpg-select-content bg-[#13111e] text-white">
                  {Object.entries(difficultyConfig).map(([key, val]) => (
                    <SelectItem key={key} value={key}>{val.label} — {val.sublabel}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* IMPACTO PREVIEW */}
            <div className={`rounded-lg border p-5 bg-black/40 ${direction === "negativo" ? "border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.1)]" : "border-[#f5c542]/50 shadow-[0_0_15px_rgba(245,197,66,0.1)]"}`}>
              <p className="text-[10px] uppercase opacity-60 mb-2">Impacto Visualizado</p>
              <div className="flex items-center justify-between font-bold">
                {direction === "negativo" ? (
                  <div className="flex items-center gap-2 text-red-500"><ShieldAlert size={18} /><span>-{config.hp} HP</span></div>
                ) : (
                  <div className="flex items-center gap-2 text-yellow-500"><Zap size={18} fill="#f5c542" /><span>+{config.xp} XP</span></div>
                )}
                <span className="text-blue-400 text-xs uppercase">{difficulty}</span>
              </div>
            </div>
          </form>
        </div>

        <SheetFooter className="p-8 bg-black/20 border-t border-white/5">
          <Button type="submit" form="quest-form" disabled={loading} className="w-full bg-[#f5c542] text-black font-bold hover:bg-[#e4b532] h-12">
            {loading ? "A FORJAR..." : "✦ PUBLICAR MISSÃO"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}