import React from "react";
import { Task, DIFFICULTY_COLORS } from "./dashboardUtils";

type Props = { task: Task; onComplete: (t: Task) => void };

export default function TaskCard({ task, onComplete }: Props) {
  const cfg = {
    habito: { icon: "♾", label: "HÁBITO", color: "#a78bfa" },
    diaria: { icon: "◷", label: "DIÁRIA", color: "#38bdf8" },
    afazer: { icon: "◈", label: "AFAZER", color: "#f5c542" }
  }[task.type];

  const isNegative = task.direction === "negativo";

  return (
    <div className={`group flex items-center gap-5 p-5 bg-[#13111e] border-2 transition-all ${isNegative ? "border-[#3d1010] hover:border-red-700" : "border-[#2a2540] hover:border-[#423a63]"}`}>
      <div className="shrink-0 w-12 text-center" style={{ color: isNegative ? "#ef4444" : cfg.color }}>
        <div className="text-4xl mb-1">{cfg.icon}</div>
        <div className="text-[12px] font-black uppercase tracking-tighter opacity-70">{cfg.label}</div>
      </div>
      <div className="flex-1 min-w-0">
        <h4 className={`text-base font-bold uppercase tracking-tight truncate ${isNegative ? "text-red-400" : "text-[#e8e0f0]"}`}>{task.title}</h4>
        {task.notes && <p className="text-xs text-[#6b6480] mt-1 italic">{task.notes}</p>}
        <div className="flex items-center gap-4 mt-2">
          <span className={`text-[12px] font-bold uppercase ${isNegative ? "text-red-500" : "text-yellow-500"}`}>
            {isNegative ? `-${task.penalty_hp ?? 10} HP` : `+${task.xp_reward ?? 0} XP`}
          </span>
          {task.difficulty && (
            <span className="text-[10px] font-bold uppercase" style={{ color: DIFFICULTY_COLORS[task.difficulty] }}>
              • {task.difficulty}
            </span>
          )}
        </div>
      </div>
      <div className="shrink-0">
        <button
          onClick={() => onComplete(task)}
          className={`h-12 px-5 text-xs font-black border-2 transition-all ${isNegative ? "text-red-500 hover:bg-red-800 hover:text-black" : "border-[#3a3558] text-[#f5c542] hover:bg-[#f5c542] hover:text-black"}`}
        >
          {isNegative ? "FALHOU" : "CONCLUIR"}
        </button>
      </div>
    </div>
  );
}