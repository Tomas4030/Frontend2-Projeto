"use client";

import { Coins } from "lucide-react";

type Props = {
  gold: number;
};

export default function ItemShopHeader({ gold }: Props) {
  return (
    <div className="border-b border-white/10 bg-linear-to-r from-yellow-400/8 via-transparent to-violet-400/8 px-6 py-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">
            Merchant Zone
          </p>
          <h3 className="mt-0.5 font-['Press_Start_2P',monospace] text-sm leading-snug text-yellow-300">
            ◆ Loja de Itens
          </h3>
        </div>

        <div className="flex items-center gap-2.5 rounded-xl border border-yellow-400/25 bg-yellow-400/10 px-4 py-2 whitespace-nowrap sm:px-6">
          <Coins className="h-4 w-4 shrink-0 text-yellow-400" />
          <span className="text-xs font-bold leading-none text-yellow-200">
            {gold} G
          </span>
        </div>
      </div>
    </div>
  );
}