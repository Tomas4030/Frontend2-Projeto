"use client";

import type { ShopItem } from "./shop.types";
import { getEffectLabel, getItemMeta } from "./shop.utils";

type Props = {
  item: ShopItem;
  gold: number;
  boughtToday: number;
  isLoading: boolean;
  onBuy: (item: ShopItem) => void;
};

export default function ShopItemCard({
  item,
  gold,
  boughtToday,
  isLoading,
  onBuy,
}: Props) {
  const meta = getItemMeta(item);

  const reachedDailyLimit =
    item.dailyLimit !== undefined && boughtToday >= item.dailyLimit;

  const canBuy = gold >= item.cost && !reachedDailyLimit;

  return (
    <div
      className={`rounded-xl border p-4 transition-all duration-200 ${
        canBuy
          ? "border-white/10 bg-white/3 hover:border-yellow-400/25 hover:bg-white/5"
          : "border-white/5 bg-white/2 opacity-50"
      }`}
    >
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black/20 text-2xl leading-none">
          {item.icon}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-zinc-100">
            {item.name}
          </p>
          <p className="mt-1 text-[10px] uppercase tracking-wider text-zinc-500">
            {meta.badge} · {item.type}
          </p>
        </div>

        <div className="shrink-0 rounded-lg border border-yellow-400/20 bg-yellow-400/10 px-3 py-1.5 text-xs font-bold text-yellow-300">
          {item.cost} G
        </div>
      </div>

      <p className="mt-3 text-[12px] leading-relaxed text-zinc-400">
        {meta.description}
      </p>

      <div className="mt-3.5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          <span
            className={`rounded-full border ${meta.effectBorder} ${meta.effectBg} px-2 py-1 text-[10px] font-semibold ${meta.effectColor}`}
          >
            {getEffectLabel(item)}
          </span>

          {item.dailyLimit !== undefined && (
            <span
              className={`rounded-full border px-2 py-1 text-[10px] font-semibold ${
                reachedDailyLimit
                  ? "border-rose-400/20 bg-rose-400/10 text-rose-400"
                  : "border-white/10 bg-white/5 text-zinc-400"
              }`}
            >
              {reachedDailyLimit
                ? "Esgotado"
                : `${boughtToday}/${item.dailyLimit} hoje`}
            </span>
          )}
        </div>

        <button
          onClick={() => onBuy(item)}
          disabled={!canBuy || isLoading}
          className={`h-9 shrink-0 rounded-lg px-5 text-xs font-bold transition-all duration-150 ${
            canBuy && !isLoading
              ? "border border-yellow-400/40 bg-yellow-400 text-black hover:bg-yellow-300 active:scale-95"
              : "cursor-not-allowed border border-white/10 bg-white/5 text-zinc-600"
          }`}
        >
          {isLoading ? (
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-black/30 border-t-black" />
              A comprar…
            </span>
          ) : canBuy ? (
            "Comprar"
          ) : (
            "Indisponível"
          )}
        </button>
      </div>
    </div>
  );
}