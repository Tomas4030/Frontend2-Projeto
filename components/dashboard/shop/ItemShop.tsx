"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Coins, RefreshCw, Clock } from "lucide-react";
import ShopPagination from "./ShopPagination";
import { toast } from "sonner";

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
    dailyLimit: 5,
  },
];

type Props = {
  gold: number;
  characterId: string;
  onPurchaseSuccess?: () => Promise<void> | void;
};

type PurchaseCountMap = Record<string, number>;
type ToastType = "success" | "error" | "warning";
type ItemState = "available" | "sold_out" | "insufficient_gold";

const ITEMS_PER_PAGE = 2;

function getItemMeta(item: ShopItem) {
  switch (item.key) {
    case "health_potion":
      return {
        badge: "Recuperação",
        description: "Restaura vida para manter o herói em combate.",
        effectColor: "text-rose-400",
        effectBg: "bg-rose-400/10",
        effectBorder: "border-rose-400/20",
      };
    case "mana_elixir":
      return {
        badge: "Energia",
        description: "Recupera mana para continuares a completar missões.",
        effectColor: "text-blue-400",
        effectBg: "bg-blue-400/10",
        effectBorder: "border-blue-400/20",
      };
    case "xp_scroll":
      return {
        badge: "Boost",
        description: "Duplica o XP durante 24 horas.",
        effectColor: "text-yellow-300",
        effectBg: "bg-yellow-400/10",
        effectBorder: "border-yellow-400/20",
      };
    default:
      return {
        badge: "Item",
        description: "Item especial da loja.",
        effectColor: "text-yellow-300",
        effectBg: "bg-yellow-400/10",
        effectBorder: "border-yellow-400/20",
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

function formatDuration(ms: number) {
  if (ms <= 0) return "00:00:00";

  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
}

function getTodayRange() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

function getTimeUntilMidnight() {
  const now = new Date();
  const nextMidnight = new Date();
  nextMidnight.setDate(now.getDate() + 1);
  nextMidnight.setHours(0, 0, 0, 0);

  return nextMidnight.getTime() - now.getTime();
}

function getItemState(
  item: ShopItem,
  gold: number,
  boughtToday: number,
): ItemState {
  const reachedDailyLimit =
    item.dailyLimit !== undefined && boughtToday >= item.dailyLimit;

  if (reachedDailyLimit) return "sold_out";
  if (gold < item.cost) return "insufficient_gold";
  return "available";
}

export default function ItemShop({
  gold,
  characterId,
  onPurchaseSuccess,
}: Props) {
  const supabase = useMemo(() => createClient(), []);

  const [purchaseCounts, setPurchaseCounts] = useState<PurchaseCountMap>({});
  const [loadingItem, setLoadingItem] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [resetTime, setResetTime] = useState<string>("--:--:--");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);

  const visibleItems = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return items.slice(start, start + ITEMS_PER_PAGE);
  }, [page]);

  const showAlert = useCallback((message: string, type: ToastType) => {
    if (type === "success") {
      toast.success("Sucesso", {
        description: message,
      });
      return;
    }

    if (type === "warning") {
      toast.warning("Aviso", {
        description: message,
      });
      return;
    }

    toast.error("Erro", {
      description: message,
    });
  }, []);

  const loadTodayPurchases = useCallback(async () => {
    if (!characterId) return;

    const { start, end } = getTodayRange();

    const { data, error } = await supabase
      .from("shop_purchases")
      .select("item_key")
      .eq("character_id", characterId)
      .gte("purchased_at", start)
      .lte("purchased_at", end);

    if (error) {
      console.error("Erro ao carregar compras do dia:", error.message);
      showAlert("Erro ao carregar a shop.", "error");
      return;
    }

    const counts: PurchaseCountMap = {};

    for (const row of data ?? []) {
      counts[row.item_key] = (counts[row.item_key] ?? 0) + 1;
    }

    setPurchaseCounts(counts);
  }, [characterId, showAlert, supabase]);

  useEffect(() => {
    if (!characterId) return;
    loadTodayPurchases();
  }, [characterId, loadTodayPurchases]);

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = getTimeUntilMidnight();
      setResetTime(formatDuration(remaining));
    }, 1000);

    setResetTime(formatDuration(getTimeUntilMidnight()));

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = getTimeUntilMidnight();

      if (remaining <= 1000) {
        loadTodayPurchases();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [loadTodayPurchases]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(1);
    }
  }, [page, totalPages]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await loadTodayPurchases();
      showAlert("Loja atualizada com sucesso.", "success");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleBuy = async (item: ShopItem) => {
    setLoadingItem(item.key);

    try {
      const boughtToday = purchaseCounts[item.key] ?? 0;
      const state = getItemState(item, gold, boughtToday);

      if (state === "sold_out") {
        showAlert(
          `Limite diário atingido para ${item.name}. Volta às 00:00.`,
          "warning",
        );
        return;
      }

      if (state === "insufficient_gold") {
        showAlert("Gold insuficiente.", "error");
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
        showAlert("Erro ao processar a compra.", "error");
        return;
      }

      if (!data?.success) {
        console.error("RPC returned success=false:", data);
        showAlert(
          data?.message ?? "Não foi possível concluir a compra.",
          "error",
        );
        return;
      }

      console.log(`[Shop] Item comprado com sucesso:`, {
        itemKey: item.key,
        itemName: item.name,
        effectType: item.effectType,
        effectValue: item.effectValue,
      });

      showAlert(data.message ?? "Compra realizada com sucesso!", "success");
      await loadTodayPurchases();

      if (onPurchaseSuccess) {
        console.log(`[Shop] Calling onPurchaseSuccess to refresh character...`);
        await onPurchaseSuccess();
      }
    } finally {
      setLoadingItem(null);
    }
  };

  return (
    <section className="rounded-2xl border border-white/10 bg-[#120c1f]/95 shadow-[0_14px_45px_rgba(0,0,0,0.45)] backdrop-blur-xl">
      <div className="border-b border-white/10 bg-linear-to-r from-yellow-400/8 via-transparent to-violet-400/8 px-6 py-4 justify-center items-center gap-4 flex">
        <div className="flex flex-col gap-3">
          <div className="grid items-center justify-between gap-4">
            <div>
              <h3 className="mt-0.5 font-['Press_Start_2P',monospace] text-sm leading-snug text-yellow-300">
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
                onClick={handleRefresh}
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
          </div>
        </div>
      </div>

      <div className="p-5">
        <div className="flex flex-col gap-3">
          {visibleItems.map((item) => {
            const meta = getItemMeta(item);
            const boughtToday = purchaseCounts[item.key] ?? 0;
            const state = getItemState(item, gold, boughtToday);
            const isLoading = loadingItem === item.key;

            const canBuy = state === "available";
            const isSoldOut = state === "sold_out";
            const isNoGold = state === "insufficient_gold";

            return (
              <div
                key={item.key}
                className={`rounded-xl border p-4 transition-all duration-200 ${
                  canBuy
                    ? "border-white/10 bg-white/3 hover:border-yellow-400/25 hover:bg-white/5"
                    : isSoldOut
                      ? "border-yellow-400/20 bg-yellow-400/5"
                      : "border-white/5 bg-white/2 opacity-60"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black/20 text-2xl leading-none">
                    {item.icon}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="break-words text-sm font-bold leading-snug text-zinc-100">
                          {item.name}
                        </p>
                        <p className="mt-1 text-[10px] uppercase tracking-wider text-zinc-500">
                          {meta.badge} · {item.type}
                        </p>
                      </div>

                      <div className="shrink-0 whitespace-nowrap rounded-lg border border-yellow-400/20 bg-yellow-400/10 px-3 py-1.5 text-xs font-bold text-yellow-300">
                        {item.cost} G
                      </div>
                    </div>
                  </div>
                </div>

                <p className="mt-3 text-[12px] leading-relaxed text-zinc-400">
                  {meta.description}
                </p>

                <div className="mt-3.5 flex items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`rounded-full border ${meta.effectBorder} ${meta.effectBg} px-2 py-1 text-[10px] font-semibold ${meta.effectColor}`}
                    >
                      {getEffectLabel(item)}
                    </span>

                    {isNoGold && (
                      <span className="rounded-full border border-rose-400/20 bg-rose-400/10 px-2 py-1 text-[10px] font-semibold text-rose-300">
                        Sem gold
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleBuy(item)}
                    disabled={!canBuy || isLoading}
                    className={`h-8 shrink-0 rounded-lg px-4 text-xs font-bold transition-all duration-150 ${
                      canBuy && !isLoading
                        ? "border border-yellow-400/40 bg-yellow-400 text-black hover:bg-yellow-300 active:scale-95"
                        : "cursor-not-allowed border border-white/10 bg-white/5 text-zinc-600"
                    }`}
                  >
                    {isLoading
                      ? "A comprar…"
                      : canBuy
                        ? "Comprar"
                        : isSoldOut
                          ? "Indisponível"
                          : "Sem gold"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <ShopPagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>
    </section>
  );
}
