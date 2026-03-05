import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const createCharacter = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="py-0 w-full max-w-5xl grid md:grid-cols-2 overflow-hidden rounded-2xl shadow-2xl border border-zinc-800 bg-zinc-900/70 backdrop-blur">
        <div className="p-10 flex flex-col justify-center">
          <CardHeader className="px-0 pb-8">
            <CardTitle className="text-3xl font-bold text-white">
              Criar Personagem
            </CardTitle>
            <CardDescription className="text-zinc-400">
              Crie seu personagem para começar a jogar
            </CardDescription>
          </CardHeader>

          <CardContent className="px-0">
            {/* Formulário para criar personagem */}
            <form className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-zinc-300">
                  Nome do Personagem
                </Label>
                <Input
                  id="name"
                  type="text"
                  required
                  className="bg-zinc-800 border-zinc-700 focus:ring-2 focus:ring-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="class" className="text-zinc-300">
                  Classe
                </Label>
                <Select>
                  <SelectTrigger className="w-full bg-zinc-800 border-zinc-700 focus:ring-2 focus:ring-white">
                    <SelectValue placeholder="Selecione a classe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="guerreiro">Guerreiro</SelectItem>
                    <SelectItem value="mago">Mago</SelectItem>
                    <SelectItem value="ladino">Ladino</SelectItem>
                    <SelectItem value="clerigo">Clérigo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="submit"
                className="w-full bg-white text-black hover:bg-zinc-200 transition-all"
              >
                Criar Personagem
              </Button>
            </form>
          </CardContent>
        </div>
      </Card>
    </div>
  );
};

export default createCharacter;
