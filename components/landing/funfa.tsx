"use client";

import { motion } from "framer-motion";



const Funfa = () => {
    return (
        <section className="py-24 px-6" id="features">
        <div className="container mx-auto">
          <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="font-rpg text-lg sm:text-xl text-foreground mb-4">Como Funciona?</h2>
            <p className="font-body text-muted-foreground max-w-xl mx-auto">Quatro pilares para transformar a tua vida numa aventura épica</p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: "⚔️", title: "Missões", desc: "As tuas tarefas diárias transformam-se em missões épicas com recompensas em XP e moedas.", color: "text-primary" },
              { icon: "⭐", title: "XP & Níveis", desc: "Cada missão concluída dá-te XP. Acumula pontos, sobe de nível e desbloqueia novas habilidades.", color: "text-accent" },
              { icon: "🧠", title: "Atributos", desc: "Desenvolve 5 atributos: Saúde, Mente, Carreira, Social e Criatividade. Torna-te um herói completo.", color: "text-mind" },
              { icon: "📊", title: "Progresso", desc: "Visualiza a tua evolução com gráficos detalhados. Vê como cresceste ao longo do tempo.", color: "text-xp" },
            ].map((item, i) => (
              <motion.div key={i} className="card-rpg p-6 text-center hover:border-primary/40 transition-all duration-300 group" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} whileHover={{ y: -4 }}>
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">{item.icon}</div>
                <h3 className="font-rpg text-xs text-foreground mb-3">{item.title}</h3>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    )
}
export default Funfa;