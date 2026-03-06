"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Sparkles, Lightbulb } from "lucide-react";

const HeroSection = () => {
  return (
    <section className=" pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden flex items-center min-h-screen">
      <style jsx>{`
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-40px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes floatY {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-16px);
          }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-in {
          animation: slideInLeft 0.7s ease-out forwards;
        }
        .animate-float-y {
          animation: floatY 4s ease-in-out infinite;
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.5s ease-out 0.8s forwards;
          opacity: 0;
        }
      `}</style>
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div className="animate-slide-in">
            <h1 className="text-2xl md:text-4xl lg:text-5xl leading-tight mb-6 pixel-shadow text-foreground">
              Transforma a tua vida num{" "}
              <span className="text-primary">RPG épico</span>
            </h1>

            <p className="text-base md:text-lg text-muted-foreground mb-8 max-w-lg leading-relaxed">
              Completa tarefas, ganha XP, sobe de nível e desbloqueia
              recompensas. Cada hábito é uma missão. Cada dia é uma nova
              aventura.
            </p>

            <div className="flex flex-wrap gap-4">
              <Button variant="default" size="lg" className="text-sm">
                <Sparkles className="h-4 w-4 mr-1" />
                Começar Aventura
              </Button>
              <Button variant="secondary" size="lg" className="text-sm">
                <Lightbulb className="h-4 w-4 mr-1" />
                Descobrir Inspiração
              </Button>
            </div>

            {/* Stats */}
            <div className="flex gap-8 mt-10">
              {[
                { value: "10K+", label: "Aventureiros" },
                { value: "1M+", label: "Missões" },
                { value: "99%", label: "Motivação" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="font-pixel text-sm text-accent">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right image */}
          <div className="relative animate-float-y">
            <div className="hidden rpg-border overflow-hidden w-full h-64 md:block lg:h-100 rounded-lg">
              <Image
                src="https://res.cloudinary.com/dgwn9kjrb/image/upload/w_600,q_80,f_auto/z7wrih3iwibodxpwoins.png"
                alt="QuestLife - Mundo RPG gamificado"
                fill
                className="object-cover rounded-lg"
                priority
                fetchPriority="high"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 600px"
              />
            </div>

            {/* Floating XP badge */}
            <div className="hidden md:block absolute -bottom-4 -left-4 bg-card rpg-border px-4 py-3 rounded-lg animate-fade-in-up">
              <p className="font-pixel text-[10px] text-primary">+250 XP</p>
              <p className="text-xs text-muted-foreground">Missão completa!</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
