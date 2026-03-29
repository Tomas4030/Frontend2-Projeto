"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import ShopPagination from "./ShopPagination";
import ShopItemCard from "./ShopItemCard";
import ItemShopHeader from "./ItemShopHeader";
import {
  items,
  formatDuration,
  getTodayRange,
  getTimeUntilMidnight,
} from "./shop.utils";
import { toast } from "sonner";

import type { ShopItem } from "@/types/shop";
import type { Character } from "@/types/dashboard";

type ItemShopProps = {
  gold: number;
  characterId: string;
  character?: Character;
  onPurchaseSuccess?: () => Promise<void> | void;
};

type PurchaseCountMap = Record<string, number>;
type ToastType = "success" | "error" | "warning";

const ITEMS_PER_PAGE = 2;

export default function ItemShop({
  gold,
  characterId,
  character,
  onPurchaseSuccess,
}: ItemShopProps) {
  const supabase = useMemo(() => createClient(), []);

  const [purchaseCounts, setPurchaseCounts] = useState<PurchaseCountMap>({});
  const [loadingItem, setLoadingItem] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [resetTime, setResetTime] = useState<string>("--:--:--");
  const [xpBoostRemainingTime, setXpBoostRemainingTime] = useState<string>("");
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
    const updateCountdown = () => {
      const remaining = getTimeUntilMidnight();
      setResetTime(formatDuration(remaining));

      if (remaining <= 1000) {
        loadTodayPurchases();
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [loadTodayPurchases]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(1);
    }
  }, [page, totalPages]);

  useEffect(() => {
    const updateXpBoostTime = () => {
      if (!character?.xp_boost_expires_at) {
        setXpBoostRemainingTime("");
        return;
      }

      const expiresAt = new Date(character.xp_boost_expires_at).getTime();
      const now = Date.now();
      const remaining = Math.max(0, expiresAt - now);

      if (remaining <= 0) {
        setXpBoostRemainingTime("");
      } else {
        setXpBoostRemainingTime(formatDuration(remaining));
      }
    };

    updateXpBoostTime();
    const interval = setInterval(updateXpBoostTime, 1000);

    return () => clearInterval(interval);
  }, [character?.xp_boost_expires_at]);

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
      const reachedDailyLimit =
        item.dailyLimit !== undefined && boughtToday >= item.dailyLimit;

      if (reachedDailyLimit) {
        showAlert(
          `Limite diário atingido para ${item.name}. Volta às 00:00.`,
          "warning",
        );
        return;
      }

      if (gold < item.cost) {
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
      <ItemShopHeader
        gold={gold}
        resetTime={resetTime}
        xpBoostRemainingTime={xpBoostRemainingTime}
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
      />

      <div className="p-5">
        <div className="flex flex-col gap-3">
          {visibleItems.map((item) => {
            const boughtToday = purchaseCounts[item.key] ?? 0;
            const isLoading = loadingItem === item.key;

            return (
              <ShopItemCard
                key={item.key}
                item={item}
                gold={gold}
                boughtToday={boughtToday}
                isLoading={isLoading}
                onBuy={handleBuy}
              />
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
