"use client";

import React from "react";
import { Sword, Shield, Gem, Sparkles, LucideIcon } from "lucide-react";
import type {
  EquipmentSlots,
  FinalStats,
  ActiveSetBonus,
  EquipmentItem,
} from "@/types/equipment";
import { RARITY_CONFIG } from "@/types/equipment";

type SlotKey = "weapon" | "armor" | "amulet";

interface EquipmentPanelProps {
  equipment: EquipmentSlots;
  onSlotClick?: (slot: SlotKey) => void;
  finalStats?: FinalStats;
}

const SLOT_MAP: Record<
  SlotKey,
  { label: string; icon: LucideIcon; emoji: string }
> = {
  weapon: { label: "Arma", icon: Sword, emoji: "🗡️" },
  armor: { label: "Armadura", icon: Shield, emoji: "🛡️" },
  amulet: { label: "Amuleto", icon: Gem, emoji: "📿" },
};

function formatBonusKey(key: string, val: unknown): string {
  const n = Number(val);

  switch (key) {
    case "strength_bonus":
      return `+${n} Força`;
    case "intelligence_bonus":
      return `+${n} Inteligência`;
    case "hp_bonus":
      return `+${n} HP`;
    case "mp_bonus":
      return `+${n} MP`;
    case "xp_multiplier":
      return `XP ×${n.toFixed(1)}`;
    case "gold_multiplier":
      return `Gold ×${n.toFixed(1)}`;
    case "boss_damage_bonus":
      return `+${n} Dano Boss`;
    case "streak_protection":
      return "Proteção de Streak";
    default:
      return `${key}: ${String(val)}`;
  }
}

function EquipSlot({
  slotKey,
  item,
  onClick,
}: {
  slotKey: SlotKey;
  item?: EquipmentItem | null;
  onClick?: () => void;
}) {
  const config = SLOT_MAP[slotKey];
  const rarity = item ? RARITY_CONFIG[item.rarity] : null;

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full flex-col items-center"
    >
      <div
        className={`relative flex h-20 w-20 items-center justify-center rounded-2xl transition-all duration-300 ease-out group-hover:-translate-y-0.5 group-hover:scale-[1.04] group-active:scale-95 ${
          item
            ? `${rarity?.bg ?? ""} shadow-[0_8px_30px_rgba(0,0,0,0.18)]`
            : "bg-[#1a162e]"
        }`}
      >
        {item && (
          <div
            className={`pointer-events-none absolute inset-0 rounded-2xl opacity-20 blur-[2px] ${rarity?.glow ?? ""}`}
          />
        )}

        <span
          className={`relative z-10 text-3xl ${
            item ? "drop-shadow-md" : "opacity-20 grayscale"
          }`}
        >
          {item ? item.icon : config.emoji}
        </span>
      </div>

      <div className="mt-3 flex w-20 flex-col items-center">
        <div className="flex items-center gap-1 opacity-40">
          <config.icon className="h-2.5 w-2.5" />
          <span className="text-[8px] font-black uppercase tracking-widest">
            {config.label}
          </span>
        </div>

        <div className="mt-1.5 flex h-8 items-start justify-center">
          <p
            className={`line-clamp-2 text-center text-[10px] font-bold leading-tight ${
              item ? (rarity?.color ?? "text-white") : "italic text-zinc-600"
            }`}
          >
            {item ? item.name : "Vazio"}
          </p>
        </div>
      </div>
    </button>
  );
}

function SetBonusCard({ bonus }: { bonus: ActiveSetBonus }) {
  return (
    <div className="mt-2 rounded-xl bg-purple-500/5 p-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-purple-400">
          <Sparkles className="h-3 w-3" />
          <span className="text-[9px] font-black uppercase tracking-wider">
            Set Bonus
          </span>
        </div>

        <span className="text-[9px] font-bold uppercase text-purple-300/50">
          {bonus.pieces_equipped} Peças
        </span>
      </div>

      <div className="flex flex-wrap gap-x-2 gap-y-1">
        {bonus.bonuses_active.flatMap((entry, i) =>
          Object.entries(entry).map(([key, value]) => (
            <span
              key={`${i}-${key}`}
              className="text-[10px] font-medium text-purple-200/75"
            >
              • {formatBonusKey(key, value)}
            </span>
          )),
        )}
      </div>
    </div>
  );
}

export default function EquipmentPanel({
  equipment,
  finalStats,
  onSlotClick,
}: EquipmentPanelProps) {
  if (!finalStats) return null;

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center gap-3 px-1">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ea9b08]/10 text-[#ea9b08]">
          <Sword className="h-4 w-4" />
        </div>

        <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-[#ea9b08]">
          Arsenal de Combate
        </h4>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {(Object.keys(SLOT_MAP) as SlotKey[]).map((key) => (
          <EquipSlot
            key={key}
            slotKey={key}
            item={equipment[key]}
            onClick={() => onSlotClick?.(key)}
          />
        ))}
      </div>

      {finalStats.active_set_bonuses?.map((sb) => (
        <SetBonusCard key={sb.set_id} bonus={sb} />
      ))}
    </div>
  );
}
