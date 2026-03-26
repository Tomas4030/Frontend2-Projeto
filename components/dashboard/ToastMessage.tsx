import React from "react";

type Props = {toast: {msg: string;type: "xp" | "hp" | "lvl" | "dmg";};};

export default function ToastMessage({ toast }: Props) {
  return (
    <div
      className={`fixed top-10 left-1/2 -translate-x-1/2 z-50 px-8 py-4 font-mono text-base font-bold uppercase tracking-widest border pointer-events-none animate-[fadeSlideDown_0.3s_ease-out] ${
      toast.type === "dmg" ?
      "bg-red-950 border-red-500 text-red-400" :
      toast.type === "lvl" ?
      "bg-yellow-950 border-yellow-400 text-yellow-300" :
      "bg-[#0f1a0d] border-green-500 text-green-400"}`
      }>
      
      {toast.msg}
    </div>);

}