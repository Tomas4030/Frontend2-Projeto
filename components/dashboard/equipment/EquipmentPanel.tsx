"use client";
// components/dashboard/equipment/EquipmentPanel.tsx
// Painel visual dos slots de equipamento + buffs ativos + set bonuses

import React from "react";
import Image from "next/image";
import { Sword, Shield, Gem, Sparkles } from "lucide-react";
import type { EquipmentSlots, FinalStats, ActiveSetBonus } from "@/types/equipment";
import type { Character } from "@/components/dashboard/dashboardUtils";
import { RARITY_CONFIG } from "@/types/equipment";

// ─── Props ────────────────────────────────────────────────────────────────────

interface EquipmentPanelProps {
  character: Character;
  equipment: EquipmentSlots;
  finalStats: FinalStats;
  onSlotClick?: (slot: "weapon" | "armor" | "amulet") => void;
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
  icon: React.ElementType;
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
        <span className="text-[9px] uppercase tracking-widest text-zinc-500">{label}</span>
      </div>

      {/* Nome do item */}
      {item ? (
        <p className={`text-[10px] font-bold leading-tight ${rarity!.color} line-clamp-2`}>
          {item.name}
        </p>
      ) : (
        <p className="text-[10px] text-zinc-600 italic">vazio</p>
      )}
    </button>
  );
}

// ─── Sub-componente: Stat row ─────────────────────────────────────────────────

function StatRow({
  label,
  base,
  final,
  color = "text-yellow-300",
}: {
  label: string;
  base: number;
  final: number;
  color?: string;
}) {
  const bonus = final - base;
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-zinc-400 uppercase tracking-wider text-[10px]">{label}</span>
      <div className="flex items-center gap-1.5">
        <span className={`font-bold ${color}`}>{final}</span>
        {bonus > 0 && (
          <span className="text-emerald-400 text-[10px] font-semibold">+{bonus}</span>
        )}
      </div>
    </div>
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
          ))
        )}
      </div>
    </div>
  );
}

function formatBonusKey(key: string, val: unknown): string {
  const n = Number(val);
  switch (key) {
    case "strength_bonus":     return `+${n} Força`;
    case "intelligence_bonus": return `+${n} Inteligência`;
    case "hp_bonus":           return `+${n} HP`;
    case "mp_bonus":           return `+${n} MP`;
    case "xp_multiplier":      return `XP ×${n.toFixed(1)}`;
    case "gold_multiplier":    return `Gold ×${n.toFixed(1)}`;
    case "boss_damage_bonus":  return `+${n} Dano Boss`;
    case "streak_protection":  return "Streak Shield";
    default:                   return `${key}: ${val}`;
  }
}

// ─── Componente Principal ─────────────────────────────────────────────────────

export default function EquipmentPanel({
  character,
  equipment,
  finalStats,
  onSlotClick,
}: EquipmentPanelProps) {
  return (
    <div className="bg-[#13111e] border border-[#2a2540] rounded-xl p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-[#2a2540] pb-3">
        <span className="text-yellow-300 text-sm">⚔️</span>
        <h4 className="text-yellow-300 text-xs font-bold uppercase tracking-[0.2em]">
          Equipamento
        </h4>
        {finalStats.has_streak_protection && (
          <span
            title="Streak Protection ativa"
            className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 font-bold"
          >
            🛡 Streak Shield
          </span>
        )}
      </div>

      {/* Slots */}
      <div className="grid grid-cols-3 gap-2">
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

      {/* Stats finais */}
      <div className="border-t border-[#2a2540] pt-3 space-y-2">
        <p className="text-[9px] uppercase tracking-widest text-zinc-500 mb-2">Stats Finais</p>
        <StatRow label="Força"        base={character.forca}        final={finalStats.final_forca} />
        <StatRow label="Inteligência" base={character.inteligencia} final={finalStats.final_inteligencia} />
        <StatRow label="HP Máx"       base={character.max_hp}       final={finalStats.final_hp_max} color="text-rose-400" />
        <StatRow label="MP Máx"       base={character.max_mp}       final={finalStats.final_mp_max} color="text-blue-400" />

        {/* Multiplicadores */}
        {finalStats.final_xp_multiplier > 1 && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400 uppercase tracking-wider text-[10px]">XP Bónus</span>
            <span className="text-emerald-400 font-bold text-[10px]">×{finalStats.final_xp_multiplier.toFixed(2)}</span>
          </div>
        )}
        {finalStats.final_gold_multiplier > 1 && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400 uppercase tracking-wider text-[10px]">Gold Bónus</span>
            <span className="text-yellow-300 font-bold text-[10px]">×{finalStats.final_gold_multiplier.toFixed(2)}</span>
          </div>
        )}
        {finalStats.final_boss_damage_bonus > 0 && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400 uppercase tracking-wider text-[10px]">Dano Boss</span>
            <span className="text-orange-400 font-bold text-[10px]">+{finalStats.final_boss_damage_bonus}</span>
          </div>
        )}
      </div>

      {/* Set Bonuses Ativos */}
      {finalStats.active_set_bonuses.length > 0 && (
        <div className="space-y-2">
          {finalStats.active_set_bonuses.map((sb) => (
            <SetBonusBadge key={sb.set_id} activeSetBonus={sb} />
          ))}
        </div>
      )}
    </div>
  );
}
