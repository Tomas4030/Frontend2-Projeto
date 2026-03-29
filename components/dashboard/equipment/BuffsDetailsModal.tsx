"use client";

import React, { useState } from "react";
import { Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { FinalStats } from "@/types/equipment";
import type { Character } from "@/components/dashboard/dashboardUtils";

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

  // Calcular bônus aplicados
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
          title="Ver detalhes de buffs e bônus de set"
          className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#ea9b08]/10 text-[#ea9b08] transition-all duration-200 hover:bg-[#ea9b08]/20 hover:scale-110"
        >
          <Info className="h-3.5 w-3.5" />
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-md border-[#2a2540] bg-[#13111e] text-white">
        <DialogHeader>
          <DialogTitle className="text-[#ea9b08]">
            📊 Buffs Aplicados
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {/* Buffs de Stats */}
          {(strengthBonus > 0 ||
            intelligenceBonus > 0 ||
            agilityBonus > 0 ||
            faithBonus > 0 ||
            hpBonus > 0 ||
            mpBonus > 0) && (
            <div className="rounded-lg bg-blue-500/10 p-3 border border-blue-500/20">
              <h4 className="mb-2 text-xs font-bold uppercase tracking-widest text-blue-400">
                📈 Atributos
              </h4>
              <div className="space-y-1 text-xs text-blue-200/80">
                {strengthBonus > 0 && <div>• +{strengthBonus} Força</div>}
                {intelligenceBonus > 0 && (
                  <div>• +{intelligenceBonus} Inteligência</div>
                )}
                {agilityBonus > 0 && <div>• +{agilityBonus} Agilidade</div>}
                {faithBonus > 0 && <div>• +{faithBonus} Fé</div>}
                {hpBonus > 0 && <div>• +{hpBonus} HP Máximo</div>}
                {mpBonus > 0 && <div>• +{mpBonus} MP Máximo</div>}
              </div>
            </div>
          )}

          {/* Buffs de Multiplicadores */}
          {(xpMultiplierActive ||
            goldMultiplierActive ||
            finalStats.final_boss_damage_bonus > 0 ||
            finalStats.has_streak_protection) && (
            <div className="rounded-lg bg-yellow-500/10 p-3 border border-yellow-500/20">
              <h4 className="mb-2 text-xs font-bold uppercase tracking-widest text-yellow-400">
                ⭐ Efeitos Especiais
              </h4>
              <div className="space-y-1 text-xs text-yellow-200/80">
                {xpMultiplierActive && (
                  <div>• XP ×{finalStats.final_xp_multiplier.toFixed(2)}</div>
                )}
                {goldMultiplierActive && (
                  <div>
                    • Gold ×{finalStats.final_gold_multiplier.toFixed(2)}
                  </div>
                )}
                {finalStats.final_boss_damage_bonus > 0 && (
                  <div>
                    • +{finalStats.final_boss_damage_bonus} Dano contra Bosses
                  </div>
                )}
                {finalStats.has_streak_protection && (
                  <div>• 🛡️ Proteção de Streak Ativada</div>
                )}
              </div>
            </div>
          )}

          {/* Set Bonuses */}
          {(finalStats.active_set_bonuses?.length ?? 0) > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-widest text-purple-400">
                ✨ Bônus de Set
              </h4>
              {finalStats.active_set_bonuses?.map((sb) => (
                <div
                  key={sb.set_id}
                  className="rounded-lg bg-purple-500/10 p-3 border border-purple-500/20"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-300">
                      {sb.pieces_equipped} peça(s) equipada(s)
                    </span>
                  </div>
                  <div className="space-y-1 text-xs text-purple-200/80">
                    {sb.bonuses_active.flatMap((bonus, i) =>
                      Object.entries(bonus).map(([key, value]) => (
                        <div key={`${i}-${key}`}>
                          • {formatBonusKey(key, value)}
                        </div>
                      )),
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {!hasAnyBonus && (
            <div className="rounded-lg bg-zinc-500/10 p-3 text-center">
              <p className="text-xs text-zinc-400">
                Nenhum buff ativo no momento
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
