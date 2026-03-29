export type ShopItem = {
  key: string;
  name: string;
  cost: number;
  icon: string;
  type: string;
  effectType: "heal_hp" | "restore_mp" | "xp_boost" | "equipment" | "luck";
  effectValue?: number;
  dailyLimit?: number;
};

export type ShopProps = {
  gold: number;
  characterId: string;
  onPurchaseSuccess?: () => Promise<void> | void;
};

export type PurchaseCountMap = Record<string, number>;

export type ShopToastType = "success" | "error" | "warning";

export type ToastState = {
  message: string;
  type: ShopToastType;
} | null;
