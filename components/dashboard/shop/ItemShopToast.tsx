"use client";

import { AlertCircle, CheckCircle2, X } from "lucide-react";
import type { ToastType } from "./shop.types";

type Props = {
  message: string;
  type: ToastType;
  onClose: () => void;
};

export default function ItemShopToast({ message, type, onClose }: Props) {
  const styles = {
    success: {
      border: "border-emerald-400/30",
      bg: "bg-emerald-400/10",
      text: "text-emerald-300",
      Icon: CheckCircle2,
    },
    error: {
      border: "border-rose-400/30",
      bg: "bg-rose-400/10",
      text: "text-rose-300",
      Icon: AlertCircle,
    },
    warning: {
      border: "border-yellow-400/30",
      bg: "bg-yellow-400/10",
      text: "text-yellow-300",
      Icon: AlertCircle,
    },
  }[type];

  return (
    <div
      className={`mb-3 flex items-center gap-3 rounded-xl border ${styles.border} ${styles.bg} px-4 py-3`}
    >
      <styles.Icon className={`h-4 w-4 shrink-0 ${styles.text}`} />
      <p className={`flex-1 text-sm font-medium ${styles.text}`}>{message}</p>
      <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300">
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}