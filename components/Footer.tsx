"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
const formattedDate = new Intl.DateTimeFormat("pt-BR", {
  year: "numeric",
}).format(new Date());

const Footer = () => {
  const pathname = usePathname();
  const hideFooter = pathname === "/login" || pathname === "/register";
  if (hideFooter) return null;
  return (
    <footer className="w-full mt-auto">
      <div className="text-white py-4 container mx-auto">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <p className="text-sm">
            &copy; {formattedDate} Veydral. Todos os direitos reservados.
          </p>
          <p className="text-xs mt-2">Veydral</p>
        </div>
      </div>
      {/* Imagem full width */}
      <div className="relative w-full h-48">
        <Image
          src="https://habitica.com/assets/midground_foreground_extended2-BDqZdEwW.png"
          alt="Descrição da imagem"
          fill
          className="object-cover"
          priority
        />
      </div>
    </footer>
  );
};

export { Footer };
