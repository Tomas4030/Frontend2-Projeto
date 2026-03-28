"use client";

import Link from "next/link";
import Image from "next/image";
import StatBar from "./StatBar";
import { Character, CLASS_AVATARS, CLASS_TITLE } from "./dashboardUtils";
import EquipmentPanel from "./equipment/EquipmentPanel";
import type { EquipmentSlots, FinalStats } from "@/types/equipment";

type Props = {
  character: Character | null;
  equipment: EquipmentSlots;
  finalStats: FinalStats;
  onSlotClick?: (slot: "weapon" | "armor" | "amulet") => void;
};

export default function CharacterPanel({
  character,
  equipment,
  finalStats,
  onSlotClick,
}: Props) {
  if (!character) {
    return (
      <div className="py-12 text-center">
        <Link href="/create-character" className="rpg-btn p-4 text-sm">
          CRIAR PERSONAGEM
        </Link>
      </div>
    );
  }

  return (
    <div className="border border-[#2a2540] bg-[#13111e] p-6 shadow-xl">
      <div className="relative mb-6 flex flex-col items-center">
        <div className="relative mb-4 flex h-24 w-24 items-center justify-center border-2 border-[#3a3558] bg-[#1a162e] shadow-[0_0_20px_rgba(245,197,66,0.1)]">
          <Image
            src={CLASS_AVATARS[character.class]}
            alt={character.class}
            width={80}
            height={80}
            className="h-20 w-20 object-contain"
            priority
          />

          <span className="absolute -bottom-3 -right-3 bg-[#f5c542] px-2 py-1 text-xs font-black uppercase tracking-tighter text-black shadow-md">
            LVL {character.level}
          </span>
        </div>

        <h3 className="text-xl font-bold uppercase tracking-tight text-[#f5c542]">
          {character.name}
        </h3>

        <p className="mt-1 text-xs uppercase tracking-[0.2em] text-[#cbd5e1]">
          {CLASS_TITLE[character.class]}
        </p>
      </div>

      <div className="mb-6 space-y-4">
        <StatBar
          label="HP"
          icon="♥"
          current={character.hp}
          max={character.max_hp}
          color="#ef4444"
          trackColor="#3d1010"
        />

        <StatBar
          label="MP"
          icon="✦"
          current={character.mp}
          max={character.max_mp}
          color="#3b82f6"
          trackColor="#0d1f3d"
        />

        <StatBar
          label="XP"
          icon="★"
          current={character.xp}
          max={100 * character.level}
          color="#f5c542"
          trackColor="#2d2205"
        />
      </div>

      <div className="grid grid-cols-2 gap-2 border-t border-[#2a2540] pt-5">
        {[
          { label: "FORÇA", val: character.forca },
          { label: "INTELIGÊNCIA", val: character.inteligencia },
          { label: "AGILIDADE", val: character.agilidade },
          { label: "FÉ", val: character.fe },
        ].map((attr) => (
          <div
            key={attr.label}
            className="border border-[#2a2540] bg-[#1a162e]/50 py-3 text-center transition-all duration-300"
          >
            <div className="mb-1 text-[10px] uppercase text-[#cbd5e1]">
              {attr.label}
            </div>
            <div className="text-base font-bold text-[#f5c542] transition-colors">
              {attr.val}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 border-t border-[#2a2540] pt-5">
        <EquipmentPanel
          character={character}
          equipment={equipment}
          finalStats={finalStats}
          onSlotClick={onSlotClick}
        />
      </div>
    </div>
  );
}
