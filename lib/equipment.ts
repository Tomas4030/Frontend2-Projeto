// lib/equipment.ts
// Lógica principal do sistema de equipamento
// Compatível com o Character de dashboardUtils.ts e o createClient de @/lib/supabase/client

import { createClient } from "@/lib/supabase/client";
import type { Character } from "@/components/dashboard/dashboardUtils";
import type {
  Item,
  EquipmentSlots,
  InventoryItem,
  SetBonus,
  ActiveSetBonus,
  FinalStats,
  ItemBuffs,
  Slot,
  RpcResponse,
  UnlockConditions,
} from "@/types/equipment";

const DEFAULT_SHOP_ITEMS: Item[] = [
  {
    id: "fallback_weapon_wood_sword",
    name: "Espada de Madeira",
    description: "Leve e confiavel para comecar a aventura.",
    slot: "weapon",
    rarity: "common",
    price: 80,
    icon: "🗡️",
    unlock_conditions: {},
    strength_bonus: 2,
  },
  {
    id: "fallback_armor_leather",
    name: "Armadura de Couro",
    description: "Protecao basica para batalhas do dia a dia.",
    slot: "armor",
    rarity: "common",
    price: 110,
    icon: "🥋",
    unlock_conditions: {},
    hp_bonus: 12,
  },
  {
    id: "fallback_amulet_novice",
    name: "Amuleto do Aprendiz",
    description: "Canaliza energia para acelerar o progresso.",
    slot: "amulet",
    rarity: "uncommon",
    price: 160,
    icon: "📿",
    unlock_conditions: {},
    intelligence_bonus: 3,
    xp_multiplier: 1.1,
  },
  {
    id: "fallback_weapon_crystal_blade",
    name: "Lamina de Cristal",
    description: "Ataques precisos com bonus contra bosses.",
    slot: "weapon",
    rarity: "rare",
    price: 320,
    icon: "⚔️",
    unlock_conditions: { min_level: 5 },
    strength_bonus: 6,
    boss_damage_bonus: 8,
  },
  {
    id: "fallback_armor_guardian_mail",
    name: "Cota do Guardiao",
    description: "Aumenta a resistencia e a consistencia em lutas longas.",
    slot: "armor",
    rarity: "rare",
    price: 360,
    icon: "🛡️",
    unlock_conditions: { tasks_completed: 15 },
    hp_bonus: 28,
    mp_bonus: 8,
  },
  {
    id: "fallback_amulet_royal_luck",
    name: "Amuleto da Sorte Real",
    description: "Feito para quem quer farmar gold mais rapido.",
    slot: "amulet",
    rarity: "epic",
    price: 520,
    icon: "💠",
    unlock_conditions: { min_streak: 5 },
    gold_multiplier: 1.25,
    streak_protection: true,
  },
];

function isMissingTableError(
  error: { code?: string; message?: string },
  table: string,
): boolean {
  const message = error.message ?? "";
  return (
    error.code === "PGRST205" ||
    message.includes(
      `Could not find the table 'public.${table}' in the schema cache`,
    )
  );
}

// ─── Fetch: equipamento atual do character ────────────────────────────────────

export async function getPlayerEquipment(
  characterId: string,
): Promise<EquipmentSlots> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("player_equipment")
    .select("slot, items(*)")
    .eq("character_id", characterId);

  if (error) throw new Error("Erro ao carregar equipamento: " + error.message);

  const slots: EquipmentSlots = { weapon: null, armor: null, amulet: null };
  for (const row of data ?? []) {
    // @ts-ignore – Supabase join retorna items como objeto
    slots[row.slot as Slot] = row.items as Item;
  }
  return slots;
}

// ─── Fetch: inventário completo do character ──────────────────────────────────

export async function getPlayerInventory(
  characterId: string,
  equipment: EquipmentSlots,
  character: Character,
): Promise<InventoryItem[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("player_inventory")
    .select("id, acquired_at, items(*)")
    .eq("character_id", characterId)
    .order("acquired_at", { ascending: false });

  if (error) {
    if (isMissingTableError(error, "player_inventory")) {
      console.warn(
        "Tabela player_inventory nao encontrada; inventario iniciado vazio.",
      );
      return [];
    }
    throw new Error("Erro ao carregar inventário: " + error.message);
  }

  const equippedIds = new Set(
    Object.values(equipment)
      .filter(Boolean)
      .map((i) => i!.id),
  );

  return (data ?? []).map((row: any) => ({
    id: row.id,
    item: row.items as Item,
    acquired_at: row.acquired_at,
    isEquipped: equippedIds.has(row.items.id),
    isLocked: !checkUnlock(row.items.unlock_conditions ?? {}, character),
  }));
}

// ─── Fetch: todos os itens da loja de equipamento ────────────────────────────

export async function getEquipmentShopItems(): Promise<Item[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("items")
    .select("*")
    .order("price", { ascending: true });

  if (error) {
    if (isMissingTableError(error, "items")) {
      console.warn("Tabela items nao encontrada; usando loja fallback local.");
      return DEFAULT_SHOP_ITEMS;
    }
    throw new Error("Erro ao carregar loja: " + error.message);
  }
  return (data ?? []) as Item[];
}

// ─── Fetch: set bonuses ───────────────────────────────────────────────────────

export async function getSetBonuses(): Promise<SetBonus[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from("set_bonuses").select("*");
  if (error) {
    const isMissingTable = isMissingTableError(error, "set_bonuses");

    if (isMissingTable) {
      console.warn(
        "Tabela set_bonuses nao encontrada; continuando sem bonus de set.",
      );
      return [];
    }

    throw new Error("Erro ao carregar set bonuses: " + error.message);
  }
  return (data ?? []) as SetBonus[];
}

// ─── Ação: equipar item (via RPC) ────────────────────────────────────────────

export async function equipItem(
  characterId: string,
  itemId: string,
): Promise<RpcResponse> {
  const supabase = createClient();

  const { data, error } = await supabase.rpc("equip_item", {
    p_character_id: characterId,
    p_item_id: itemId,
  });

  if (error) return { success: false, message: error.message };
  return data as RpcResponse;
}

// ─── Ação: desequipar item (via RPC) ─────────────────────────────────────────

export async function unequipItem(
  characterId: string,
  slot: Slot,
): Promise<RpcResponse> {
  const supabase = createClient();

  const { data, error } = await supabase.rpc("unequip_item", {
    p_character_id: characterId,
    p_slot: slot,
  });

  if (error) return { success: false, message: error.message };
  return data as RpcResponse;
}

// ─── Ação: comprar item de equipamento (via RPC) ──────────────────────────────

export async function buyEquipmentItem(
  characterId: string,
  itemId: string,
): Promise<RpcResponse> {
  const supabase = createClient();

  const { data, error } = await supabase.rpc("buy_equipment_item", {
    p_character_id: characterId,
    p_item_id: itemId,
  });

  if (error) return { success: false, message: error.message };
  return data as RpcResponse;
}

// ─── Cálculo: stats finais ────────────────────────────────────────────────────

export function calculateFinalStats(
  character: Character,
  equipment: EquipmentSlots,
  setBonus: SetBonus[],
): FinalStats {
  const equippedItems = Object.values(equipment).filter(Boolean) as Item[];

  // 1. Soma dos buffs dos itens equipados
  const itemBonuses = sumItemBonuses(equippedItems);

  // 2. Set bonuses ativos
  const activeSetBonuses = getActiveSetBonuses(equippedItems, setBonus);
  const setBonusTotal = sumSetBonuses(activeSetBonuses);

  return {
    final_forca:
      character.forca +
      (itemBonuses.strength_bonus ?? 0) +
      (setBonusTotal.strength_bonus ?? 0),

    final_inteligencia:
      character.inteligencia +
      (itemBonuses.intelligence_bonus ?? 0) +
      (setBonusTotal.intelligence_bonus ?? 0),

    final_agilidade:
      character.agilidade +
      (itemBonuses.agility_bonus ?? 0) +
      (setBonusTotal.agility_bonus ?? 0),

    final_fe:
      character.fe +
      (itemBonuses.faith_bonus ?? 0) +
      (setBonusTotal.faith_bonus ?? 0),

    final_hp_max:
      character.max_hp +
      (itemBonuses.hp_bonus ?? 0) +
      (setBonusTotal.hp_bonus ?? 0),

    final_mp_max:
      character.max_mp +
      (itemBonuses.mp_bonus ?? 0) +
      (setBonusTotal.mp_bonus ?? 0),

    final_xp_multiplier:
      (itemBonuses.xp_multiplier ?? 1.0) * (setBonusTotal.xp_multiplier ?? 1.0),

    final_gold_multiplier:
      (itemBonuses.gold_multiplier ?? 1.0) *
      (setBonusTotal.gold_multiplier ?? 1.0),

    final_boss_damage_bonus:
      (itemBonuses.boss_damage_bonus ?? 0) +
      (setBonusTotal.boss_damage_bonus ?? 0),

    has_streak_protection: equippedItems.some((i) => i.streak_protection),

    active_set_bonuses: activeSetBonuses,
  };
}

// ─── Interno: soma buffs de uma lista de itens ────────────────────────────────

function sumItemBonuses(items: Item[]): Partial<ItemBuffs> {
  return items.reduce<Partial<ItemBuffs>>(
    (acc, item) => ({
      strength_bonus: (acc.strength_bonus ?? 0) + (item.strength_bonus ?? 0),
      intelligence_bonus:
        (acc.intelligence_bonus ?? 0) + (item.intelligence_bonus ?? 0),
      agility_bonus: (acc.agility_bonus ?? 0) + (item.agility_bonus ?? 0),
      faith_bonus: (acc.faith_bonus ?? 0) + (item.faith_bonus ?? 0),
      hp_bonus: (acc.hp_bonus ?? 0) + (item.hp_bonus ?? 0),
      mp_bonus: (acc.mp_bonus ?? 0) + (item.mp_bonus ?? 0),
      xp_multiplier: (acc.xp_multiplier ?? 1.0) * (item.xp_multiplier ?? 1.0),
      gold_multiplier:
        (acc.gold_multiplier ?? 1.0) * (item.gold_multiplier ?? 1.0),
      boss_damage_bonus:
        (acc.boss_damage_bonus ?? 0) + (item.boss_damage_bonus ?? 0),
    }),
    {},
  );
}

// ─── Interno: calcula set bonuses ativos ─────────────────────────────────────

function getActiveSetBonuses(
  equippedItems: Item[],
  setBonus: SetBonus[],
): ActiveSetBonus[] {
  // Conta peças por set_id
  const setPieceCounts: Record<string, number> = {};
  for (const item of equippedItems) {
    if (item.set_id) {
      setPieceCounts[item.set_id] = (setPieceCounts[item.set_id] ?? 0) + 1;
    }
  }

  const active: ActiveSetBonus[] = [];
  for (const [set_id, count] of Object.entries(setPieceCounts)) {
    const activeBonuses = setBonus
      .filter((sb) => sb.set_id === set_id && sb.pieces_required <= count)
      .map((sb) => sb.bonus_json);

    if (activeBonuses.length > 0) {
      active.push({
        set_id,
        pieces_equipped: count,
        bonuses_active: activeBonuses,
      });
    }
  }
  return active;
}

// ─── Interno: soma set bonuses ────────────────────────────────────────────────

function sumSetBonuses(activeSetBonuses: ActiveSetBonus[]): Partial<ItemBuffs> {
  return activeSetBonuses
    .flatMap((sb) => sb.bonuses_active)
    .reduce<Partial<ItemBuffs>>(
      (acc, bonus) => ({
        strength_bonus: (acc.strength_bonus ?? 0) + (bonus.strength_bonus ?? 0),
        intelligence_bonus:
          (acc.intelligence_bonus ?? 0) + (bonus.intelligence_bonus ?? 0),
        agility_bonus: (acc.agility_bonus ?? 0) + (bonus.agility_bonus ?? 0),
        faith_bonus: (acc.faith_bonus ?? 0) + (bonus.faith_bonus ?? 0),
        hp_bonus: (acc.hp_bonus ?? 0) + (bonus.hp_bonus ?? 0),
        mp_bonus: (acc.mp_bonus ?? 0) + (bonus.mp_bonus ?? 0),
        xp_multiplier:
          (acc.xp_multiplier ?? 1.0) * (bonus.xp_multiplier ?? 1.0),
        gold_multiplier:
          (acc.gold_multiplier ?? 1.0) * (bonus.gold_multiplier ?? 1.0),
        boss_damage_bonus:
          (acc.boss_damage_bonus ?? 0) + (bonus.boss_damage_bonus ?? 0),
      }),
      {},
    );
}

// ─── Verificação: unlock conditions ──────────────────────────────────────────

export function checkUnlock(
  conditions: UnlockConditions,
  character: Character,
): boolean {
  if (!conditions || Object.keys(conditions).length === 0) return true;

  if (
    conditions.min_level !== undefined &&
    character.level < conditions.min_level
  )
    return false;

  if (
    conditions.tasks_completed !== undefined &&
    (character.tasks_completed ?? 0) < conditions.tasks_completed
  )
    return false;

  if (
    conditions.min_streak !== undefined &&
    (character.streak_days ?? 0) < conditions.min_streak
  )
    return false;

  // boss_killed e challenge_id: implementar conforme a lógica do projeto
  // ex: if (conditions.boss_killed && !character.boss_killed) return false;

  return true;
}

// ─── Integração com completeTask: aplica gold_multiplier ─────────────────────
// Chamar isto em vez de getRandomGoldReward quando há equipamento ativo

export function applyGoldMultiplier(
  baseGold: number,
  finalStats: FinalStats,
): number {
  return Math.round(baseGold * finalStats.final_gold_multiplier);
}

// ─── Integração com completeTask: aplica xp_multiplier ───────────────────────

export function applyXpMultiplier(
  baseXp: number,
  finalStats: FinalStats,
): number {
  return Math.round(baseXp * finalStats.final_xp_multiplier);
}
