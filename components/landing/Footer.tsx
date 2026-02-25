import Image from "next/image";

const formattedDate = new Intl.DateTimeFormat("pt-BR", {
  year: "numeric",
}).format(new Date());

const Footer = () => {
  return (
    <>
      <footer className="text-white py-4 container mx-auto">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <p className="text-sm">
            &copy; {formattedDate} Veydral. Todos os direitos reservados.
          </p>
          <p className="text-xs mt-2">Veydral</p>
        </div>
      </footer>

      {/* Imagem abaixo do footer, full-width */}
      <div className="relative w-full h-48 ">
        <Image
          src="https://habitica.com/assets/midground_foreground_extended2-BDqZdEwW.png"
          alt="Descrição da imagem"
          fill
          className="object-cover"
          priority
        />
      </div>
    </>
  );
};

export { Footer };
