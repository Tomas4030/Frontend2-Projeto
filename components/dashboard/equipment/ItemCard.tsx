"use client";
// components/dashboard/equipment/ItemCard.tsx
// Card de um item do inventário ou da loja — exibe raridade, buffs, estado

import React from "react";
import { Lock, Sword, Shield, Gem } from "lucide-react";
import type { InventoryItem, Item } from "@/types/equipment";
import { RARITY_CONFIG, SLOT_CONFIG, getBuffLabels } from "@/types/equipment";

// ─── Props ────────────────────────────────────────────────────────────────────

type Mode = "inventory" | "shop";

interface ItemCardProps {
  // Inventory mode: passa InventoryItem
  inventoryItem?: InventoryItem;
  // Shop mode: passa Item + se o player já o tem
  shopItem?: Item;
  alreadyOwned?: boolean;

  mode: Mode;
  onEquip?: (item: Item) => void;
  onUnequip?: (item: Item) => void;
  onBuy?: (item: Item) => void;
  loading?: boolean;
  playerGold?: number;
}

// ─── Ícone por slot ───────────────────────────────────────────────────────────

function SlotIcon({ slot }: { slot: string }) {
  if (slot === "weapon") return <Sword className="w-3 h-3" />;
  if (slot === "armor") return <Shield className="w-3 h-3" />;
  return <Gem className="w-3 h-3" />;
}

// ─── Componente ───────────────────────────────────────────────────────────────

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

  // Estados
  const isEquipped = inventoryItem?.isEquipped ?? false;
  const isLocked = inventoryItem?.isLocked ?? false;
  const canAfford = playerGold >= item.price;

  return (
    <div
      className={`
        relative rounded-xl border p-3 transition-all duration-200
        ${rarity.border} ${rarity.glow}
        ${isLocked ? "opacity-50 grayscale" : "bg-[#120c1f]/80"}
        ${isEquipped ? "ring-1 ring-yellow-400/50" : ""}
      `}
    >
      {/* Badge equipado */}
      {isEquipped && (
        <span className="absolute top-2 right-2 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-yellow-400/20 text-yellow-300 border border-yellow-400/30">
          Equipado
        </span>
      )}

      {/* Topo: ícone + nome + raridade */}
      <div className="flex items-start gap-3 pr-16">
        <div
          className={`
            w-11 h-11 shrink-0 flex items-center justify-center
            rounded-xl border text-2xl leading-none
            ${rarity.border} ${rarity.bg}
          `}
        >
          {isLocked ? "🔒" : item.icon}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-zinc-100 truncate">
            {item.name}
          </p>

          {/* Raridade + Slot */}
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            <span
              className={`text-[10px] font-semibold uppercase tracking-wider ${rarity.color}`}
            >
              {rarity.label}
            </span>
            <span className="text-zinc-600">·</span>
            <span className="flex items-center gap-1 text-[10px] text-zinc-400 uppercase tracking-wider">
              <SlotIcon slot={item.slot} />
              {slotCfg.label}
            </span>
            {item.set_id && (
              <>
                <span className="text-zinc-600">·</span>
                <span className="text-[10px] text-purple-400 uppercase tracking-wider">
                  Set
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Descrição */}
      {item.description && (
        <p className="mt-2 text-[11px] leading-relaxed text-zinc-400">
          {item.description}
        </p>
      )}

      {/* Buffs */}
      {buffs.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {buffs.map((buff) => (
            <span
              key={buff}
              className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${rarity.border} ${rarity.bg} ${rarity.color}`}
            >
              {buff}
            </span>
          ))}
        </div>
      )}

      {/* Condições de desbloqueio */}
      {isLocked && (
        <div className="mt-2 flex items-center gap-1.5 text-[10px] text-zinc-500">
          <Lock className="w-3 h-3" />
          <span>{getLockReason(item)}</span>
        </div>
      )}

      {/* Botão de ação */}
      <div className="mt-3 flex items-center justify-between gap-2">
        {/* Preço (só na loja) */}
        {mode === "shop" && (
          <div className="flex items-center gap-1.5 text-xs font-bold text-yellow-300 border border-yellow-400/20 bg-yellow-400/10 px-2.5 py-1 rounded-lg">
            🪙 {item.price} G
          </div>
        )}

        <div className="ml-auto">
          {mode === "inventory" && !isLocked && (
            <>
              {isEquipped ? (
                <button
                  onClick={() => onUnequip?.(item)}
                  disabled={loading}
                  className="h-8 px-4 rounded-lg text-xs font-bold border border-zinc-500/40 bg-zinc-500/10 text-zinc-300 hover:bg-zinc-500/20 transition-all disabled:opacity-40"
                >
                  {loading ? "..." : "Remover"}
                </button>
              ) : (
                <button
                  onClick={() => onEquip?.(item)}
                  disabled={loading}
                  className="h-8 px-4 rounded-lg text-xs font-bold border border-yellow-400/40 bg-yellow-400 text-black hover:bg-yellow-300 active:scale-95 transition-all disabled:opacity-40"
                >
                  {loading ? "..." : "Equipar"}
                </button>
              )}
            </>
          )}

          {mode === "shop" && (
            <>
              {alreadyOwned ? (
                <span className="text-[11px] text-emerald-400 font-semibold">
                  ✓ Possuis
                </span>
              ) : isLocked ? (
                <span className="text-[11px] text-zinc-500 font-semibold">
                  🔒 Bloqueado
                </span>
              ) : (
                <button
                  onClick={() => onBuy?.(item)}
                  disabled={!canAfford || loading}
                  className={`h-8 px-4 rounded-lg text-xs font-bold transition-all active:scale-95 ${
                    canAfford && !loading
                      ? "border border-yellow-400/40 bg-yellow-400 text-black hover:bg-yellow-300"
                      : "border border-white/10 bg-white/5 text-zinc-600 cursor-not-allowed"
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
  );
}

// ─── Helper: texto da condição de lock ───────────────────────────────────────

function getLockReason(item: Item): string {
  const c = item.unlock_conditions;
  if (!c) return "Bloqueado";
  if (c.min_level) return `Requer nível ${c.min_level}`;
  if (c.tasks_completed)
    return `Requer ${c.tasks_completed} tarefas concluídas`;
  if (c.min_streak) return `Requer streak de ${c.min_streak} dias`;
  if (c.boss_killed) return "Requer matar um boss";
  return "Condição não cumprida";
}
