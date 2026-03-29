import type { Character } from "@/types/dashboard";

export type ManaBoost = {
  id: string;
  character_id: string;
  boost_type: "restore_mp" | "regeneration";
  amount: number;
  duration_minutes: number;
  interval_minutes: number;
  created_at: string;
  expires_at: string;
};

export function calculateActiveManaBoosts(boosts: ManaBoost[]): {
  totalRestoration: number;
  activeBoosts: ManaBoost[];
} {
  const now = new Date();
  const activeBoosts = boosts.filter(
    (boost) => new Date(boost.expires_at) > now,
  );

  const totalRestoration = activeBoosts.reduce((sum, boost) => {
    if (boost.boost_type === "restore_mp") {
      return sum + boost.amount;
    }
    return sum;
  }, 0);

  return { totalRestoration, activeBoosts };
}

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

export function shouldRegenerate(lastRegeneration: string | null): boolean {
  if (!lastRegeneration) return true;

  const lastRegen = new Date(lastRegeneration);
  const now = new Date();
  const minutesPassed = (now.getTime() - lastRegen.getTime()) / (1000 * 60);

  return minutesPassed >= 60;
}

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
