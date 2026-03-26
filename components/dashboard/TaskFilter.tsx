import React from "react";

type Props = {
  activeFilter: string;
  setActiveFilter: (f: "todos" | "habito" | "diaria" | "afazer") => void;
};

export default function TaskFilter({ activeFilter, setActiveFilter }: Props) {
  return (
    <div className="flex gap-1 bg-[#0a0910] border border-[#2a2540] p-1.5 shadow-lg">
      {(["todos", "habito", "diaria", "afazer"] as const).map((f) =>
      <button
        key={f}
        onClick={() => setActiveFilter(f)}
        aria-pressed={activeFilter === f}
        className={`flex-1 py-3 text-xs uppercase tracking-widest font-bold transition-all flex items-center justify-center gap-2 ${
        activeFilter === f ?
        "bg-[#f5c542] text-black shadow-inner" :
        "text-[#cbd5e1] hover:text-[#f5c542] hover:bg-[#1a162e]"}`
        }>
        
          {f}
        </button>
      )}
    </div>);

}