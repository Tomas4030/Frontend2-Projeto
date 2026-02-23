"use client";

import { motion } from "framer-motion";
import {
  Card,
  CardTitle,
  CardDescription,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { BorderBeam } from "@/components/lightswind/border-beam";

type ElementType = "fire" | "ice" | "electric" | "water";

const elementStyles: Record<ElementType, string> = {
  fire: "from-orange-500 via-red-500 to-yellow-400",
  ice: "from-cyan-400 via-blue-300 to-white",
  electric: "from-purple-500 via-pink-500 to-cyan-400",
  water: "from-blue-500 via-cyan-400 to-blue-300",
};

const features: {
  icon: string;
  title: string;
  desc: string;
  element: ElementType;
  reverse?: boolean;
}[] = [
  {
    icon: "⚔️",
    title: "Missões",
    desc: "As tuas tarefas diárias transformam-se em missões épicas com recompensas em XP e moedas.",
    element: "fire",
    reverse: true,
  },
  {
    icon: "⭐",
    title: "XP & Níveis",
    desc: "Cada missão concluída dá-te XP. Acumula pontos, sobe de nível e desbloqueia novas habilidades.",
    element: "ice",
    reverse: false,
  },
  {
    icon: "🧠",
    title: "Atributos",
    desc: "Desenvolve 5 atributos: Saúde, Mente, Carreira, Social e Criatividade. Torna-te um herói completo.",
    element: "electric",
    reverse: true,
  },
  {
    icon: "📊",
    title: "Progresso",
    desc: "Visualiza a tua evolução com gráficos detalhados. Vê como cresceste ao longo do tempo.",
    element: "water",
    reverse: false,
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-24 px-6" id="features">
      <div className="container mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-rpg text-lg sm:text-xl text-foreground mb-4">
            Como Funciona?
          </h2>
          <p className="font-body text-muted-foreground max-w-xl mx-auto">
            Quatro pilares para transformar a tua vida numa aventura épica
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((item, i) => (
            <Card
              key={i}
              className="relative overflow-hidden rounded-xl bg-background"
            >
              {/* 🔥 Borda Animada */}
              <BorderBeam
                size={250}
                duration={6}
                className={`absolute inset-0 rounded-xl ${elementStyles[item.element]}`}
                reverse={item.reverse}
              />

              {/* Conteúdo */}
              <motion.div
                className="p-6 text-center group relative z-10"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <CardHeader className="text-5xl mb-4 group-hover:scale-110 transition-transform">
                  {item.icon}
                </CardHeader>

                <CardContent>
                  <CardTitle className="font-rpg text-lg mb-3 text-foreground">
                    {item.title}
                  </CardTitle>

                  <CardDescription className="text-sm text-muted-foreground leading-relaxed">
                    {item.desc}
                  </CardDescription>
                </CardContent>
              </motion.div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
