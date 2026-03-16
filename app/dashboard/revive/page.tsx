export default function RevivePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="text-center">
        <h1 className="text-3xl mb-4">💀 O teu herói morreu</h1>

        <p className="mb-6">
          Podes pagar €0.99 para reviver ou começar do zero.
        </p>

        <button className="rpg-btn mb-4">
          Reviver (€0.99)
        </button>

        <button className="rpg-btn">
          Recomeçar personagem
        </button>
      </div>
    </div>
  );
}