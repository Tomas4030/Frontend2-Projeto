// Mana regeneration system
// Tracks and applies time-based mana restoration from shop items

import type { Character } from "@/components/dashboard/dashboardUtils";

export type ManaBoost = {
  id: string;
  character_id: string;
  boost_type: "restore_mp" | "regeneration";
  amount: number; // Mana to restore or regenerate per interval
  duration_minutes: number; // How long the effect lasts
  interval_minutes: number; // How often to apply (default 60 for hourly)
  created_at: string;
  expires_at: string;
};

// Calculate total mana restoration from all active boosts
export function calculateActiveManaBoosts(boosts: ManaBoost[]): {
  totalRestoration: number;
  activeBoosts: ManaBoost[];
} {
  const now = new Date();
  const activeBoosts = boosts.filter(
    (boost) => new Date(boost.expires_at) > now,
  );

  // Sum up all restoration from active boosts
  const totalRestoration = activeBoosts.reduce((sum, boost) => {
    if (boost.boost_type === "restore_mp") {
      return sum + boost.amount;
    }
    return sum;
  }, 0);

  return { totalRestoration, activeBoosts };
}

// Apply mana restoration and return updated character
export function applyManaRestoration(
  character: Character,
  amount: number,
): Character {
  const newMp = Math.min(character.max_mp, character.mp + amount);
  return {
    ...character,
    mp: newMp,
  };
}

// Check if mana needs to be regenerated (hourly from boosts)
export function shouldRegenerate(lastRegeneration: string | null): boolean {
  if (!lastRegeneration) return true;

  const lastRegen = new Date(lastRegeneration);
  const now = new Date();
  const minutesPassed = (now.getTime() - lastRegen.getTime()) / (1000 * 60);

  return minutesPassed >= 60; // Regenerate every hour
}

// Format remaining time for a mana boost
export function formatBoostDuration(expiresAt: string): string {
  const now = new Date();
  const expiration = new Date(expiresAt);
  const diff = expiration.getTime() - now.getTime();

  if (diff <= 0) return "Expirado";

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}
