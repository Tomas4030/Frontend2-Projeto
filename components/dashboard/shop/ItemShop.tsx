"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createClient } from "@/lib/supabase/client";
import ItemShopHeader from "./ItemShopHeader";
import ItemShopToast from "./ItemShopToast";
import ShopItemCard from "./ShopItemCard";
import ShopPagination from "./ShopPagination";
import { items } from "./shop.utils";
import type {
  Props,
  PurchaseCountMap,
  ShopItem,
  ToastState,
  ToastType,
} from "./shop.types";

const ITEMS_PER_PAGE = 3;

export default function ItemShop({
  gold,
  characterId,
  onPurchaseSuccess,
}: Props) {
  const supabase = useMemo(() => createClient(), []);
  const [purchaseCounts, setPurchaseCounts] = useState<PurchaseCountMap>({});
  const [loadingItem, setLoadingItem] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>(null);
  const [page, setPage] = useState(1);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return items.slice(start, end);
  }, [page]);

  const showToast = useCallback((message: string, type: ToastType) => {
    setToast({ message, type });

    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }

    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
    }, 3500);
  }, []);

  const loadTodayPurchases = useCallback(async () => {
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
  }, [characterId, supabase]);

  useEffect(() => {
    if (!characterId) return;
    loadTodayPurchases();
  }, [characterId, loadTodayPurchases]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(1);
    }
  }, [page, totalPages]);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

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
        p_daily_limit: item.dailyLimit ?? null,
      });

      if (error) {
        console.error("Erro na compra:", error.message);
        showToast("Erro ao processar a compra.", "error");
        return;
      }

      if (!data?.success) {
        showToast(
          data?.message ?? "Não foi possível concluir a compra.",
          "error",
        );
        return;
      }

      showToast(data.message ?? "Compra realizada com sucesso!", "success");
      await loadTodayPurchases();

      if (onPurchaseSuccess) {
        await onPurchaseSuccess();
      }
    } finally {
      setLoadingItem(null);
    }
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#120c1f]/95 shadow-[0_14px_45px_rgba(0,0,0,0.45)] backdrop-blur-xl">
      <ItemShopHeader gold={gold} />

      <div className="p-5">
        {toast && (
          <ItemShopToast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}

        <div className="flex flex-col gap-3">
          {paginatedItems.map((item) => (
            <ShopItemCard
              key={item.key}
              item={item}
              gold={gold}
              boughtToday={purchaseCounts[item.key] ?? 0}
              isLoading={loadingItem === item.key}
              onBuy={handleBuy}
            />
          ))}
        </div>

        {totalPages > 1 && (
          <div className="mt-4">
            <ShopPagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    </section>
  );
}
