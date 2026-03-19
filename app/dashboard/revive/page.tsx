"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Skull, HeartPulse, Trash2, AlertCircle, Loader2 } from "lucide-react";

export default function RevivePage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [confirmRestart, setConfirmRestart] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
      else router.push("/login");
    };
    fetchUser();
  }, [supabase, router]);

  const handleRevive = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from("characters")
        .update({ hp: 100 })
        .eq("user_id", userId);

      if (error) throw error;

      router.push("/dashboard");
    } catch (err) {
      console.error("Erro ao reviver:", err);
      alert("Erro ao canalizar energia vital. Tenta novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleRestart = async () => {
    if (!userId || loading) return;

    if (!confirmRestart) {
      setConfirmRestart(true);
      return;
    }

    setLoading(true);

    try {
      const { error: tasksError } = await supabase
        .from("tasks")
        .delete()
        .eq("user_id", userId);

      if (tasksError) throw tasksError;

      const { error: charError } = await supabase
        .from("characters")
        .delete()
        .eq("user_id", userId);

      if (charError) throw charError;

      console.log("Mundo resetado com sucesso.");

      router.refresh();

      router.push("/create-character");
    } catch (error) {
      console.error("Erro no reset total:", error);
      alert(
        "O abismo recusou-se a apagar a tua alma. Verifica as permissões de DELETE no Supabase.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] text-white p-6 relative overflow-hidden font-mono">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#3b0707_0%,_transparent_70%)] opacity-40" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full z-10"
      >
        <div className="text-center space-y-6">
          <motion.div
            animate={{ scale: [1, 1.05, 1], rotate: [0, -3, 3, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="inline-block p-6 rounded-full bg-red-500/10 border border-red-500/30 mb-2"
          >
            <Skull className="w-16 h-16 text-red-600" strokeWidth={1.5} />
          </motion.div>

          <div className="space-y-2">
            <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none">
              Fim da Linha
            </h1>
            <p className="text-zinc-500 font-medium tracking-wide">
              O destino do teu herói está nas tuas mãos.
            </p>
          </div>

          <div className="grid gap-4 mt-12">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleRevive}
              disabled={loading}
              className="relative group flex items-center justify-between p-5 bg-gradient-to-r from-amber-600 to-amber-500 text-black font-extrabold rounded-2xl shadow-[0_10px_20px_-10px_rgba(245,158,11,0.5)] disabled:opacity-50 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-black/10 rounded-lg">
                  <HeartPulse className="w-6 h-6 animate-pulse" />
                </div>
                <div className="text-left">
                  <span className="block text-lg leading-tight uppercase">
                    Reviver Herói
                  </span>
                  <span className="text-[10px] font-bold opacity-70 uppercase tracking-widest text-amber-950">
                    Mantém todo o progresso
                  </span>
                </div>
              </div>
              <span className="text-xl">€0.99</span>
            </motion.button>

            <div className="relative pt-4">
              <button
                onClick={handleRestart}
                disabled={loading}
                className={`w-full flex items-center justify-center gap-3 p-4 rounded-2xl font-bold transition-all duration-300 border ${
                  confirmRestart
                    ? "bg-red-600 border-red-400 text-white animate-pulse"
                    : "bg-zinc-900/50 border-zinc-800 text-zinc-500 hover:text-red-400 hover:border-red-900"
                }`}
              >
                {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : confirmRestart ? (
                  <>
                    <AlertCircle className="w-5 h-5" />
                    CONFIRMAR: APAGAR TUDO?
                  </>
                ) : (
                  <>
                    <Trash2 className="w-5 h-5 opacity-50" />
                    ACEITAR A MORTE PERMANENTE
                  </>
                )}
              </button>

              <AnimatePresence>
                {confirmRestart && (
                  <motion.button
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setConfirmRestart(false)}
                    className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] text-zinc-600 underline uppercase tracking-tighter hover:text-zinc-400"
                  >
                    Mudei de ideias (Cancelar)
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>

          <footer className="pt-20">
            <p className="text-[9px] text-zinc-700 uppercase tracking-[0.4em] font-bold">
              Todas as ações são irreversíveis
            </p>
          </footer>
        </div>
      </motion.div>
    </div>
  );
}
