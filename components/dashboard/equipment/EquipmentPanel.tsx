"use client";
// components/dashboard/equipment/EquipmentPanel.tsx

import React from "react";
import { Sword, Shield, Gem, Sparkles } from "lucide-react";
import type {
  EquipmentSlots,
  FinalStats,
  ActiveSetBonus,
} from "@/types/equipment";
import { RARITY_CONFIG } from "@/types/equipment";

// ─── Props ────────────────────────────────────────────────────────────────────

interface EquipmentPanelProps {
  equipment: EquipmentSlots;
  onSlotClick?: (slot: "weapon" | "armor" | "amulet") => void;
  finalStats?: FinalStats;
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
        group relative flex flex-col items-center gap-3
        w-full rounded-2xl border p-5 text-center
        transition-all duration-200
        ${
          item
            ? `${rarity!.border} ${rarity!.glow} bg-[#1a162e]/70 hover:brightness-110 hover:scale-[1.02]`
            : "border-[#2a2540] bg-[#1a162e]/30 hover:border-[#3a3558] hover:bg-[#1a162e]/50"
        }
      `}
    >
      {/* Ícone */}
      <div
        className={`
          w-14 h-14 flex items-center justify-center rounded-xl text-3xl leading-none
          ${
            item
              ? `${rarity!.bg} border ${rarity!.border}`
              : "bg-[#0f0d1a] border border-[#2a2540]"
          }
        `}
      >
        {item ? item.icon : <span className="text-zinc-600">{emptyEmoji}</span>}
      </div>

      {/* Label do slot */}
      <div className="flex items-center gap-1.5">
        <Icon className="w-3 h-3 text-zinc-500" />
        <span className="text-[9px] uppercase tracking-widest font-semibold text-zinc-500">
          {label}
        </span>
      </div>

      {/* Nome do item */}
      {item ? (
        <p
          className={`text-[11px] font-bold leading-snug ${rarity!.color} line-clamp-2 px-1`}
        >
          {item.name}
        </p>
      ) : (
        <p className="text-[10px] text-zinc-600 italic">vazio</p>
      )}
    </button>
  );
}

// ─── Sub-componente: Set Bonus ────────────────────────────────────────────────

function SetBonusBadge({ activeSetBonus }: { activeSetBonus: ActiveSetBonus }) {
  return (
    <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
        </div>
        <div className="flex-1">
          <span className="text-[10px] font-bold uppercase tracking-widest text-purple-300">
            Set Bonus Ativo
          </span>
        </div>
        <span className="text-[10px] text-purple-400 font-bold bg-purple-500/20 border border-purple-500/30 px-2 py-0.5 rounded-full">
          {activeSetBonus.pieces_equipped} peças
        </span>
      </div>

      {/* Bonus Tags */}
      <div className="flex flex-wrap gap-1.5">
        {activeSetBonus.bonuses_active.flatMap((bonus, bi) =>
          Object.entries(bonus).map(([key, val]) => (
            <span
              key={`${bi}-${key}`}
              className="text-[9px] px-2.5 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 font-semibold"
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
  equipment,
  finalStats,
  onSlotClick,
}: EquipmentPanelProps) {
  if (!finalStats) {
    return (
      <div className="bg-[#13111e] border border-[#2a2540] rounded-2xl p-6">
        <p className="text-zinc-500 text-xs italic text-center">
          Equipamento não carregado...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#13111e] border border-[#2a2540] rounded-2xl p-6 space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center gap-3 pb-4 border-b border-[#2a2540]">
        <div className="w-8 h-8 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
          <span className="text-sm">⚔️</span>
        </div>
        <h4 className="text-yellow-300 text-xs font-bold uppercase tracking-[0.2em]">
          Equipamento
        </h4>
      </div>

      {/* ── Slots ── */}
      <div className="grid grid-cols-3 gap-4">
        <EquipSlot
          label="Arma"
          icon={Sword}
          item={equipment.weapon}
          emptyEmoji="🗡️"
          onClick={() => onSlotClick?.("weapon")}
        />
        <EquipSlot
          label="Armadura"
          icon={Shield}
          item={equipment.armor}
          emptyEmoji="🛡️"
          onClick={() => onSlotClick?.("armor")}
        />
        <EquipSlot
          label="Amuleto"
          icon={Gem}
          item={equipment.amulet}
          emptyEmoji="📿"
          onClick={() => onSlotClick?.("amulet")}
        />
      </div>

      {/* ── Divider só aparece se tiver set bonuses ── */}
      {(finalStats?.active_set_bonuses?.length ?? 0) > 0 && (
        <>
          <div className="border-t border-[#2a2540]" />

          {/* ── Set Bonuses ── */}
          <div className="space-y-3">
            {finalStats!.active_set_bonuses.map((sb) => (
              <SetBonusBadge key={sb.set_id} activeSetBonus={sb} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
