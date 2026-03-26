"use client";

import React, { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Coins, CheckCircle2, AlertCircle, X } from "lucide-react";

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
  dailyLimit: 3
},
{
  key: "xp_scroll",
  name: "Pergaminho XP",
  cost: 60,
  icon: "📜",
  type: "pergaminho",
  effectType: "xp_boost",
  effectValue: 2,
  dailyLimit: 2
},
{
  key: "mana_elixir",
  name: "Elixir de Mana",
  cost: 40,
  icon: "🔷",
  type: "poção",
  effectType: "restore_mp",
  effectValue: 30,
  dailyLimit: 3
}];


type Props = {
  gold: number;
  characterId: string;
  onPurchaseSuccess?: () => Promise<void> | void;
};

type PurchaseCountMap = Record<string, number>;

function getItemMeta(item: ShopItem) {
  switch (item.key) {
    case "health_potion":
      return {
        badge: "Recuperação",
        description: "Restaura vida para manter o herói em combate.",
        effectColor: "text-rose-400",
        effectBg: "bg-rose-400/10",
        effectBorder: "border-rose-400/20"
      };
    case "mana_elixir":
      return {
        badge: "Energia",
        description: "Recupera mana para continuares a completar missões.",
        effectColor: "text-blue-400",
        effectBg: "bg-blue-400/10",
        effectBorder: "border-blue-400/20"
      };
    case "xp_scroll":
      return {
        badge: "Boost",
        description: "Duplica o XP durante 24 horas.",
        effectColor: "text-yellow-300",
        effectBg: "bg-yellow-400/10",
        effectBorder: "border-yellow-400/20"
      };
    case "iron_sword":
      return {
        badge: "Equipamento",
        description: "Arma base para fortalecer o teu build.",
        effectColor: "text-orange-400",
        effectBg: "bg-orange-400/10",
        effectBorder: "border-orange-400/20"
      };
    case "bronze_shield":
      return {
        badge: "Defesa",
        description: "Mais proteção e presença de tanque.",
        effectColor: "text-emerald-400",
        effectBg: "bg-emerald-400/10",
        effectBorder: "border-emerald-400/20"
      };
    case "luck_potion":
      return {
        badge: "Sorte",
        description: "Um pequeno empurrão místico para dias importantes.",
        effectColor: "text-purple-400",
        effectBg: "bg-purple-400/10",
        effectBorder: "border-purple-400/20"
      };
    default:
      return {
        badge: "Item",
        description: "Item especial da loja.",
        effectColor: "text-yellow-300",
        effectBg: "bg-yellow-400/10",
        effectBorder: "border-yellow-400/20"
      };
  }
}

function getEffectLabel(item: ShopItem) {
  switch (item.effectType) {
    case "heal_hp":
      return `+${item.effectValue} HP`;
    case "restore_mp":
      return `+${item.effectValue} MP`;
    case "xp_boost":
      return "XP ×2 / 24h";
    case "equipment":
      return "Equipável";
    case "luck":
      return "Sorte";
    default:
      return "Item";
  }
}

type ToastType = "success" | "error" | "warning";

function Toast({
  message,
  type,
  onClose




}: {message: string;type: ToastType;onClose: () => void;}) {
  const styles = {
    success: {
      border: "border-emerald-400/30",
      bg: "bg-emerald-400/10",
      text: "text-emerald-300",
      Icon: CheckCircle2
    },
    error: {
      border: "border-rose-400/30",
      bg: "bg-rose-400/10",
      text: "text-rose-300",
      Icon: AlertCircle
    },
    warning: {
      border: "border-yellow-400/30",
      bg: "bg-yellow-400/10",
      text: "text-yellow-300",
      Icon: AlertCircle
    }
  }[type];

  return (
    <div
      className={`mb-3 flex items-center gap-3 rounded-xl border ${styles.border} ${styles.bg} px-4 py-3`}>
      
      <styles.Icon className={`h-4 w-4 shrink-0 ${styles.text}`} />
      <p className={`flex-1 text-sm font-medium ${styles.text}`}>{message}</p>
      <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300">
        <X className="h-3.5 w-3.5" />
      </button>
    </div>);

}

export default function ItemShop({
  gold,
  characterId,
  onPurchaseSuccess
}: Props) {
  const supabase = useMemo(() => createClient(), []);
  const [purchaseCounts, setPurchaseCounts] = useState<PurchaseCountMap>({});
  const [loadingItem, setLoadingItem] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: ToastType;
  } | null>(null);

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadTodayPurchases = async () => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const { data, error } = await supabase.
    from("shop_purchases").
    select("item_key").
    eq("character_id", characterId).
    gte("purchased_at", start.toISOString()).
    lte("purchased_at", end.toISOString());

    if (error) {
      console.error("Erro ao carregar compras do dia:", error.message);
      return;
    }

    const counts: PurchaseCountMap = {};
    for (const row of data ?? [])
    counts[row.item_key] = (counts[row.item_key] ?? 0) + 1;
    setPurchaseCounts(counts);
  };

  useEffect(() => {
    if (!characterId) return;
    loadTodayPurchases();
  }, [characterId]);

  const handleBuy = async (item: ShopItem) => {
    setLoadingItem(item.key);
    try {
      const boughtToday = purchaseCounts[item.key] ?? 0;
      const reachedDailyLimit =
      item.dailyLimit !== undefined && boughtToday >= item.dailyLimit;

      if (reachedDailyLimit) {
        showToast(`Limite diário atingido para ${item.name}.`, "warning");
        return;
      }
      if (gold < item.cost) {
        showToast("Gold insuficiente.", "error");
        return;
      }

      const { data, error } = await supabase.rpc("buy_shop_item", {
        p_character_id: characterId,
        p_item_key: item.key,
        p_item_name: item.name,
        p_cost: item.cost,
        p_effect_type: item.effectType,
        p_effect_value: item.effectValue ?? 0,
        p_daily_limit: item.dailyLimit ?? null
      });

      if (error) {
        console.error("Erro na compra:", error.message);
        showToast("Erro ao processar a compra.", "error");
        return;
      }
      if (!data?.success) {
        showToast(
          data?.message ?? "Não foi possível concluir a compra.",
          "error"
        );
        return;
      }

      showToast(data.message ?? "Compra realizada com sucesso!", "success");
      await loadTodayPurchases();
      if (onPurchaseSuccess) await onPurchaseSuccess();
    } finally {
      setLoadingItem(null);
    }
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#120c1f]/95 shadow-[0_14px_45px_rgba(0,0,0,0.45)] backdrop-blur-xl">
      {}
      <div className="border-b border-white/10 bg-gradient-to-r from-yellow-400/8 via-transparent to-violet-400/8 px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">
              Merchant Zone
            </p>
            <h3 className="mt-0.5 font-['Press_Start_2P',monospace] text-sm leading-snug text-yellow-300">
              ◆ Loja de Itens
            </h3>
          </div>
          <div className="flex items-center whitespace-nowrap gap-2.5 rounded-xl border border-yellow-400/25 bg-yellow-400/10 px-6 py-1.5">
            <Coins className="h-4 w-4 text-yellow-400 shrink-0" />
            <span className="text-xs font-bold text-yellow-200 leading-none">
              {gold} G
            </span>
          </div>
        </div>
      </div>

      {}
      <div className="p-3">
        {toast &&
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)} />

        }

        <div className="flex flex-col gap-2">
          {items.map((item) => {
            const meta = getItemMeta(item);
            const boughtToday = purchaseCounts[item.key] ?? 0;
            const reachedDailyLimit =
            item.dailyLimit !== undefined && boughtToday >= item.dailyLimit;
            const canBuy = gold >= item.cost && !reachedDailyLimit;
            const isLoading = loadingItem === item.key;

            return (
              <div
                key={item.key}
                className={`rounded-xl border p-3 transition-all duration-200 ${
                canBuy ?
                "border-white/10 bg-white/[0.03] hover:border-yellow-400/25 hover:bg-white/[0.05]" :
                "border-white/5 bg-white/[0.02] opacity-50"}`
                }>
                
                {}
                <div className="flex items-center gap-3">
                  {}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black/20 text-xl leading-none">
                    {item.icon}
                  </div>

                  {}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-zinc-100">
                      {item.name}
                    </p>
                    <p className="text-[10px] uppercase tracking-wider text-zinc-500">
                      {meta.badge} · {item.type}
                    </p>
                  </div>

                  {}
                  <div className="shrink-0 rounded-lg border border-yellow-400/20 bg-yellow-400/10 px-2 py-1 text-xs font-bold text-yellow-300">
                    {item.cost} G
                  </div>
                </div>

                {}
                <p className="mt-2 text-[12px] leading-relaxed text-zinc-400">
                  {meta.description}
                </p>

                {}
                <div className="mt-2.5 flex items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-1.5">
                    <span
                      className={`rounded-full border ${meta.effectBorder} ${meta.effectBg} px-2 py-0.5 text-[10px] font-semibold ${meta.effectColor}`}>
                      
                      {getEffectLabel(item)}
                    </span>

                    {item.dailyLimit !== undefined &&
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                      reachedDailyLimit ?
                      "border-rose-400/20 bg-rose-400/10 text-rose-400" :
                      "border-white/10 bg-white/5 text-zinc-400"}`
                      }>
                      
                        {reachedDailyLimit ?
                      "Esgotado" :
                      `${boughtToday}/${item.dailyLimit} hoje`}
                      </span>
                    }
                  </div>

                  <button
                    onClick={() => handleBuy(item)}
                    disabled={!canBuy || isLoading}
                    className={`h-8 shrink-0 rounded-lg px-4 text-xs font-bold transition-all duration-150 ${
                    canBuy && !isLoading ?
                    "border border-yellow-400/40 bg-yellow-400 text-black hover:bg-yellow-300 active:scale-95" :
                    "cursor-not-allowed border border-white/10 bg-white/5 text-zinc-600"}`
                    }>
                    
                    {isLoading ?
                    <span className="flex items-center gap-1.5">
                        <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-black/30 border-t-black" />
                        A comprar…
                      </span> :
                    canBuy ?
                    "Comprar" :

                    "Indisponível"
                    }
                  </button>
                </div>
              </div>);

          })}
        </div>
      </div>
    </section>);

}