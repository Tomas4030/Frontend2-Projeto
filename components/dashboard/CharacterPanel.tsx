import React from "react";
import Link from "next/link";
import StatBar from "./StatBar";
import { Character, CLASS_AVATARS, CLASS_TITLE } from "./dashboardUtils";

type Props = { character: Character | null };

export default function CharacterPanel({ character }: Props) {
  if (!character) {
    return (
      <div className="text-center py-12">
        <Link href="/create-character" className="rpg-btn text-sm p-4">
          CRIAR PERSONAGEM
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#13111e] border border-[#2a2540] p-6 shadow-xl">
      <div className="relative mb-6 flex flex-col items-center">
        <div className="w-24 h-24 bg-[#1a162e] border-2 border-[#3a3558] flex items-center justify-center mb-4 relative shadow-[0_0_20px_rgba(245,197,66,0.1)]">
          <img src={CLASS_AVATARS[character.class]} alt={character.class} className="w-20 h-20 object-contain" />
          <span className="absolute -bottom-3 -right-3 bg-[#f5c542] text-black text-xs font-black px-2 py-1 uppercase tracking-tighter shadow-md">
            LVL {character.level}
          </span>
        </div>
        <h3 className="text-[#f5c542] text-xl uppercase tracking-tight font-bold">{character.name}</h3>
        <p className="text-[#6b6480] text-xs tracking-[0.2em] uppercase mt-1">{CLASS_TITLE[character.class]}</p>
      </div>

      <div className="space-y-4 mb-6">
        <StatBar label="HP" icon="♥" current={character.hp} max={character.max_hp} color="#ef4444" trackColor="#3d1010" />
        <StatBar label="MP" icon="✦" current={character.mp} max={character.max_mp} color="#3b82f6" trackColor="#0d1f3d" />
        <StatBar label="XP" icon="★" current={character.xp} max={100 * character.level} color="#f5c542" trackColor="#2d2205" />
      </div>

      <div className="grid grid-cols-3 gap-3 border-t border-[#2a2540] pt-5">
        {[{ label: "FOR", val: 12 }, { label: "INT", val: 8 }, { label: "DES", val: 10 }].map(s => (
          <div key={s.label} className="text-center bg-[#1a162e]/50 border border-[#2a2540] py-3">
            <div className="text-[10px] text-[#6b6480] uppercase mb-1">{s.label}</div>
            <div className="text-[#f5c542] text-base font-bold">{s.val}</div>
          </div>
        ))}
      </div>
    </div>
  );
}