import React from "react";

const items = [
  { name: "Poção de Vida", cost: 25, icon: "🧪", type: "poção" },
  { name: "Pergaminho XP", cost: 60, icon: "📜", type: "pergaminho" },
  { name: "Elixir de Mana", cost: 40, icon: "🔷", type: "poção" },
  { name: "Espada de Ferro", cost: 120, icon: "🗡️", type: "arma" },
  { name: "Escudo de Bronze", cost: 100, icon: "🛡️", type: "armadura" },
  { name: "Poção de Sorte", cost: 50, icon: "🍀", type: "poção" },
];

type Props = {
  gold: number;
};

export default function ItemShop({ gold }: Props) {
  return (
    <div className="bg-[#13111e] border border-[#2a2540] p-6 rounded-md shadow-lg">
      <div className="flex items-center justify-between mb-5">
        <h4 className="text-xs text-[#cbd5e1] uppercase tracking-widest flex items-center gap-2">
          <span className="text-yellow-400">◆</span> Loja de Itens
        </h4>

        <span className="text-yellow-400 text-xs font-bold uppercase">
          Gold: {gold}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {items.map((item) => {
          const canBuy = gold >= item.cost;

          return (
            <button
              key={item.name}
              disabled={!canBuy}
              className={`flex flex-col items-center justify-between p-4 rounded border transition-all
                ${
                  canBuy
                    ? "bg-[#1a162e] border-[#2a2540] hover:border-[#f5c542] hover:shadow-[0_0_15px_rgba(245,197,66,0.5)]"
                    : "bg-[#151320] border-[#222] opacity-50 cursor-not-allowed"
                }`}
            >
              <span className="text-3xl mb-2">{item.icon}</span>
              <span className="text-sm text-white text-center font-semibold">
                {item.name}
              </span>
              <span className="text-[11px] uppercase text-[#94a3b8]">
                {item.type}
              </span>
              <span className="mt-2 text-yellow-400 font-bold">
                {item.cost} G
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
