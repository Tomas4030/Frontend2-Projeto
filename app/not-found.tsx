// app/not-found.jsx (ou pages/404.jsx)

"use client";

import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="fixed inset-0 min-h-screen bg-background flex items-center justify-center p-4 z-50">
      <div className="max-w-md w-full text-center">
        {/* Error Code */}
        <div className="text-8xl font-bold text-slate-700 mb-4">404</div>

        {/* Title */}
        <h1 className="text-2xl font-semibold text-white mb-3">
          Missão não encontrada
        </h1>

        <p className="text-slate-400 mb-8">
          Esta página não existe no teu mapa de objetivos.
        </p>

        {/* Stats */}
        <div className="flex gap-4 justify-center mb-8">
          <div className="text-center">
            <div className="text-slate-500 text-sm">XP Perdido</div>
            <div className="text-red-400 font-bold">-10</div>
          </div>
          <div className="w-px bg-slate-800"></div>
          <div className="text-center">
            <div className="text-slate-500 text-sm">Streak</div>
            <div className="text-green-400 font-bold">Mantido</div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => router.push("/")}
            className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition"
          >
            Voltar ao Dashboard
          </button>

          <button
            onClick={() => router.back()}
            className="w-full px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-lg transition"
          >
            Voltar
          </button>
        </div>
      </div>
    </div>
  );
}
