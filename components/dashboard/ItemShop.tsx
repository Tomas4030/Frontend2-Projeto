"use client";

import React, { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type ShopItem = {
  key: string;
  name: string;
  cost: number;
  icon: string;
  type: string;
  effectType: "heal_hp" | "restore_mp" | "xp_boost" | "equipment" | "luck";
  effectValue?: number;
  dailyLimit?: number;
};

const items: ShopItem[] = [
  {
    key: "health_potion",
    name: "Poção de Vida",
    cost: 25,
    icon: "🧪",
    type: "poção",
    effectType: "heal_hp",
    effectValue: 35,
    dailyLimit: 3,
  },
  {
    key: "xp_scroll",
    name: "Pergaminho XP",
    cost: 60,
    icon: "📜",
    type: "pergaminho",
    effectType: "xp_boost",
    effectValue: 2,
    dailyLimit: 2,
  },
  {
    key: "mana_elixir",
    name: "Elixir de Mana",
    cost: 40,
    icon: "🔷",
    type: "poção",
    effectType: "restore_mp",
    effectValue: 30,
    dailyLimit: 3,
  },
  {
    key: "iron_sword",
    name: "Espada de Ferro",
    cost: 120,
    icon: "🗡️",
    type: "arma",
    effectType: "equipment",
  },
  {
    key: "bronze_shield",
    name: "Escudo de Bronze",
    cost: 100,
    icon: "🛡️",
    type: "armadura",
    effectType: "equipment",
  },
  {
    key: "luck_potion",
    name: "Poção de Sorte",
    cost: 50,
    icon: "🍀",
    type: "poção",
    effectType: "luck",
  },
];

type Props = {
  gold: number;
  characterId: string;
  onPurchaseSuccess?: () => Promise<void> | void;
};

type PurchaseCountMap = Record<string, number>;

export default function ItemShop({
  gold,
  characterId,
  onPurchaseSuccess,
}: Props) {
  const supabase = useMemo(() => createClient(), []);
  const [purchaseCounts, setPurchaseCounts] = useState<PurchaseCountMap>({});
  const [loadingItem, setLoadingItem] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const loadTodayPurchases = async () => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const { data, error } = await supabase
      .from("shop_purchases")
      .select("item_key")
      .eq("character_id", characterId)
      .gte("purchased_at", start.toISOString())
      .lte("purchased_at", end.toISOString());

    if (error) {
      console.error("Erro ao carregar compras do dia:", error.message);
      return;
    }

    const counts: PurchaseCountMap = {};
    for (const row of data ?? []) {
      counts[row.item_key] = (counts[row.item_key] ?? 0) + 1;
    }

    setPurchaseCounts(counts);
  };

  useEffect(() => {
    if (!characterId) return;
    loadTodayPurchases();
  }, [characterId]);

  const handleBuy = async (item: ShopItem) => {
    setMessage(null);
    setLoadingItem(item.key);

    try {
      const boughtToday = purchaseCounts[item.key] ?? 0;
      const reachedDailyLimit =
        item.dailyLimit !== undefined && boughtToday >= item.dailyLimit;

      if (reachedDailyLimit) {
        setMessage(`Limite diário atingido para ${item.name}.`);
        return;
      }

      if (gold < item.cost) {
        setMessage("Gold insuficiente.");
        return;
      }

      const { data, error } = await supabase.rpc("buy_shop_item", {
        p_character_id: characterId,
        p_item_key: item.key,
        p_item_name: item.name,
        p_cost: item.cost,
        p_effect_type: item.effectType,
        p_effect_value: item.effectValue ?? 0,
        p_daily_limit: item.dailyLimit ?? null,
      });

      if (error) {
        console.error("Erro na compra:", error.message);
        setMessage("Erro ao processar a compra.");
        return;
      }

      if (!data?.success) {
        setMessage(data?.message ?? "Não foi possível concluir a compra.");
        return;
      }

      setMessage(data.message ?? "Compra realizada com sucesso.");
      await loadTodayPurchases();

      if (onPurchaseSuccess) {
        await onPurchaseSuccess();
      }
    } finally {
      setLoadingItem(null);
    }
  };

  return (
    <div className="bg-[#13111e] border border-[#2a2540] p-6 rounded-md shadow-lg">
      <div className="flex items-center justify-between mb-5">
        <h4 className="text-xs text-[#cbd5e1] uppercase tracking-widest flex items-center gap-2">
          <span className="text-yellow-400">◆</span> Loja de Itens
        </h4>

        <span className="text-yellow-400 text-xs font-bold uppercase">
          Gold: {gold}
        </span>
      </div>

      {message && (
        <div className="mb-4 rounded border border-[#2a2540] bg-[#191627] px-3 py-2 text-xs text-[#cbd5e1]">
          {message}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {items.map((item) => {
          const boughtToday = purchaseCounts[item.key] ?? 0;
          const reachedDailyLimit =
            item.dailyLimit !== undefined && boughtToday >= item.dailyLimit;
          const canBuy = gold >= item.cost && !reachedDailyLimit;
          const isLoading = loadingItem === item.key;

          return (
            <button
              key={item.key}
              onClick={() => handleBuy(item)}
              disabled={!canBuy || isLoading}
              className={`flex flex-col items-center justify-between p-4 rounded border transition-all min-h-[180px]
                ${
                  canBuy
                    ? "bg-[#1a162e] border-[#2a2540] hover:border-[#f5c542] hover:shadow-[0_0_15px_rgba(245,197,66,0.5)]"
                    : "bg-[#151320] border-[#222] opacity-50 cursor-not-allowed"
                }`}
            >
              <span className="text-3xl mb-2">{item.icon}</span>

              <span className="text-sm text-white text-center font-semibold">
                {item.name}
              </span>

              <span className="text-[11px] uppercase text-[#94a3b8]">
                {item.type}
              </span>

              <span className="mt-2 text-yellow-400 font-bold">
                {item.cost} G
              </span>

              {item.dailyLimit !== undefined && (
                <span className="mt-2 text-[10px] uppercase text-[#7dd3fc] text-center">
                  {reachedDailyLimit
                    ? "Limite diário atingido"
                    : `Hoje: ${boughtToday}/${item.dailyLimit}`}
                </span>
              )}

              {item.effectType === "heal_hp" && (
                <span className="mt-1 text-[10px] uppercase text-[#f87171]">
                  +{item.effectValue} HP
                </span>
              )}

              {item.effectType === "restore_mp" && (
                <span className="mt-1 text-[10px] uppercase text-[#60a5fa]">
                  +{item.effectValue} MP
                </span>
              )}

              {item.effectType === "xp_boost" && (
                <span className="mt-1 text-[10px] uppercase text-[#c084fc]">
                  XP x2 por 24h
                </span>
              )}

              {isLoading && (
                <span className="mt-2 text-[10px] uppercase text-white">
                  A comprar...
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
