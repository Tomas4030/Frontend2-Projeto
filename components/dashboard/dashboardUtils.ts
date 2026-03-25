export type SkillType = "forca" | "inteligencia" | "agilidade" | "fe";

export type Task = {
  id: string;
  title: string;
  type: "habito" | "diaria" | "afazer";
  direction: "positivo" | "negativo";
  difficulty?: "easy" | "medium" | "hard";

  skill_type: SkillType;

  forca_reward?: number;
  inteligencia_reward?: number;
  agilidade_reward?: number;
  fe_reward?: number;

  xp_reward?: number;
  hp_reward?: number;
  penalty_hp?: number;
  notes?: string;
};

export type Character = {
  id: string;
  user_id: string;
  name: string;
  class: "guerreiro" | "mago" | "druida" | "ladrao";
  level: number;
  xp: number;
  hp: number;
  max_hp: number;
  mp: number;
  max_mp: number;

  forca: number;
  inteligencia: number;
  agilidade: number;
  fe: number;

  gold?: number;
  streak_days?: number;
  tasks_completed?: number;
};

export const CLASS_AVATARS: Record<string, string> = {
  guerreiro:
    "https://res.cloudinary.com/dbxwiln0a/image/upload/v1773266348/rnanhvyyxswz97muunjb.png",
  mago: "https://res.cloudinary.com/dbxwiln0a/image/upload/v1773266025/zmxcwbnzlcjuyinlql8y.png",
  druida:
    "https://res.cloudinary.com/dbxwiln0a/image/upload/v1773266352/wlv51tbtkw6orieaf6v3.png",
  ladrao:
    "https://res.cloudinary.com/dbxwiln0a/image/upload/v1773266354/tnsbow0hjps23y8bgt1h.png",
};

export const CLASS_TITLE: Record<string, string> = {
  guerreiro: "Guerreiro",
  mago: "Mago",
  druida: "Druida",
  ladrao: "Ladrão",
};

export const DIFFICULTY_COLORS: Record<string, string> = {
  facil: "#4ade80",
  medio: "#f5c542",
  dificil: "#ef4444",
};

export function handleLevelUp(xp: number, level: number) {
  let currentXP = xp;
  let currentLevel = level;
  let xpForNextLevel = 100 * currentLevel;

  while (currentXP >= xpForNextLevel) {
    currentXP -= xpForNextLevel;
    currentLevel += 1;
    xpForNextLevel = 100 * currentLevel;
  }

  return { xp: currentXP, level: currentLevel };
}
