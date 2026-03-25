"use client";

import React from "react";
import { Task, DIFFICULTY_COLORS } from "./dashboardUtils";
import { Trash2 } from "lucide-react";

type Props = {
  task: Task;
  onComplete: (t: Task) => void;
  onDelete: (taskId: string) => void;
};

export default function TaskCard({ task, onComplete, onDelete }: Props) {
  // Configuração visual por tipo de task
  const cfg = {
    habito: { icon: "♾", label: "HÁBITO", color: "#a78bfa" },
    diaria: { icon: "◷", label: "DIÁRIA", color: "#38bdf8" },
    afazer: { icon: "◈", label: "AFAZER", color: "#f5c542" },
  }[task.type];

  const isNegative = task.direction === "negativo";

  // 🔥 Valor do atributo da task (força, inteligência, agilidade, fé)
  const attrMap = {
    forca: task.forca_reward,
    inteligencia: task.inteligencia_reward,
    agilidade: task.agilidade_reward,
    fe: task.fe_reward,
  };

  const attrValue = attrMap[task.skill_type as keyof typeof attrMap] ?? 0;

  // Formata o atributo (+ / -) para exibição
  const formatAttr = (value: number) => {
    if (!value) return "";
    return `${value > 0 ? `+${value}` : value} ${task.skill_type.toUpperCase()}`;
  };

  return (
    <div
      className={`group flex items-center gap-5 p-5 bg-[#13111e] border-2 transition-all ${
        isNegative
          ? "border-[#3d1010] hover:border-red-700"
          : "border-[#2a2540] hover:border-[#423a63]"
      }`}
    >
      {/* Ícone e tipo */}
      <div
        className="shrink-0 w-12 text-center"
        style={{ color: isNegative ? "#ef4444" : cfg.color }}
      >
        <div className="text-4xl mb-1">{cfg.icon}</div>
        <div className="text-[12px] font-black uppercase tracking-tighter opacity-70">
          {cfg.label}
        </div>
      </div>

      {/* Conteúdo da task */}
      <div className="flex-1 min-w-0">
        <h4
          className={`text-base font-bold uppercase tracking-tight truncate ${
            isNegative ? "text-red-400" : "text-[#e8e0f0]"
          }`}
        >
          {task.title}
        </h4>

        {task.notes && (
          <p className="text-xs text-[#6b6480] mt-1 italic">{task.notes}</p>
        )}

        {/* Recompensas / penalidades */}
        <div className="flex items-center gap-4 mt-2">
          <span
            className={`flex gap-2 text-[12px] font-bold uppercase ${
              isNegative ? "text-red-500" : "text-yellow-500"
            }`}
          >
            {isNegative ? (
              <>
                <span>-{task.penalty_hp ?? 10} HP</span>
                {attrValue !== 0 && <span>{formatAttr(attrValue)}</span>}
              </>
            ) : (
              <>
                <span>+{task.xp_reward ?? 0} XP</span>
                {attrValue !== 0 && <span>{formatAttr(attrValue)}</span>}
              </>
            )}
          </span>

          {task.difficulty && (
            <span
              className="text-[10px] font-bold uppercase"
              style={{ color: DIFFICULTY_COLORS[task.difficulty] }}
            >
              • {task.difficulty}
            </span>
          )}
        </div>
      </div>

      {/* Botões de ação */}
      <div className="flex gap-2 shrink-0">
        <button
          onClick={() => onDelete(task.id)}
          className="h-8 px-3 text-xs font-bold text-white bg-red-500 border border-red-500 rounded hover:bg-red-600 transition-colors"
        >
          <Trash2 className="h-5" />
        </button>

        <button
          onClick={() => onComplete(task)}
          className={`h-8 px-3 min-w-22.5 text-xs font-bold border rounded transition-colors flex items-center justify-center ${
            isNegative
              ? "text-red-500 border-red-500 hover:bg-red-500 hover:text-white"
              : "text-yellow-500 border-yellow-500 hover:bg-yellow-500 hover:text-black"
          }`}
        >
          {isNegative ? "FALHOU" : "CONCLUIR"}
        </button>
      </div>
    </div>
  );
}
