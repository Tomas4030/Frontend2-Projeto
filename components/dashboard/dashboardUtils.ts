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

function getAvatarUrl(url: string, size = 80) {
  return url.replace(
    "/upload/",
    `/upload/f_auto,q_auto,w_${size},h_${size},c_fill/`
  );
}

export const CLASS_AVATARS: Record<CharacterClass, string> = {
  guerreiro: getAvatarUrl(
    "https://res.cloudinary.com/dbxwiln0a/image/upload/v1773266348/rnanhvyyxswz97muunjb.png"
  ),
  mago: getAvatarUrl(
    "https://res.cloudinary.com/dbxwiln0a/image/upload/v1773266025/zmxcwbnzlcjuyinlql8y.png"
  ),
  druida: getAvatarUrl(
    "https://res.cloudinary.com/dbxwiln0a/image/upload/v1773266352/wlv51tbtkw6orieaf6v3.png"
  ),
  arqueiro: getAvatarUrl(
    "https://res.cloudinary.com/dbxwiln0a/image/upload/v1773266354/tnsbow0hjps23y8bgt1h.png"
  )
};

export const CLASS_TITLE: Record<CharacterClass, string> = {
  guerreiro: "Guerreiro",
  mago: "Mago",
  druida: "Druida",
  arqueiro: "Arqueiro"
};

export const QUEST_DIFFICULTY_CONFIG: Record<
  Difficulty,
  {
    xp: number;
    hp: number;
    attr: number;
    mana: number;
    gold: {min: number;max: number;};
    label: string;
    sublabel: string;
    color: string;
  }> =
{
  easy: {
    xp: 10,
    hp: 5,
    attr: 1,
    mana: 4,
    gold: { min: 6, max: 12 },
    label: "RANK E",
    sublabel: "Fácil",
    color: "#4ade80"
  },
  medium: {
    xp: 25,
    hp: 10,
    attr: 2,
    mana: 8,
    gold: { min: 14, max: 24 },
    label: "RANK C",
    sublabel: "Médio",
    color: "#f5c542"
  },
  hard: {
    xp: 50,
    hp: 20,
    attr: 3,
    mana: 14,
    gold: { min: 28, max: 42 },
    label: "RANK S",
    sublabel: "Difícil",
    color: "#ef4444"
  }
};

export const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  easy: QUEST_DIFFICULTY_CONFIG.easy.color,
  medium: QUEST_DIFFICULTY_CONFIG.medium.color,
  hard: QUEST_DIFFICULTY_CONFIG.hard.color
};

export function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getRandomGoldReward(difficulty: Difficulty) {
  const range = QUEST_DIFFICULTY_CONFIG[difficulty].gold;
  return getRandomInt(range.min, range.max);
}

export function getManaCost(difficulty: Difficulty) {
  return QUEST_DIFFICULTY_CONFIG[difficulty].mana;
}

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