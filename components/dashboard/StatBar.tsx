import React from "react";

type Props = {
  label: string;
  icon: string;
  current: number;
  max: number;
  color: string;
  trackColor: string;
};

export default function StatBar({ label, icon, current, max, color }: Props) {
  const percent = Math.min(Math.round(current / max * 100), 100);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span
          className="text-xs font-black tracking-widest flex items-center gap-2"
          style={{ color }}>
          
          <span className="text-sm">{icon}</span> {label}
        </span>
        <span className="text-xs font-bold text-[#cbd5e1]">
          {current} / {max}
        </span>
      </div>
      <div className="h-3 w-full bg-black/40 border border-[#2a2540] p-[2px]">
        <div
          className="h-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(0,0,0,0.5)]"
          style={{ width: `${percent}%`, backgroundColor: color }} />
        
      </div>
    </div>);

}