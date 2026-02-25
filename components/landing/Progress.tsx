"use client";

import { motion } from "framer-motion";
import { Star, User, Flame, Trophy, Coins, Shield } from "lucide-react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const gamifiedItems = [
  {
    icon: Star,
    title: "Sistema de Níveis",
    description:
      "Sobe de nível ao completar tarefas. Cada nível desbloqueia novas funcionalidades e recompensas.",
    xp: 75,
  },
  {
    icon: User,
    title: "Avatar & Personalização",
    description:
      "Cria e personaliza o teu avatar. Equipa itens ganhos nas tuas missões diárias.",
    xp: 60,
  },
  {
    icon: Flame,
    title: "Streaks & Desafios",
    description:
      "Mantém a tua sequência de dias ativos. Desafios semanais para bónus extra de XP.",
    xp: 90,
  },
  {
    icon: Coins,
    title: "Moedas & Loja",
    description:
      "Ganha moedas de ouro e gasta-as em itens, equipamentos e poder-ups para o teu personagem.",
    xp: 45,
  },
  {
    icon: Trophy,
    title: "Conquistas",
    description:
      "Desbloqueia conquistas ao atingir marcos importantes. Mostra-as no teu perfil.",
    xp: 85,
  },
  {
    icon: Shield,
    title: "Guilds & Social",
    description:
      "Junta-te a guilds, compete com amigos e participa em missões cooperativas.",
    xp: 55,
  },
];

const GamifiedSection = () => {
  return (
    <section id="gamificacao" className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-xl md:text-2xl lg:text-3xl mb-4 text-foreground pixel-shadow">
            Características <span className="text-accent">Gamificadas</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Tudo o que precisas para transformar a tua rotina numa aventura
            épica.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {gamifiedItems.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="h-full"
            >
              <Card className="flex flex-col h-full group hover:border-accent/50 transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="bg-accent/10 w-12 h-12 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <item.icon className="h-6 w-6 text-accent" />
                    </div>
                    <span className="font-pixel text-[10px] text-primary">
                      Nv.{i + 1}
                    </span>
                  </div>

                  <CardTitle className="font-pixel text-xs mt-4">
                    {item.title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="flex flex-col flex-1">
                  <CardDescription className="text-sm leading-relaxed mb-4">
                    {item.description}
                  </CardDescription>

                  {/* Empurra a barra para o fundo */}
                  <div className="mt-auto">
                    <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-primary"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${item.xp}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      />
                    </div>

                    <p className="text-[10px] text-muted-foreground mt-1 text-right">
                      {item.xp}% XP
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GamifiedSection;
