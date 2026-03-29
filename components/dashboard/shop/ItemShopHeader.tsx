"use client";

import { Coins, RefreshCw, Clock } from "lucide-react";

type Props = {
  gold: number;
  resetTime: string;
  xpBoostRemainingTime: string;
  isRefreshing: boolean;
  onRefresh: () => void;
};

export default function ItemShopHeader({
  gold,
  resetTime,
  xpBoostRemainingTime,
  isRefreshing,
  onRefresh,
}: Props) {
  return (
    <div className="border-b border-white/10 bg-linear-to-r from-yellow-400/8 via-transparent to-violet-400/8 px-6 py-4">
      <div className="flex flex-col gap-3">
        <div className="grid items-center justify-between gap-4">
          <div>
            <h3 className="mt-0.5 font-['Press_Start_2P',monospace] text-[15px] leading-snug text-yellow-300">
              ◆ Loja de Itens
            </h3>
          </div>

          <div className="flex flex-row gap-2 shrink-0">
            <div className="flex items-center whitespace-nowrap gap-2.5 rounded-xl border border-yellow-400/25 bg-yellow-400/10 px-6 py-2">
              <Coins className="h-4 w-4 shrink-0 text-yellow-400" />
              <span className="text-xs font-bold leading-none text-yellow-200">
                {gold} G
              </span>
            </div>

            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1 text-[10px] font-bold uppercase text-zinc-400 transition-all hover:border-white/30 hover:text-zinc-300 disabled:opacity-50"
              title="Recarregar compras"
            >
              <RefreshCw
                className={`h-3 w-3 ${isRefreshing ? "animate-spin" : ""}`}
              />
              Atualizar
            </button>
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
            <Clock className="h-3 w-3 shrink-0 text-zinc-500" />
            <span className="text-[10px] uppercase tracking-widest text-zinc-500">
              Reset em:{" "}
              <span className="font-bold text-yellow-300">{resetTime}</span>
            </span>
          </div>

          {xpBoostRemainingTime && (
            <div className="flex items-center gap-2 rounded-lg border border-blue-400/25 bg-blue-400/10 px-3 py-2 animate-pulse">
              <span className="inline-block h-2 w-2 rounded-full bg-blue-400"></span>
              <span className="text-[10px] uppercase tracking-widest text-blue-300 font-semibold">
                XP ×2 Ativo:{" "}
                <span className="font-bold text-blue-200">
                  {xpBoostRemainingTime}
                </span>
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
