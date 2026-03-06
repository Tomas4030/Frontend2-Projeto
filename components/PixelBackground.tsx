"use client";

import { useEffect, useState } from "react";

type Star = {
  x: number;
  y: number;
  delay: number;
  size: number;
};

export default function PixelBackground() {
  const [stars, setStars] = useState<Star[]>([]);

  useEffect(() => {
    // Reduced from 40 to 20 stars for better performance
    const generatedStars = Array.from({ length: 20 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 3,
      size: Math.random() > 0.7 ? 3 : 2,
    }));

    setStars(generatedStars);
  }, []);

  return (
    <>
      <style jsx global>{`
        :root {
          --pixel-black: #0a0a0f;
          --pixel-border: #2d2d4e;
          --pixel-text: #e8e8ff;
        }

        .pixel-background {
          position: fixed;
          inset: 0;
          background: var(--pixel-black);
          overflow: hidden;
          z-index: -1;
        }

        /* Grid background */
        .bg-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(45, 45, 78, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(45, 45, 78, 0.3) 1px, transparent 1px);
          background-size: 32px 32px;
        }

        /* Stars */
        .pixel-star {
          position: absolute;
          background: var(--pixel-text);
          animation: starBlink 2s infinite;
          will-change: opacity;
          contain: strict;
        }

        @keyframes starBlink {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.2;
          }
        }

        /* CRT scanlines */
        .pixel-background::before {
          content: "";
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0, 0, 0, 0.07) 2px,
            rgba(0, 0, 0, 0.07) 4px
          );
          pointer-events: none;
        }

        /* vignette */
        .pixel-background::after {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(
            ellipse at center,
            transparent 60%,
            rgba(0, 0, 0, 0.6) 100%
          );
          pointer-events: none;
        }
      `}</style>

      <div className="pixel-background">
        <div className="bg-grid" />

        {stars.map((star, i) => (
          <div
            key={i}
            className="pixel-star"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              animationDelay: `${star.delay}s`,
            }}
          />
        ))}
      </div>
    </>
  );
}
