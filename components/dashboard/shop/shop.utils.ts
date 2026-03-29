import type { ShopItem } from "@/types/shop";

export const items: ShopItem[] = [
  {
    key: "health_potion",
    name: "Poção de Vida",
    cost: 25,
    icon: "🧪",
    type: "poção",
    effectType: "heal_hp",
    effectValue: 35,
    dailyLimit: 3,
  },
  {
    key: "mana_elixir",
    name: "Elixir de Mana",
    cost: 40,
    icon: "🔷",
    type: "poção",
    effectType: "restore_mp",
    effectValue: 30,
    dailyLimit: 5,
  },
  {
    key: "mega_health_potion",
    name: "Poção Mega Vida",
    cost: 50,
    icon: "🧬",
    type: "poção",
    effectType: "heal_hp",
    effectValue: 75,
    dailyLimit: 2,
  },
  {
    key: "mana_regeneration",
    name: "Tônico de Regeneração",
    cost: 45,
    icon: "💚",
    type: "poção",
    effectType: "restore_mp",
    effectValue: 60,
    dailyLimit: 3,
  },
  {
    key: "strength_rune",
    name: "Runa de Força",
    cost: 75,
    icon: "💪",
    type: "runa",
    effectType: "luck",
    effectValue: 1,
    dailyLimit: 1,
  },
  {
    key: "fortune_scroll",
    name: "Pergaminho da Sorte",
    cost: 80,
    icon: "✨",
    type: "pergaminho",
    effectType: "luck",
    effectValue: 1,
    dailyLimit: 1,
  },
];

export function getItemMeta(item: ShopItem) {
  switch (item.key) {
    case "health_potion":
      return {
        badge: "Recuperação",
        description: "Restaura vida para manter o herói em combate.",
        effectColor: "text-rose-400",
        effectBg: "bg-rose-400/10",
        effectBorder: "border-rose-400/20",
      };
    case "mega_health_potion":
      return {
        badge: "Recuperação+",
        description: "Restaura uma quantidade massiva de vida.",
        effectColor: "text-red-400",
        effectBg: "bg-red-400/10",
        effectBorder: "border-red-400/20",
      };
    case "mana_elixir":
      return {
        badge: "Energia",
        description: "Recupera mana para continuares a completar missões.",
        effectColor: "text-blue-400",
        effectBg: "bg-blue-400/10",
        effectBorder: "border-blue-400/20",
      };
    case "mana_regeneration":
      return {
        badge: "Energia+",
        description: "Recupera uma quantidade superior de mana.",
        effectColor: "text-cyan-400",
        effectBg: "bg-cyan-400/10",
        effectBorder: "border-cyan-400/20",
      };
    case "xp_scroll":
      return {
        badge: "Boost",
        description: "Duplica o XP durante 30 minutos.",
        effectColor: "text-yellow-300",
        effectBg: "bg-yellow-400/10",
        effectBorder: "border-yellow-400/20",
      };
    case "strength_rune":
      return {
        badge: "Poder",
        description: "Aumenta significativamente a sorte em combates.",
        effectColor: "text-purple-400",
        effectBg: "bg-purple-400/10",
        effectBorder: "border-purple-400/20",
      };
    case "fortune_scroll":
      return {
        badge: "Sorte",
        description: "Multiplica as recompensas da próxima missão.",
        effectColor: "text-amber-300",
        effectBg: "bg-amber-400/10",
        effectBorder: "border-amber-400/20",
      };
    default:
      return {
        badge: "Item",
        description: "Item especial da loja.",
        effectColor: "text-yellow-300",
        effectBg: "bg-yellow-400/10",
        effectBorder: "border-yellow-400/20",
      };
  }
}

export function getEffectLabel(item: ShopItem) {
  switch (item.effectType) {
    case "heal_hp":
      return `+${item.effectValue} HP`;
    case "restore_mp":
      return `+${item.effectValue} MP`;
    case "xp_boost":
      return "XP ×2 / 30min";
    case "equipment":
      return "Equipável";
    case "luck":
      return "Sorte";
    default:
      return "Item";
  }
}

export function formatDuration(ms: number): string {
  if (ms <= 0) return "00:00:00";

  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
}

export function getTodayRange(): { start: string; end: string } {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

export function getTimeUntilMidnight(): number {
  const now = new Date();
  const nextMidnight = new Date();
  nextMidnight.setDate(now.getDate() + 1);
  nextMidnight.setHours(0, 0, 0, 0);

  return nextMidnight.getTime() - now.getTime();
}
