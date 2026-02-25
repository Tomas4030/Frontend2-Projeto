"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Sparkles, Lightbulb } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="gradient-hero pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden flex items-center min-h-screen">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
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
          </motion.div>

          {/* Right image */}
          <motion.div
            animate={{ y: -16 }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "mirror",
              ease: "easeInOut",
            }}
            className="relative"
          >
            <div className="hidden rpg-border overflow-hidden animate-float w-full h-64 md:block lg:h-100 rounded-lg">
              <Image
                src="/static/hero.png"
                alt="QuestLife - Mundo RPG gamificado"
                fill // ocupa todo o container
                className="object-cover rounded-lg"
                priority
              />
            </div>

            {/* Floating XP badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="hidden md:block absolute -bottom-4 -left-4 bg-card rpg-border px-4 py-3 rounded-lg"
            >
              <p className="font-pixel text-[10px] text-primary">+250 XP</p>
              <p className="text-xs text-muted-foreground">Missão completa!</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
