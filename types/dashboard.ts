export type SkillType = "forca" | "inteligencia" | "agilidade" | "fe";
export type Difficulty = "easy" | "medium" | "hard";

export type Task = {
  id: string;
  title: string;
  type: "habito" | "diaria" | "afazer";
  direction: "positivo" | "negativo";
  difficulty?: Difficulty;
  skill_type: SkillType;
  forca_reward?: number;
  inteligencia_reward?: number;
  agilidade_reward?: number;
  fe_reward?: number;
  xp_reward?: number;
  hp_reward?: number;
  penalty_hp?: number;
  mana_cost?: number;
  notes?: string;
  is_completed?: boolean;
};

export type CharacterClass = "guerreiro" | "mago" | "druida" | "arqueiro";

export type Character = {
  id: string;
  user_id: string;
  name: string;
  class: CharacterClass;
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
  xp_boost_multiplier?: number;
  xp_boost_expires_at?: string | null;
};
