import React from "react";

// Definição dos itens da loja
const items = [
  { name: "Poção de Vida", cost: 25, icon: "🧪", type: "poção" },
  { name: "Pergaminho XP", cost: 60, icon: "📜", type: "pergaminho" },
  { name: "Elixir de Mana", cost: 40, icon: "💧", type: "poção" },
  { name: "Espada de Ferro", cost: 120, icon: "🗡️", type: "arma" },
  { name: "Escudo de Bronze", cost: 100, icon: "🛡️", type: "armadura" },
  { name: "Poção de Sorte", cost: 50, icon: "🍀", type: "poção" },
];

export default function ItemShop() {
  return (
    <div className="bg-[#13111e] border border-[#2a2540] p-6 rounded-md shadow-lg">
      <h4 className="text-xs text-[#cbd5e1] uppercase tracking-widest mb-5 flex items-center gap-2">
        <span className="text-yellow-400">◆</span> Loja de Itens
      </h4>

      <div className="grid grid-cols-2 gap-4">
        {items.map((item) => (
          <button
            key={item.name}
            className="flex flex-col items-center justify-between p-4 bg-[#1a162e] border border-[#2a2540] hover:border-[#f5c542] hover:shadow-[0_0_15px_rgba(245,197,66,0.5)] transition-all group rounded"
          >
            <span className="text-3xl mb-2">{item.icon}</span>
            <span className="text-xs text-[#ccc] uppercase font-bold text-center group-hover:text-[#f5c542]">
              {item.name}
            </span>
            <span className="text-xs font-bold text-yellow-400 mt-2">
              ◆ {item.cost}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
