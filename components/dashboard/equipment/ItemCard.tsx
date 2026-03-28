"use client";

import React from "react";
import { Lock, Sword, Shield, Gem, Coins } from "lucide-react";
import type { InventoryItem, Item } from "@/types/equipment";
import { RARITY_CONFIG, SLOT_CONFIG, getBuffLabels } from "@/types/equipment";

type Mode = "inventory" | "shop";

interface ItemCardProps {
  inventoryItem?: InventoryItem;
  shopItem?: Item;
  alreadyOwned?: boolean;
  mode: Mode;
  onEquip?: (item: Item) => void;
  onUnequip?: (item: Item) => void;
  onBuy?: (item: Item) => void;
  loading?: boolean;
  playerGold?: number;
}

function SlotIcon({ slot }: { slot: string }) {
  if (slot === "weapon") return <Sword className="h-3.5 w-3.5 text-zinc-300" />;
  if (slot === "armor") return <Shield className="h-3.5 w-3.5 text-zinc-300" />;
  return <Gem className="h-3.5 w-3.5 text-zinc-300" />;
}

export default function ItemCard({
  inventoryItem,
  shopItem,
  alreadyOwned = false,
  mode,
  onEquip,
  onUnequip,
  onBuy,
  loading = false,
  playerGold = 0,
}: ItemCardProps) {
  const item: Item = (inventoryItem?.item ?? shopItem)!;
  if (!item) return null;

  const rarity = RARITY_CONFIG[item.rarity];
  const slotCfg = SLOT_CONFIG[item.slot];
  const buffs = getBuffLabels(item);

  const isEquipped = inventoryItem?.isEquipped ?? false;
  const isLocked = inventoryItem?.isLocked ?? false;
  const canAfford = playerGold >= item.price;

  return (
    <div className="rounded-xl border border-white/10 bg-[#090118] px-2.5 py-2.5 transition hover:border-white/15">
      <div className="flex items-start gap-2.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5">
          {isLocked ? (
            <Lock className="h-3.5 w-3.5 text-zinc-500" />
          ) : item.icon ? (
            <span className="text-base">{item.icon}</span>
          ) : (
            <SlotIcon slot={item.slot} />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="truncate pr-2 text-[12px] font-black leading-tight text-white">
                {item.name}
              </h3>

              <div className="mt-1 flex flex-wrap items-center gap-x-1 gap-y-0.5 text-[8.5px] font-bold uppercase tracking-[0.1em] text-zinc-400">
                <span className={rarity.color}>{rarity.label}</span>
                <span className="text-zinc-600">•</span>
                <span>{slotCfg.label}</span>
                {item.set_id && (
                  <>
                    <span className="text-zinc-600">•</span>
                    <span>Set</span>
                  </>
                )}
              </div>
            </div>

            {isEquipped && (
              <span className="inline-flex h-6 items-center rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 text-[8px] font-bold uppercase tracking-[0.1em] text-emerald-300">
                Equipado
              </span>
            )}
          </div>

          {item.description && (
            <p className="mt-1.5 text-[10px] leading-snug text-zinc-300">
              {item.description}
            </p>
          )}

          {buffs.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {buffs.map((buff) => (
                <span
                  key={buff}
                  className="rounded-full border border-cyan-400/25 bg-cyan-400/10 px-1.5 py-0.5 text-[9px] font-bold text-cyan-300"
                >
                  {buff}
                </span>
              ))}
            </div>
          )}

          {isLocked && (
            <div className="mt-1.5 rounded-lg border border-rose-400/25 bg-rose-400/10 px-2 py-1 text-[10px] font-bold text-rose-300">
              {getLockReason(item)}
            </div>
          )}

          <div className="mt-2.5 flex items-center justify-between gap-2">
            {mode === "shop" ? (
              <div className="inline-flex h-7 items-center gap-1 rounded-lg border border-yellow-400/20 bg-yellow-400/10 px-2 text-[10px] font-extrabold text-yellow-300">
                <Coins className="h-3 w-3" />
                {item.price} G
              </div>
            ) : (
              <div />
            )}

            <div className="ml-auto">
              {mode === "inventory" && !isLocked && (
                <>
                  {isEquipped ? (
                    <button
                      onClick={() => onUnequip?.(item)}
                      disabled={loading}
                      className="h-7 rounded-lg border border-zinc-500/40 bg-zinc-500/10 px-2.5 text-[10px] font-bold text-zinc-300 transition hover:bg-zinc-500/20 disabled:opacity-40"
                    >
                      {loading ? "..." : "Remover"}
                    </button>
                  ) : (
                    <button
                      onClick={() => onEquip?.(item)}
                      disabled={loading}
                      className="h-7 rounded-lg border border-yellow-400/40 bg-yellow-400 px-2.5 text-[10px] font-extrabold text-black transition hover:bg-yellow-300 disabled:opacity-40"
                    >
                      {loading ? "..." : "Equipar"}
                    </button>
                  )}
                </>
              )}

              {mode === "shop" && (
                <>
                  {alreadyOwned ? (
                    <span className="inline-flex h-7 items-center rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-2.5 text-[10px] font-bold text-emerald-300">
                      Possuis
                    </span>
                  ) : isLocked ? (
                    <span className="inline-flex h-7 items-center rounded-lg border border-white/10 bg-white/5 px-2.5 text-[10px] font-bold text-zinc-500">
                      Bloqueado
                    </span>
                  ) : (
                    <button
                      onClick={() => onBuy?.(item)}
                      disabled={!canAfford || loading}
                      className={`h-7 rounded-lg px-2.5 text-[10px] font-extrabold transition ${
                        canAfford && !loading
                          ? "border border-yellow-400/40 bg-yellow-400 text-black hover:bg-yellow-300"
                          : "cursor-not-allowed border border-white/10 bg-white/5 text-zinc-600"
                      }`}
                    >
                      {loading ? "..." : canAfford ? "Comprar" : "Sem gold"}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getLockReason(item: Item): string {
  const c = item.unlock_conditions;
  if (!c) return "Bloqueado";
  if (c.min_level) return `Requer nível ${c.min_level}`;
  if (c.tasks_completed) return `Requer ${c.tasks_completed} tarefas`;
  if (c.min_streak) return `Requer streak ${c.min_streak} dias`;
  if (c.boss_killed) return "Requer matar um boss";
  return "Condição não cumprida";
}
