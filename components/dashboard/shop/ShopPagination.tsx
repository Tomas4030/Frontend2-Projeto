"use client";

type Props = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export default function ShopPagination({
  page,
  totalPages,
  onPageChange,
}: Props) {
  if (totalPages <= 1) return null;

  const safePage = Math.max(1, Math.min(page, totalPages));

  let startPage = safePage;

  if (safePage === totalPages) {
    startPage = totalPages - 1;
  }

  if (startPage < 1) startPage = 1;

  const visiblePages =
    totalPages <= 2
      ? Array.from({ length: totalPages }, (_, i) => i + 1)
      : [startPage, startPage + 1];

  return (
    <div className="mt-5 flex items-center justify-center gap-2">
      {/* ⬅ VOLTAR */}
      <button
        onClick={() => onPageChange(safePage - 1)}
        disabled={safePage === 1}
        className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-bold text-zinc-300 transition hover:border-yellow-400/30 hover:text-yellow-300 disabled:opacity-40"
      >
        ←
      </button>

      {visiblePages.map((pageNumber) => {
        const isActive = pageNumber === safePage;

        return (
          <button
            key={pageNumber}
            onClick={() => onPageChange(pageNumber)}
            className={`min-w-9 rounded-lg border px-3 py-2 text-xs font-bold transition ${
              isActive
                ? "border-yellow-400/40 bg-yellow-400 text-black"
                : "border-white/10 bg-white/5 text-zinc-300 hover:border-yellow-400/30 hover:text-yellow-300"
            }`}
          >
            {pageNumber}
          </button>
        );
      })}

      {/* ➡ AVANÇAR */}
      <button
        onClick={() => onPageChange(safePage + 1)}
        disabled={safePage === totalPages}
        className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-bold text-zinc-300 transition hover:border-yellow-400/30 hover:text-yellow-300 disabled:opacity-40"
      >
        →
      </button>
    </div>
  );
}
