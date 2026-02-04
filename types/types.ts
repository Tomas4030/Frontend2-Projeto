  interface User {
    id: number;
    name: string;
    email: string;
    sexo: "Homem" | "Mulher"
    avatar_url?: string;

    level: number;
    xp_total: number;
    gold: number;

    streak: number;
    last_active_date: number;
  }


  interface Attribute {
    id: number;
    user_id: number;
    type: "Strength" | "Dexterity" |"Intelligence" | "Health";
    level: number;
    xp: number;
  }

  interface Mission {
    id: number;
    user_id: number;
    name: string;

    category: "study" | "gym" | "work" | "social" | "outros"
    attribute_type: "Strength" | "Dexterity" |"Intelligence" | "Health";

    xp_reward: number;
    frequency: "Daily" | "weekly" | "one_time";
    streak_bonus?: boolean;
  }


  interface MissionLog {
    id: number;
    mission_id: number;
    user_id: number;
    completed_at: Date;
    xp_gained: number;
  }

  interface Item {
    id: number;
    name: string;
    price: number;
  }

  interface ItemEffect {
    item_id: number;
    attribute_type: "Strength" | "Dexterity" | "Intelligence" | "Health";
    value: number
  }

  interface UserItem {
    user_id: number;
    item_id: number;
  }



