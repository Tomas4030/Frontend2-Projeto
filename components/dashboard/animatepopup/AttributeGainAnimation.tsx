"use client";

import React, { useEffect, useState } from "react";
import { Zap, Heart, Wind, Brain } from "lucide-react";

type AttributeGain = {
  forca: number;
  inteligencia: number;
  agilidade: number;
  fe: number;
};

type Particle = {
  id: string;
  attribute: keyof AttributeGain;
  amount: number;
};

type Props = {
  gains: AttributeGain | null;
  isDefeat?: boolean;
};

const ATTRIBUTE_POSITIONS = [
  { x: -170, y: 20 },
  { x: 170, y: 10 },
  { x: -110, y: 110 },
  { x: 110, y: 100 },
];

export default function AttributeGainAnimation({
  gains,
  isDefeat = false,
}: Props) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!gains) {
      setParticles([]);
      return;
    }

    const hasAnyGain =
      gains.forca !== 0 ||
      gains.inteligencia !== 0 ||
      gains.agilidade !== 0 ||
      gains.fe !== 0;

    if (!hasAnyGain) {
      setParticles([]);
      return;
    }

    const now = Date.now();

    const nextParticles: Particle[] = [];

    if (gains.forca !== 0) {
      nextParticles.push({
        id: `forca-${now}-${Math.random()}`,
        attribute: "forca",
        amount: gains.forca,
      });
    }

    if (gains.inteligencia !== 0) {
      nextParticles.push({
        id: `inteligencia-${now}-${Math.random()}`,
        attribute: "inteligencia",
        amount: gains.inteligencia,
      });
    }

    if (gains.agilidade !== 0) {
      nextParticles.push({
        id: `agilidade-${now}-${Math.random()}`,
        attribute: "agilidade",
        amount: gains.agilidade,
      });
    }

    if (gains.fe !== 0) {
      nextParticles.push({
        id: `fe-${now}-${Math.random()}`,
        attribute: "fe",
        amount: gains.fe,
      });
    }

    setParticles(nextParticles);

    const timer = window.setTimeout(() => {
      setParticles([]);
    }, 4200);

    return () => window.clearTimeout(timer);
  }, [gains, isDefeat]);

  if (particles.length === 0) return null;

  const getAttributeIcon = (attribute: keyof AttributeGain) => {
    switch (attribute) {
      case "forca":
        return <Zap className="h-4 w-4 shrink-0" />;
      case "inteligencia":
        return <Brain className="h-4 w-4 shrink-0" />;
      case "agilidade":
        return <Wind className="h-4 w-4 shrink-0" />;
      case "fe":
        return <Heart className="h-4 w-4 shrink-0" />;
    }
  };

  const getAttributeColor = (attribute: keyof AttributeGain) => {
    switch (attribute) {
      case "forca":
        return isDefeat ? "text-rose-400" : "text-orange-400";
      case "inteligencia":
        return isDefeat ? "text-violet-400" : "text-violet-300";
      case "agilidade":
        return isDefeat ? "text-cyan-400" : "text-cyan-300";
      case "fe":
        return isDefeat ? "text-pink-400" : "text-pink-300";
      default:
        return "text-white";
    }
  };

  const getAttributeLabel = (attribute: keyof AttributeGain) => {
    const labels: Record<keyof AttributeGain, string> = {
      forca: "Força",
      inteligencia: "Inteligência",
      agilidade: "Agilidade",
      fe: "Fé",
    };

    return labels[attribute];
  };

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[999] overflow-hidden"
    >
      {particles.map((particle, index) => {
        const pos = ATTRIBUTE_POSITIONS[index % ATTRIBUTE_POSITIONS.length];

        return (
          <div
            key={particle.id}
            className={`absolute left-1/2 top-1/2 flex items-center gap-2 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-extrabold drop-shadow-[0_0_10px_rgba(0,0,0,0.5)] ${getAttributeColor(
              particle.attribute,
            )}`}
            style={
              {
                "--start-x": `${pos.x}px`,
                "--start-y": `${pos.y}px`,
                animation: `attributeFloatSpread 3.2s ease-out forwards, attributeFade 2s ease-out 1.8s forwards`,
                animationDelay: `${index * 180}ms`,
              } as React.CSSProperties
            }
          >
            {getAttributeIcon(particle.attribute)}
            <span>
              {isDefeat ? "-" : "+"}
              {Math.abs(particle.amount)} {getAttributeLabel(particle.attribute)}
            </span>
          </div>
        );
      })}

      <style jsx>{`
        @keyframes attributeFloatSpread {
          0% {
            transform: translate(calc(-50% + var(--start-x)), calc(-50% + var(--start-y))) scale(0.94);
            opacity: 0;
          }
          15% {
            transform: translate(calc(-50% + var(--start-x)), calc(-50% + var(--start-y) - 10px)) scale(1);
            opacity: 1;
          }
          55% {
            transform: translate(calc(-50% + var(--start-x)), calc(-50% + var(--start-y) - 55px)) scale(1.04);
            opacity: 1;
          }
          100% {
            transform: translate(calc(-50% + var(--start-x)), calc(-50% + var(--start-y) - 115px)) scale(0.98);
            opacity: 0.92;
          }
        }

        @keyframes attributeFade {
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