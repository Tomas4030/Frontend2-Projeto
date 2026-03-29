"use client";

import React, { useState } from "react";
import { Info, Zap, Shield, Target, Sparkles, TrendingUp } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { FinalStats } from "@/types/equipment";
import type { Character } from "@/types/dashboard";

interface BuffsDetailsModalProps {
  character: Character;
  finalStats: FinalStats;
}

function formatBonusKey(key: string, val: unknown): string {
  const n = Number(val);

  switch (key) {
    case "strength_bonus":
      return `+${n} Força`;
    case "intelligence_bonus":
      return `+${n} Inteligência`;
    case "agility_bonus":
      return `+${n} Agilidade`;
    case "faith_bonus":
      return `+${n} Fé`;
    case "hp_bonus":
      return `+${n} HP`;
    case "mp_bonus":
      return `+${n} MP`;
    case "xp_multiplier":
      return `XP ×${n.toFixed(1)}`;
    case "gold_multiplier":
      return `Gold ×${n.toFixed(1)}`;
    case "boss_damage_bonus":
      return `+${n} Dano Boss`;
    case "streak_protection":
      return "🛡️ Proteção de Streak";
    default:
      return `${key}: ${String(val)}`;
  }
}

export default function BuffsDetailsModal({
  character,
  finalStats,
}: BuffsDetailsModalProps) {
  const [open, setOpen] = useState(false);

  const strengthBonus = finalStats.final_forca - character.forca;
  const intelligenceBonus =
    finalStats.final_inteligencia - character.inteligencia;
  const agilityBonus = finalStats.final_agilidade - character.agilidade;
  const faithBonus = finalStats.final_fe - character.fe;
  const hpBonus = finalStats.final_hp_max - character.max_hp;
  const mpBonus = finalStats.final_mp_max - character.max_mp;
  const xpMultiplierActive = finalStats.final_xp_multiplier > 1;
  const goldMultiplierActive = finalStats.final_gold_multiplier > 1;

  const hasAnyBonus =
    strengthBonus > 0 ||
    intelligenceBonus > 0 ||
    agilityBonus > 0 ||
    faithBonus > 0 ||
    hpBonus > 0 ||
    mpBonus > 0 ||
    xpMultiplierActive ||
    goldMultiplierActive ||
    finalStats.final_boss_damage_bonus > 0 ||
    finalStats.has_streak_protection ||
    (finalStats.active_set_bonuses?.length ?? 0) > 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          title="Ver buffs e bônus"
          className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-400 transition-all hover:bg-amber-500/20 hover:border-amber-400/60 hover:text-amber-300 hover:scale-105"
        >
          <Sparkles className="h-4 w-4" />
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-xl border-purple-500/20 bg-linear-to-br from-[#1a1625] via-[#13111e] to-[#0f0d18] text-white shadow-2xl">
        <DialogHeader className="border-b border-purple-500/10 pb-4">
          <DialogTitle className="text-xl font-bold bg-linear-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
            ✨ Buffs e Bônus Equipados
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 max-h-125 overflow-y-auto pr-2">
          {/* Buffs de Stats */}
          {(strengthBonus > 0 ||
            intelligenceBonus > 0 ||
            agilityBonus > 0 ||
            faithBonus > 0 ||
            hpBonus > 0 ||
            mpBonus > 0) && (
            <div className="group rounded-xl bg-linear-to-br from-cyan-500/20 via-blue-500/10 to-cyan-500/5 p-4 border border-cyan-400/30 hover:border-cyan-400/50 transition-all duration-200 hover:shadow-lg hover:shadow-cyan-500/20">
              <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-cyan-300 flex items-center gap-2">
                <TrendingUp className="h-3.5 w-3.5" />
                Atributos
              </h4>
              <div className="space-y-2 text-sm">
                {strengthBonus > 0 && (
                  <div className="flex items-center justify-between px-2 py-1 rounded bg-cyan-500/10">
                    <span className="text-cyan-200">💪 Força</span>
                    <span className="font-bold text-cyan-300">
                      +{strengthBonus}
                    </span>
                  </div>
                )}
                {intelligenceBonus > 0 && (
                  <div className="flex items-center justify-between px-2 py-1 rounded bg-cyan-500/10">
                    <span className="text-cyan-200">🧠 Inteligência</span>
                    <span className="font-bold text-cyan-300">
                      +{intelligenceBonus}
                    </span>
                  </div>
                )}
                {agilityBonus > 0 && (
                  <div className="flex items-center justify-between px-2 py-1 rounded bg-cyan-500/10">
                    <span className="text-cyan-200">⚡ Agilidade</span>
                    <span className="font-bold text-cyan-300">
                      +{agilityBonus}
                    </span>
                  </div>
                )}
                {faithBonus > 0 && (
                  <div className="flex items-center justify-between px-2 py-1 rounded bg-cyan-500/10">
                    <span className="text-cyan-200">✨ Fé</span>
                    <span className="font-bold text-cyan-300">
                      +{faithBonus}
                    </span>
                  </div>
                )}
                {hpBonus > 0 && (
                  <div className="flex items-center justify-between px-2 py-1 rounded bg-red-500/10">
                    <span className="text-red-200">❤️ HP Máximo</span>
                    <span className="font-bold text-red-300">+{hpBonus}</span>
                  </div>
                )}
                {mpBonus > 0 && (
                  <div className="flex items-center justify-between px-2 py-1 rounded bg-blue-500/10">
                    <span className="text-blue-200">🔵 MP Máximo</span>
                    <span className="font-bold text-blue-300">+{mpBonus}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Buffs de Multiplicadores */}
          {(xpMultiplierActive ||
            goldMultiplierActive ||
            finalStats.final_boss_damage_bonus > 0 ||
            finalStats.has_streak_protection) && (
            <div className="group rounded-xl bg-linear-to-br from-yellow-500/20 via-amber-500/10 to-yellow-500/5 p-4 border border-yellow-400/30 hover:border-yellow-400/50 transition-all duration-200 hover:shadow-lg hover:shadow-yellow-500/20">
              <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-yellow-300 flex items-center gap-2">
                <Zap className="h-3.5 w-3.5" />
                Efeitos Especiais
              </h4>
              <div className="space-y-2 text-sm">
                {xpMultiplierActive && (
                  <div className="flex items-center justify-between px-2 py-1 rounded bg-yellow-500/10">
                    <span className="text-yellow-200">📚 Multiplicador XP</span>
                    <span className="font-bold text-yellow-300">
                      ×{finalStats.final_xp_multiplier.toFixed(2)}
                    </span>
                  </div>
                )}
                {goldMultiplierActive && (
                  <div className="flex items-center justify-between px-2 py-1 rounded bg-yellow-500/10">
                    <span className="text-yellow-200">
                      💰 Multiplicador Gold
                    </span>
                    <span className="font-bold text-yellow-300">
                      ×{finalStats.final_gold_multiplier.toFixed(2)}
                    </span>
                  </div>
                )}
                {finalStats.final_boss_damage_bonus > 0 && (
                  <div className="flex items-center justify-between px-2 py-1 rounded bg-red-500/10">
                    <span className="text-red-200">👹 Dano contra Bosses</span>
                    <span className="font-bold text-red-300">
                      +{finalStats.final_boss_damage_bonus}
                    </span>
                  </div>
                )}
                {finalStats.has_streak_protection && (
                  <div className="flex items-center justify-between px-2 py-1 rounded bg-green-500/10">
                    <span className="text-green-200">
                      🛡️ Proteção de Streak
                    </span>
                    <span className="font-bold text-green-300">Ativa</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Set Bonuses */}
          {(finalStats.active_set_bonuses?.length ?? 0) > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-widest text-purple-300 flex items-center gap-2 px-2">
                <Sparkles className="h-3.5 w-3.5" />
                Bônus de Set
              </h4>
              {finalStats.active_set_bonuses?.map((sb, idx) => (
                <div
                  key={sb.set_id}
                  className="group rounded-xl bg-linear-to-br from-purple-500/20 via-pink-500/10 to-purple-500/5 p-4 border border-purple-400/30 hover:border-purple-400/50 transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/20"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-300 bg-purple-500/20 px-2.5 py-1 rounded-full inline-block">
                      {sb.pieces_equipped} / Peças
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    {sb.bonuses_active.flatMap((bonus, i) =>
                      Object.entries(bonus).map(([key, value]) => (
                        <div
                          key={`${i}-${key}`}
                          className="flex items-center justify-between px-2 py-1 rounded bg-purple-500/10 text-purple-200"
                        >
                          <span>
                            {formatBonusKey(key, value).split("+")[0] ||
                              formatBonusKey(key, value)}
                          </span>
                          <span className="font-bold text-purple-300">
                            {formatBonusKey(key, value).includes("+")
                              ? "+" + formatBonusKey(key, value).split("+")[1]
                              : formatBonusKey(key, value).split(" ")[1]}
                          </span>
                        </div>
                      )),
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {!hasAnyBonus && (
            <div className="rounded-xl bg-linear-to-br from-zinc-500/10 to-zinc-500/5 p-8 border border-zinc-500/20 text-center">
              <div className="text-3xl mb-2">😴</div>
              <p className="text-sm text-zinc-400">
                Nenhum buff ativo no momento
              </p>
              <p className="text-xs text-zinc-500 mt-1">
                Equipe itens para ativar efeitos
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
