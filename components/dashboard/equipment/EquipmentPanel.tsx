"use client";
// components/dashboard/equipment/EquipmentPanel.tsx
// Painel visual dos slots de equipamento + buffs ativos + set bonuses

import React from "react";
import { Sword, Shield, Gem, Sparkles } from "lucide-react";
import type {
  EquipmentSlots,
  FinalStats,
  ActiveSetBonus,
} from "@/types/equipment";
import type { Character } from "@/components/dashboard/dashboardUtils";
import { RARITY_CONFIG } from "@/types/equipment";

// ─── Props ────────────────────────────────────────────────────────────────────

interface EquipmentPanelProps {
  character: Character;
  equipment: EquipmentSlots;
  onSlotClick?: (slot: "weapon" | "armor" | "amulet") => void;
  finalStats?: FinalStats; // só para set bonus
}

// ─── Sub-componente: Slot ─────────────────────────────────────────────────────

function EquipSlot({
  label,
  icon: Icon,
  item,
  emptyEmoji,
  onClick,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  item: EquipmentSlots["weapon"];
  emptyEmoji: string;
  onClick?: () => void;
}) {
  const rarity = item ? RARITY_CONFIG[item.rarity] : null;

  return (
    <button
      onClick={onClick}
      className={`
        group relative flex flex-col items-center gap-1.5
        w-full rounded-xl border p-3 text-center transition-all duration-200
        ${
          item
            ? `${rarity!.border} ${rarity!.glow} bg-[#1a162e]/60 hover:brightness-110`
            : "border-[#2a2540] bg-[#1a162e]/30 hover:border-[#3a3558]"
        }
      `}
    >
      {/* Ícone do item ou vazio */}
      <div
        className={`
          w-10 h-10 flex items-center justify-center rounded-lg text-xl leading-none
          ${item ? `${rarity!.bg} border ${rarity!.border}` : "bg-[#0f0d1a] border border-[#2a2540]"}
        `}
      >
        {item ? item.icon : <span className="text-zinc-600">{emptyEmoji}</span>}
      </div>

      {/* Label do slot */}
      <div className="flex items-center gap-1">
        <Icon className="w-3 h-3 text-zinc-500" />
        <span className="text-[9px] uppercase tracking-widest text-zinc-500">
          {label}
        </span>
      </div>

      {/* Nome do item */}
      {item ? (
        <p
          className={`text-[10px] font-bold leading-tight ${rarity!.color} line-clamp-2`}
        >
          {item.name}
        </p>
      ) : (
        <p className="text-[10px] text-zinc-600 italic">vazio</p>
      )}
    </button>
  );
}

// ─── Sub-componente: Set Bonus Badge ─────────────────────────────────────────

function SetBonusBadge({ activeSetBonus }: { activeSetBonus: ActiveSetBonus }) {
  return (
    <div className="rounded-lg border border-purple-500/30 bg-purple-500/10 px-3 py-2">
      <div className="flex items-center gap-1.5 mb-1">
        <Sparkles className="w-3 h-3 text-purple-400" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-purple-300">
          Set Bonus Ativo
        </span>
        <span className="ml-auto text-[10px] text-purple-400 font-bold">
          {activeSetBonus.pieces_equipped} peças
        </span>
      </div>
      <div className="flex flex-wrap gap-1 mt-1">
        {activeSetBonus.bonuses_active.flatMap((bonus, bi) =>
          Object.entries(bonus).map(([key, val]) => (
            <span
              key={`${bi}-${key}`}
              className="text-[9px] px-1.5 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 font-semibold"
            >
              {formatBonusKey(key, val)}
            </span>
          )),
        )}
      </div>
    </div>
  );
}

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
      return "Streak Shield";
    default:
      return `${key}: ${val}`;
  }
}

// ─── Componente Principal ─────────────────────────────────────────────────────

export default function EquipmentPanel({
  character,
  equipment,
  finalStats,
  onSlotClick,
}: EquipmentPanelProps) {
  if (!finalStats) {
    return (
      <div className="bg-[#13111e] border border-[#2a2540] rounded-xl p-4">
        <p className="text-zinc-400 text-xs italic">
          Equipamento não carregado...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#13111e] border border-[#2a2540] rounded-xl p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-[#2a2540] pb-3">
        <span className="text-yellow-300 text-sm">⚔️</span>
        <h4 className="text-yellow-300 text-xs font-bold uppercase tracking-[0.2em]">
          Equipamento
        </h4>
      </div>

      {/* Slots */}
      <div className="grid grid-cols-3 gap-2">
        <EquipSlot
          label="Arma"
          icon={Sword}
          item={equipment.weapon}
          emptyEmoji="🗡️"
        />
        <EquipSlot
          label="Armadura"
          icon={Shield}
          item={equipment.armor}
          emptyEmoji="🛡️"
        />
        <EquipSlot
          label="Amuleto"
          icon={Gem}
          item={equipment.amulet}
          emptyEmoji="📿"
        />
      </div>

      {/* Set bonus (se quiseres manter) */}
      {(finalStats?.active_set_bonuses?.length ?? 0) > 0 && (
        <div className="space-y-2">
          {finalStats!.active_set_bonuses.map((sb) => (
            <SetBonusBadge key={sb.set_id} activeSetBonus={sb} />
          ))}
        </div>
      )}
    </div>
  );
}
