"use client";

import { getEffectLabel, getItemMeta } from "./shop.utils";

import type { ShopItem } from "@/types/shop";

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
      className={`rounded-xl border p-3 transition-all duration-200 ${
        canBuy
          ? "border-yellow-400/20 bg-[#181325]/95 hover:border-yellow-400/35 hover:bg-[#1c1630]"
          : "border-white/10 bg-[#151120]/80 opacity-70"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-1 gap-2.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black/20 text-base leading-none">
            {item.icon}
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="line-clamp-2 text-xs font-semibold leading-snug text-zinc-100">
              {item.name}
            </h3>

            <p className="mt-0.5 text-[9px] uppercase tracking-[0.14em] text-zinc-500">
              {meta.badge} · {item.type}
            </p>
          </div>
        </div>
      </div>

      <p className="mt-3 text-[11px] leading-5 text-zinc-400 line-clamp-3">
        {meta.description}
      </p>

      <div className="mt-3 flex items-center gap-2 flex-wrap">
        <span
          className={`flex items-center justify-center h-6 rounded-full border px-2 text-[9px] font-semibold ${meta.effectBorder} ${meta.effectBg} ${meta.effectColor}`}
        >
          {getEffectLabel(item)}
        </span>

        {item.dailyLimit !== undefined && (
          <span
            className={`flex items-center justify-center h-6 rounded-full border px-2 text-[9px] font-semibold ${
              reachedDailyLimit
                ? "border-rose-400/20 bg-rose-400/10 text-rose-400"
                : "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
            }`}
          >
            {reachedDailyLimit
              ? `${item.dailyLimit}/${item.dailyLimit}`
              : `${boughtToday}/${item.dailyLimit}`}
          </span>
        )}

        <div className="flex items-center justify-center h-6 rounded-full border border-yellow-400/25 bg-yellow-400/10 px-2.5 text-[9px] font-bold text-yellow-300">
          {item.cost} G
        </div>
      </div>

      <div className="mt-3">
        <button
          onClick={() => onBuy(item)}
          disabled={!canBuy || isLoading}
          className={`flex h-9 w-full items-center justify-center rounded-xl px-4 text-xs font-bold transition-all duration-150 ${
            canBuy && !isLoading
              ? "border border-yellow-400/40 bg-yellow-400 text-black hover:bg-yellow-300 active:scale-[0.98]"
              : "cursor-not-allowed border border-white/10 bg-white/5 text-zinc-600"
          }`}
        >
          {isLoading ? (
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-black/30 border-t-black" />
              A comprar...
            </span>
          ) : canBuy ? (
            "Comprar"
          ) : reachedDailyLimit ? (
            "Esgotado"
          ) : (
            "Indisponível"
          )}
        </button>
      </div>
    </div>
  );
}
