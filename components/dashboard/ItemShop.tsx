import React from "react";

export default function ItemShop() {
  const items = [
    { name: "Poção de Vida", cost: 25, icon: "🧪" },
    { name: "Pergaminho XP", cost: 60, icon: "📜" },
  ];

  return (
    <div className="bg-[#13111e] border border-[#2a2540] p-6">
      <h4 className="text-xs text-[#cbd5e1] uppercase tracking-widest mb-5 flex items-center gap-2">
        <span className="text-yellow-400">◆</span> Loja de Itens
      </h4>
      <div className="space-y-3">
        {items.map((item) => (
          <button
            key={item.name}
            className="w-full flex items-center justify-between p-4 bg-[#1a162e] border border-[#2a2540] hover:border-[#f5c542] transition-all group"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{item.icon}</span>
              <span className="text-xs text-[#ccc] uppercase font-bold group-hover:text-[#f5c542]">
                {item.name}
              </span>
            </div>
            <span className="text-xs font-bold text-yellow-400">
              ◆ {item.cost}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
