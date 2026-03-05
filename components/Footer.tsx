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
    <footer className="w-full mt-auto relative overflow-hidden">
      {/* Container do Texto: 
          Usamos z-10 e relative para garantir que o texto fique ACIMA da imagem.
      */}
      <div className="container mx-auto px-4 relative z-10 pt-10">
        <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-white/10 pb-4">
          <p className="text-sm text-white drop-shadow-md">
            &copy; {formattedDate} <span className="font-bold">Veydral</span>. Todos os direitos reservados.
          </p>
          <p className="text-xs text-white/50 uppercase tracking-widest">
            Veydral
          </p>
        </div>
      </div>

      {/* Container da Imagem:
          -mt-12 faz a imagem "subir" e entrar na área do texto.
          z-0 mantém a imagem por baixo.
      */}
      <div className="relative w-full h-48 -mt-12 z-0">
        <Image
          src="https://res.cloudinary.com/dwsoob1wh/image/upload/v1772747631/qqryoup8ihunefpilcak.png"
          alt="Efeito visual de estrelas"
          fill
          className="object-cover opacity-80" // Opacidade ajuda na leitura do texto
          priority
        />
   
      </div>
    </footer>
  );
};

export { Footer };