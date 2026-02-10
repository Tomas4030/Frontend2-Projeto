import { Swords } from 'lucide-react';

const Navbar = () => {
  return (
    //Logo and navigation
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Swords />
          <span className="font-pixel text-xs text-primary">QuestLife</span>
        </div>

        <div className="flex">
          <ul className="flex items-center gap-4">
            <li>
              <a href="/">Começar</a>
            </li>
            <li>
              <a href="/about">Sobre</a>
            </li>
            <div className="">
                <li>
                    <a href="/login" className="px-3 py-1 border border-primary rounded hover:bg-primary/10 transition">Login</a>
                </li>
            </div>
          </ul>
        </div>
      </div>
    </nav>
  );
};
export default Navbar;
