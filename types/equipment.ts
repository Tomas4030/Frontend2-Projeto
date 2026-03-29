// types/equipment.ts

export type Slot = "weapon" | "armor" | "amulet";

export type Rarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

export interface ItemBuffs {
  strength_bonus?: number;
  intelligence_bonus?: number;
  agility_bonus?: number;
  faith_bonus?: number;
  hp_bonus?: number;
  mp_bonus?: number;
  xp_multiplier?: number;
  gold_multiplier?: number;
  boss_damage_bonus?: number;
  streak_protection?: boolean;
}

export interface UnlockConditions {
  min_level?: number;
  tasks_completed?: number;
  min_streak?: number;
  boss_killed?: boolean;
  challenge_id?: string;
}

export interface Item extends ItemBuffs {
  id: string;
  name: string;
  description: string;
  slot: Slot;
  rarity: Rarity;
  set_id?: string | null;
  price: number;
  icon: string;
  unlock_conditions: UnlockConditions;
  created_at?: string;
}

export interface InventoryItem {
  id: string;
  item: Item;
  acquired_at: string;
  isEquipped: boolean;
  isLocked: boolean;
}

export interface EquipmentSlots {
  weapon?: Item | null;
  armor?: Item | null;
  amulet?: Item | null;
}

export interface SetBonus {
  id: string;
  set_id: string;
  pieces_required: number;
  bonus_json: Partial<ItemBuffs>;
}

export interface ActiveSetBonus {
  set_id: string;
  pieces_equipped: number;
  bonuses_active: Partial<ItemBuffs>[];
}

export interface FinalStats {
  final_forca: number;
  final_inteligencia: number;
  final_agilidade: number;
  final_fe: number;
  final_hp_max: number;
  final_mp_max: number;
  final_xp_multiplier: number;
  final_gold_multiplier: number;
  final_boss_damage_bonus: number;
  has_streak_protection: boolean;
  active_set_bonuses: ActiveSetBonus[];
}

export interface RpcResponse {
  success: boolean;
  message: string;
  slot?: Slot;
}

export const RARITY_CONFIG: Record<
  Rarity,
  {
    label: string;
    color: string;
    border: string;
    glow: string;
    bg: string;
  }
> = {
  common: {
    label: "Comum",
    color: "text-zinc-300",
    border: "border-zinc-500/40",
    glow: "",
    bg: "bg-zinc-500/10",
  },
  uncommon: {
    label: "Incomum",
    color: "text-emerald-400",
    border: "border-emerald-500/40",
    glow: "shadow-[0_0_8px_rgba(52,211,153,0.2)]",
    bg: "bg-emerald-500/10",
  },
  rare: {
    label: "Raro",
    color: "text-blue-400",
    border: "border-blue-500/40",
    glow: "shadow-[0_0_12px_rgba(59,130,246,0.25)]",
    bg: "bg-blue-500/10",
  },
  epic: {
    label: "Épico",
    color: "text-purple-400",
    border: "border-purple-500/40",
    glow: "shadow-[0_0_16px_rgba(168,85,247,0.3)]",
    bg: "bg-purple-500/10",
  },
  legendary: {
    label: "Lendário",
    color: "text-yellow-300",
    border: "border-yellow-400/50",
    glow: "shadow-[0_0_20px_rgba(245,197,66,0.35)]",
    bg: "bg-yellow-400/10",
  },
};

export const SLOT_CONFIG: Record<Slot, { label: string; icon: string }> = {
  weapon: { label: "Arma", icon: "⚔️" },
  armor: { label: "Armadura", icon: "🛡️" },
  amulet: { label: "Amuleto", icon: "📿" },
};

// ─── Helpers de display de buffs ─────────────────────────────────────────────

export function getBuffLabels(item: Partial<ItemBuffs>): string[] {
  const labels: string[] = [];
  if (item.strength_bonus) labels.push(`+${item.strength_bonus} Força`);
  if (item.intelligence_bonus)
    labels.push(`+${item.intelligence_bonus} Inteligência`);
  if (item.hp_bonus) labels.push(`+${item.hp_bonus} HP`);
  if (item.mp_bonus) labels.push(`+${item.mp_bonus} MP`);
  if (item.xp_multiplier && item.xp_multiplier > 1)
    labels.push(`XP ×${item.xp_multiplier.toFixed(1)}`);
  if (item.gold_multiplier && item.gold_multiplier > 1)
    labels.push(`Gold ×${item.gold_multiplier.toFixed(1)}`);
  if (item.boss_damage_bonus)
    labels.push(`+${item.boss_damage_bonus} Dano Boss`);
  if (item.streak_protection) labels.push("🛡 Streak Protection");
  return labels;
}
