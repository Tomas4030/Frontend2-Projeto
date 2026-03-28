"use client";

import React, { useState, useCallback } from "react";
import { Backpack, Store, Coins } from "lucide-react";
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

interface InventorySheetProps {
  character: Character;
  equipment: EquipmentSlots;
  onEquipmentChange: () => void;
  onGoldChange: () => void;
}

type Tab = "inventory" | "shop";

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

  const fetchInventory = useCallback(async () => {
    try {
      const inv = await getPlayerInventory(character.id, equipment, character);
      setInventory(inv);
    } catch (e: unknown) {
      console.error(e);
    }
  }, [character, equipment]);

  const fetchShop = useCallback(async () => {
    try {
      const items = await getEquipmentShopItems();
      setShopItems(items);
    } catch (e: unknown) {
      console.error(e);
    }
  }, []);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) {
      void fetchInventory();
      void fetchShop();
    }
  };

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

  const ownedIds = new Set(inventory.map((i) => i.item.id));

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#2a2540] bg-[#13111e] text-zinc-300 hover:border-yellow-400/30 hover:text-yellow-300 text-xs font-bold uppercase tracking-widest transition-all">
          <Backpack className="w-4 h-4" />
          Inventário
        </button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="w-full max-w-107.5 border-l border-white/10 bg-[#070312] p-0 text-white"
      >
        <div className="flex h-full flex-col">
          <SheetHeader className="shrink-0 border-b border-white/10 px-4 sm:px-5 pb-2.5 pt-2.5 text-left">
            <div className="flex items-start justify-between gap-3">
              <div>
                <SheetTitle className="text-left text-lg font-black tracking-wide text-yellow-300">
                  Mochila
                </SheetTitle>
                <p className="mt-1 text-[10px] text-zinc-400">
                  Gere o teu inventário e compra novo equipamento.
                </p>
              </div>

              <div className="flex items-center gap-1 rounded-xl border border-yellow-400/20 bg-yellow-400/10 px-2 py-1">
                <Coins className="h-3 w-3 text-yellow-300" />
                <span className="text-[10px] font-extrabold text-yellow-300">
                  {character.gold ?? 0} G
                </span>
              </div>
            </div>
          </SheetHeader>

          {toast && (
            <div className="px-4 sm:px-5 pt-2.5">
              <div
                className={`rounded-xl border px-2 py-1.5 text-[10px] font-bold shadow-lg ${
                  toast.ok
                    ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                    : "border-rose-400/30 bg-rose-400/10 text-rose-300"
                }`}
              >
                {toast.msg}
              </div>
            </div>
          )}

          <div className="px-4 sm:px-5 pt-2.5">
            <div className="grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-white/5 p-1">
              {(["inventory", "shop"] as Tab[]).map((t) => {
                const active = tab === t;

                return (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`flex items-center justify-center gap-1 rounded-xl px-2 py-2 text-[9px] font-bold uppercase tracking-[0.12em] transition-all ${
                      active
                        ? "bg-yellow-400 text-black shadow-[0_0_20px_rgba(250,204,21,0.2)]"
                        : "text-zinc-400 hover:bg-white/5 hover:text-zinc-100"
                    }`}
                  >
                    {t === "inventory" ? (
                      <>
                        <Backpack className="h-3 w-3" />
                        Inventário
                      </>
                    ) : (
                      <>
                        <Store className="h-3 w-3" />
                        Loja
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 sm:px-5 pb-4 pt-2.5">
            {tab === "inventory" && (
              <>
                {inventory.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-5 py-7 text-center">
                    <Backpack className="mx-auto mb-2 h-6 w-6 text-zinc-500" />
                    <p className="text-xs font-bold text-zinc-200">
                      O teu inventário está vazio.
                    </p>
                    <p className="mt-1 text-[10px] text-zinc-400">
                      Vai à loja e compra o teu primeiro equipamento.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {inventory.map((inv) => (
                      <ItemCard
                        key={inv.item.id}
                        inventoryItem={inv}
                        mode="inventory"
                        loading={loadingId === inv.item.id}
                        onEquip={handleEquip}
                        onUnequip={handleUnequip}
                      />
                    ))}
                  </div>
                )}
              </>
            )}

            {tab === "shop" && (
              <>
                <div className="space-y-2.5">
                  {shopItems.map((item) => (
                    <ItemCard
                      key={item.id}
                      shopItem={item}
                      alreadyOwned={ownedIds.has(item.id)}
                      mode="shop"
                      loading={loadingId === item.id}
                      onBuy={handleBuy}
                      playerGold={character.gold ?? 0}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
