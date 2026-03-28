"use client";
// components/dashboard/equipment/InventorySheet.tsx
// Sheet deslizante (Shadcn) com o inventário do jogador e a loja de equipamento

import React, { useEffect, useState, useCallback } from "react";
import { Backpack, Store, RefreshCw } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import ItemCard from "./ItemCard";
import {
  getPlayerInventory,
  getPlayerEquipment,
  getEquipmentShopItems,
  equipItem,
  unequipItem,
  buyEquipmentItem,
} from "@/lib/equipment";
import type {
  EquipmentSlots,
  InventoryItem,
  Item,
  Slot,
} from "@/types/equipment";
import type { Character } from "@/components/dashboard/dashboardUtils";

// ─── Props ────────────────────────────────────────────────────────────────────

interface InventorySheetProps {
  character: Character;
  equipment: EquipmentSlots;
  onEquipmentChange: () => void;  // callback para o pai re-fetch o equipamento
  onGoldChange: () => void;       // callback para o pai re-fetch o character
}

type Tab = "inventory" | "shop";

// ─── Componente ───────────────────────────────────────────────────────────────

export default function InventorySheet({
  character,
  equipment,
  onEquipmentChange,
  onGoldChange,
}: InventorySheetProps) {
  const [tab, setTab] = useState<Tab>("inventory");
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [shopItems, setShopItems] = useState<Item[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [open, setOpen] = useState(false);

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  // Fetch inventário
  const fetchInventory = useCallback(async () => {
    try {
      const inv = await getPlayerInventory(character.id, equipment, character);
      setInventory(inv);
    } catch (e: any) {
      console.error(e.message);
    }
  }, [character, equipment]);

  // Fetch loja
  const fetchShop = useCallback(async () => {
    try {
      const items = await getEquipmentShopItems();
      setShopItems(items);
    } catch (e: any) {
      console.error(e.message);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    fetchInventory();
    fetchShop();
  }, [open, fetchInventory, fetchShop]);

  // ─── Ações ───────────────────────────────────────────────────────────────

  const handleEquip = async (item: Item) => {
    setLoadingId(item.id);
    const res = await equipItem(character.id, item.id);
    setLoadingId(null);
    showToast(res.message, res.success);
    if (res.success) {
      onEquipmentChange();
      fetchInventory();
    }
  };

  const handleUnequip = async (item: Item) => {
    setLoadingId(item.id);
    const res = await unequipItem(character.id, item.slot as Slot);
    setLoadingId(null);
    showToast(res.message, res.success);
    if (res.success) {
      onEquipmentChange();
      fetchInventory();
    }
  };

  const handleBuy = async (item: Item) => {
    setLoadingId(item.id);
    const res = await buyEquipmentItem(character.id, item.id);
    setLoadingId(null);
    showToast(res.message, res.success);
    if (res.success) {
      onGoldChange();
      fetchInventory();
      fetchShop();
    }
  };

  // ─── IDs já no inventário (para a loja) ──────────────────────────────────
  const ownedIds = new Set(inventory.map((i) => i.item.id));

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#2a2540] bg-[#13111e] text-zinc-300 hover:border-yellow-400/30 hover:text-yellow-300 text-xs font-bold uppercase tracking-widest transition-all">
          <Backpack className="w-4 h-4" />
          Inventário
        </button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="w-full max-w-md bg-[#0b0714] border-l border-[#2a2540] overflow-y-auto"
      >
        <SheetHeader className="mb-4">
          <SheetTitle className="text-yellow-300 font-['Press_Start_2P',monospace] text-sm">
            ⚔ Mochila
          </SheetTitle>
        </SheetHeader>

        {/* Toast */}
        {toast && (
          <div
            className={`mb-4 px-4 py-3 rounded-xl border text-sm font-semibold ${
              toast.ok
                ? "bg-emerald-400/10 border-emerald-400/30 text-emerald-300"
                : "bg-rose-400/10 border-rose-400/30 text-rose-300"
            }`}
          >
            {toast.msg}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-4 bg-[#13111e] rounded-xl p-1 border border-[#2a2540]">
          {(["inventory", "shop"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                tab === t
                  ? "bg-yellow-400 text-black"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {t === "inventory" ? (
                <><Backpack className="w-3.5 h-3.5" /> Inventário</>
              ) : (
                <><Store className="w-3.5 h-3.5" /> Loja</>
              )}
            </button>
          ))}
        </div>

        {/* Conteúdo */}
        {tab === "inventory" && (
          <div>
            {inventory.length === 0 ? (
              <div className="text-center py-16 text-zinc-500 text-sm">
                <p className="text-3xl mb-3">🎒</p>
                <p>O teu inventário está vazio.</p>
                <p className="text-xs mt-1 text-zinc-600">Vai à loja comprar equipamento!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {inventory.map((inv) => (
                  <ItemCard
                    key={inv.id}
                    inventoryItem={inv}
                    mode="inventory"
                    onEquip={handleEquip}
                    onUnequip={handleUnequip}
                    loading={loadingId === inv.item.id}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "shop" && (
          <div>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-3">
              Gold disponível: <span className="text-yellow-300 font-bold">{character.gold ?? 0} G</span>
            </p>
            <div className="space-y-2">
              {shopItems.map((item) => (
                <ItemCard
                  key={item.id}
                  shopItem={item}
                  alreadyOwned={ownedIds.has(item.id)}
                  mode="shop"
                  onBuy={handleBuy}
                  loading={loadingId === item.id}
                  playerGold={character.gold ?? 0}
                />
              ))}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
