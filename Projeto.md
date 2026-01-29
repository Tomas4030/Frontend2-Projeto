User {
  id
  name
  email

  level
  xp_total
  gold

  streak
  last_active_date
}


Attribute {
  id
  user_id
  type // "strength", "intelligence", "health", etc
  level
  xp
}

Mission {
  id
  user_id
  name

  category // "study", "gym", "work", "social"
  attribute_type // "intelligence", "strength"

  xp_reward
  frequency // daily, weekly, one_time
}

MissionLog {
  id
  mission_id
  user_id
  completed_at
  xp_gained
}

Item {
  id
  name
  price
}

ItemEffect {
  item_id
  attribute_type
  value // +2 strength
}

UserItem {
  user_id
  item_id
  equipped
}
