// Shop system utilities
// Handles daily reset logic, timers, and item state management

/**
 * Calculate time remaining until the daily shop reset (midnight)
 */
export function getTimeUntilReset(): {
  hours: number;
  minutes: number;
  seconds: number;
  totalMinutes: number;
  formatted: string;
} {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setHours(24, 0, 0, 0);

  const diff = tomorrow.getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  const totalMinutes = Math.floor(diff / (1000 * 60));

  const formatted = `${hours}h ${minutes}m ${seconds}s`;

  return { hours, minutes, seconds, totalMinutes, formatted };
}

/**
 * Get start of day (midnight) for a given date
 */
export function getStartOfDay(date: Date = new Date()): Date {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
}

/**
 * Get end of day (23:59:59) for a given date
 */
export function getEndOfDay(date: Date = new Date()): Date {
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return end;
}

/**
 * Item state type for shop display
 */
export type ItemState = "available" | "limited" | "exhausted" | "no_gold";

/**
 * Determine the state of a shop item based on purchases and gold
 */
export function getItemState(
  boughtToday: number,
  dailyLimit: number | undefined,
  hasGold: boolean,
): ItemState {
  if (!hasGold) return "no_gold";
  if (dailyLimit === undefined) return "available";
  if (boughtToday >= dailyLimit) return "exhausted";
  if (boughtToday > 0) return "limited";
  return "available";
}

/**
 * Get state information for UI display
 */
export function getStateInfo(
  state: ItemState,
  boughtToday: number,
  dailyLimit?: number,
) {
  switch (state) {
    case "available":
      return {
        label: "Disponível",
        color: "text-emerald-400",
        bg: "bg-emerald-400/10",
        border: "border-emerald-400/30",
        icon: "✓",
      };
    case "limited":
      return {
        label: `${boughtToday}/${dailyLimit} hoje`,
        color: "text-yellow-400",
        bg: "bg-yellow-400/10",
        border: "border-yellow-400/30",
        icon: "⏱",
      };
    case "exhausted":
      return {
        label: "Esgotado (volta amanhã)",
        color: "text-rose-400",
        bg: "bg-rose-400/10",
        border: "border-rose-400/30",
        icon: "✕",
      };
    case "no_gold":
      return {
        label: "Gold insuficiente",
        color: "text-zinc-400",
        bg: "bg-zinc-400/10",
        border: "border-zinc-400/30",
        icon: "⚠",
      };
  }
}

/**
 * Format remaining limit message
 */
export function formatRemainingLimit(
  boughtToday: number,
  dailyLimit: number | undefined,
): string {
  if (dailyLimit === undefined) return "";
  const remaining = Math.max(0, dailyLimit - boughtToday);
  if (remaining === 0) return "Limite atingido";
  if (remaining === dailyLimit) return `${dailyLimit} disponíveis`;
  return `${remaining} de ${dailyLimit} restantes`;
}

/**
 * Check if item should show a cooldown timer
 */
export function shouldShowCooldownTimer(state: ItemState): boolean {
  return state === "exhausted" || state === "limited";
}
