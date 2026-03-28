import { useEffect, useCallback, useState, useRef } from "react";
import type { Character } from "@/components/dashboard/dashboardUtils";
import { createClient } from "@/lib/supabase/client";
import {
  shouldRegenerate,
  calculateActiveManaBoosts,
  type ManaBoost,
} from "@/lib/mana-regeneration";

export function useManaRegeneration(character: Character | null) {
  const supabase = createClient();
  const [manaBoosts, setManaBoosts] = useState<ManaBoost[]>([]);
  const [lastRegenTime, setLastRegenTime] = useState<string | null>(null);
  const characterRef = useRef(character);

  // Update ref when character changes
  useEffect(() => {
    characterRef.current = character;
  }, [character]);

  // Fetch active mana boosts from the character
  const fetchManaBoosts = useCallback(async () => {
    if (!characterRef.current) return;

    try {
      const { data, error } = await supabase
        .from("mana_boosts")
        .select("*")
        .eq("character_id", characterRef.current.id)
        .gt("expires_at", new Date().toISOString());

      if (error) {
        console.error("Erro ao carregar boosts de mana:", error);
        return;
      }

      setManaBoosts((data as ManaBoost[]) || []);
    } catch (err) {
      console.error("Erro ao carregar mana_boosts:", err);
    }
  }, [supabase]);

  // Apply pending mana regeneration
  const applyPendingRegeneration = useCallback(async () => {
    if (!characterRef.current || !shouldRegenerate(lastRegenTime)) return;

    try {
      const { totalRestoration } = calculateActiveManaBoosts(manaBoosts);

      if (totalRestoration <= 0) return;

      // Calculate new mana value
      const newMp = Math.min(
        characterRef.current.max_mp,
        characterRef.current.mp + totalRestoration,
      );

      // Only update if there's an actual change
      if (newMp === characterRef.current.mp) return;

      const { error } = await supabase
        .from("characters")
        .update({ mp: newMp })
        .eq("id", characterRef.current.id);

      if (!error) {
        setLastRegenTime(new Date().toISOString());
        console.log(
          `[Mana Regen] Regenerado +${totalRestoration} (${newMp}/${characterRef.current.max_mp})`,
        );
      }
    } catch (err) {
      console.error("Erro ao aplicar regeneração de mana:", err);
    }
  }, [lastRegenTime, manaBoosts, supabase]);

  // Check for mana regeneration every minute
  useEffect(() => {
    if (!character) return;

    const checkManaRegen = async () => {
      await fetchManaBoosts();
      await applyPendingRegeneration();
    };

    // Initial check
    checkManaRegen();

    // Set up interval
    const interval = setInterval(checkManaRegen, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [character, fetchManaBoosts, applyPendingRegeneration]);

  return {
    manaBoosts,
    hasActiveManaBoosts: manaBoosts.length > 0,
    refetchBoosts: fetchManaBoosts,
  };
}
