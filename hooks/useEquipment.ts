import { useState, useEffect, useCallback } from "react";
import {
  getPlayerEquipment,
  getSetBonuses,
  calculateFinalStats,
} from "@/lib/equipment";
import type { EquipmentSlots, SetBonus, FinalStats } from "@/types/equipment";
import type { Character } from "@/components/dashboard/dashboardUtils";

interface UseEquipmentReturn {
  equipment: EquipmentSlots;
  setBonus: SetBonus[];
  finalStats: FinalStats | null;
  loadingEquipment: boolean;
  refreshEquipment: () => Promise<void>;
}

// Stats neutros para quando não há equipamento carregado
const DEFAULT_FINAL_STATS = (character: Character): FinalStats => ({
  final_forca: character.forca,
  final_inteligencia: character.inteligencia,
  final_hp_max: character.max_hp,
  final_mp_max: character.max_mp,
  final_xp_multiplier: 1.0,
  final_gold_multiplier: 1.0,
  final_boss_damage_bonus: 0,
  has_streak_protection: false,
  active_set_bonuses: [],
});

export function useEquipment(character: Character | null): UseEquipmentReturn {
  const [equipment, setEquipment] = useState<EquipmentSlots>({
    weapon: null,
    armor: null,
    amulet: null,
  });
  const [setBonus, setSetBonus] = useState<SetBonus[]>([]);
  const [finalStats, setFinalStats] = useState<FinalStats | null>(null);
  const [loadingEquipment, setLoadingEquipment] = useState(false);

  const refreshEquipment = useCallback(async () => {
    if (!character) return;
    setLoadingEquipment(true);
    try {
      const [eq, sb] = await Promise.all([
        getPlayerEquipment(character.id),
        getSetBonuses(),
      ]);
      setEquipment(eq);
      setSetBonus(sb);
      setFinalStats(calculateFinalStats(character, eq, sb));
    } catch (e: any) {
      console.error("useEquipment error:", e.message);
      setFinalStats(DEFAULT_FINAL_STATS(character));
    } finally {
      setLoadingEquipment(false);
    }
  }, [character]);

  useEffect(() => {
    if (character) refreshEquipment();
  }, [character?.id]); // só re-fetch quando muda de character

  // Recalcula stats quando o character muda (level up, etc.) sem re-fetch
  useEffect(() => {
    if (character && setBonus.length >= 0) {
      setFinalStats(calculateFinalStats(character, equipment, setBonus));
    }
  }, [character?.forca, character?.inteligencia, character?.max_hp, character?.max_mp]);

  return { equipment, setBonus, finalStats, loadingEquipment, refreshEquipment };
}
