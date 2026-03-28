"use client";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

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

  return (
    <div className="mt-5 flex items-center justify-center gap-2">
      <button
        type="button"
        onClick={() => page > 1 && onPageChange(page - 1)}
        disabled={page === 1}
        className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-zinc-300 transition hover:border-yellow-400/30 hover:text-yellow-300 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Anterior
      </button>

      {Array.from({ length: totalPages }).map((_, index) => {
        const pageNumber = index + 1;
        const isActive = pageNumber === page;

        return (
          <button
            key={pageNumber}
            type="button"
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

      <button
        type="button"
        onClick={() => page < totalPages && onPageChange(page + 1)}
        disabled={page === totalPages}
        className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-zinc-300 transition hover:border-yellow-400/30 hover:text-yellow-300 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Próxima
      </button>
    </div>
  );
}
