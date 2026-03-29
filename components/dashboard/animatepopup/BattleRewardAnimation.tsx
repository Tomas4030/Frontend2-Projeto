"use client";

import React, { useEffect, useState } from "react";
import {
  Coins,
  Sparkles,
  TriangleAlert,
  Crown,
  Heart,
  Droplets,
} from "lucide-react";

type RewardType = "xp" | "hp" | "lvl" | "dmg";

type RewardToast = {
  msg: string;
  type: RewardType;
};

type Particle = {
  id: string;
  label: string;
  type: RewardType;
};

type Props = {
  reward: RewardToast | null;
};

const REWARD_POSITIONS = [
  { x: -220, y: -90 },
  { x: 0, y: -125 },
  { x: 220, y: -90 },
  { x: -120, y: -10 },
  { x: 120, y: -10 },
];

export default function BattleRewardAnimation({ reward }: Props) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!reward?.msg) {
      setParticles([]);
      return;
    }

    const parts = reward.msg
      .split("•")
      .map((part) => part.trim())
      .filter(Boolean);

    const now = Date.now();

    const nextParticles: Particle[] = parts.map((label, index) => ({
      id: `${reward.type}-${now}-${index}-${Math.random()}`,
      label,
      type: reward.type,
    }));

    setParticles(nextParticles);

    const timer = window.setTimeout(() => {
      setParticles([]);
    }, 5300);

    return () => window.clearTimeout(timer);
  }, [reward]);

  if (particles.length === 0) return null;

  const getIcon = (label: string, type: RewardType) => {
    const lower = label.toLowerCase();

    if (lower.includes("gold")) return <Coins className="h-4 w-4 shrink-0" />;
    if (lower.includes("xp")) return <Sparkles className="h-4 w-4 shrink-0" />;
    if (lower.includes("hp")) return <Heart className="h-4 w-4 shrink-0" />;
    if (lower.includes("mp")) return <Droplets className="h-4 w-4 shrink-0" />;
    if (type === "lvl") return <Crown className="h-4 w-4 shrink-0" />;
    if (type === "dmg") return <TriangleAlert className="h-4 w-4 shrink-0" />;

    return <Sparkles className="h-4 w-4 shrink-0" />;
  };

  const getColor = (type: RewardType) => {
    switch (type) {
      case "dmg":
        return "text-rose-400";
      case "lvl":
        return "text-yellow-300";
      case "hp":
        return "text-emerald-300";
      case "xp":
      default:
        return "text-cyan-300";
    }
  };

  const getBg = (type: RewardType) => {
    switch (type) {
      case "dmg":
        return "bg-rose-950/40 border border-rose-400/25";
      case "lvl":
        return "bg-yellow-950/30 border border-yellow-400/25";
      case "hp":
        return "bg-emerald-950/30 border border-emerald-400/25";
      case "xp":
      default:
        return "bg-cyan-950/30 border border-cyan-400/25";
    }
  };

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[999] overflow-hidden"
    >
      {particles.map((particle, index) => {
        const pos = REWARD_POSITIONS[index % REWARD_POSITIONS.length];

        return (
          <div
            key={particle.id}
            className={`absolute left-1/2 top-1/2 flex items-center gap-2 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-extrabold uppercase tracking-wide drop-shadow-[0_0_12px_rgba(0,0,0,0.45)] ${getColor(
              particle.type,
            )} ${getBg(particle.type)}`}
            style={
              {
                "--start-x": `${pos.x}px`,
                "--start-y": `${pos.y}px`,
                animation: `rewardFloatSpread 5.3s ease-out forwards, rewardFade 2s ease-out 1.9s forwards`,
                animationDelay: `${index * 220}ms`,
              } as React.CSSProperties
            }
          >
            {getIcon(particle.label, particle.type)}
            <span>{particle.label}</span>
          </div>
        );
      })}

      <style jsx>{`
        @keyframes rewardFloatSpread {
          0% {
            transform: translate(calc(-50% + var(--start-x)), calc(-50% + var(--start-y))) scale(0.96);
            opacity: 0;
          }
          15% {
            transform: translate(calc(-50% + var(--start-x)), calc(-50% + var(--start-y) - 8px)) scale(1);
            opacity: 1;
          }
          60% {
            transform: translate(calc(-50% + var(--start-x)), calc(-50% + var(--start-y) - 52px)) scale(1.03);
            opacity: 1;
          }
          100% {
            transform: translate(calc(-50% + var(--start-x)), calc(-50% + var(--start-y) - 110px)) scale(0.98);
            opacity: 0.9;
          }
        }

        @keyframes rewardFade {
          0% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}