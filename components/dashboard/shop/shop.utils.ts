import type { ShopItem } from "./shop.types";

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
    key: "xp_scroll",
    name: "Pergaminho XP",
    cost: 60,
    icon: "📜",
    type: "pergaminho",
    effectType: "xp_boost",
    effectValue: 2,
    dailyLimit: 2,
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
    case "mana_elixir":
      return {
        badge: "Energia",
        description: "Recupera mana para continuares a completar missões.",
        effectColor: "text-blue-400",
        effectBg: "bg-blue-400/10",
        effectBorder: "border-blue-400/20",
      };
    case "xp_scroll":
      return {
        badge: "Boost",
        description: "Duplica o XP durante 24 horas.",
        effectColor: "text-yellow-300",
        effectBg: "bg-yellow-400/10",
        effectBorder: "border-yellow-400/20",
      };
    case "iron_sword":
      return {
        badge: "Equipamento",
        description: "Arma base para fortalecer o teu build.",
        effectColor: "text-orange-400",
        effectBg: "bg-orange-400/10",
        effectBorder: "border-orange-400/20",
      };
    case "bronze_shield":
      return {
        badge: "Defesa",
        description: "Mais proteção e presença de tanque.",
        effectColor: "text-emerald-400",
        effectBg: "bg-emerald-400/10",
        effectBorder: "border-emerald-400/20",
      };
    case "luck_potion":
      return {
        badge: "Sorte",
        description: "Um pequeno empurrão místico para dias importantes.",
        effectColor: "text-purple-400",
        effectBg: "bg-purple-400/10",
        effectBorder: "border-purple-400/20",
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
      return "XP ×2 / 24h";
    case "equipment":
      return "Equipável";
    case "luck":
      return "Sorte";
    default:
      return "Item";
  }
}