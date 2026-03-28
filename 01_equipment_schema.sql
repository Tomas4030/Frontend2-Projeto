-- ============================================================
-- SISTEMA DE EQUIPAMENTO RPG — Schema Supabase / PostgreSQL
-- Executar por ordem no SQL Editor do Supabase
-- ============================================================

-- 1. CATÁLOGO GLOBAL DE ITENS
-- Todos os itens disponíveis no jogo (permanentes, equipáveis).
-- Os itens de consumível (poções, etc.) continuam a ir para buy_shop_item.
CREATE TABLE IF NOT EXISTS items (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                 TEXT NOT NULL,
  description          TEXT,
  slot                 TEXT NOT NULL CHECK (slot IN ('weapon', 'armor', 'amulet')),
  rarity               TEXT NOT NULL DEFAULT 'common'
                         CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),
  set_id               TEXT,          -- ex: 'shadow_set', 'fire_set', NULL = sem set
  price                INTEGER NOT NULL DEFAULT 0,
  icon                 TEXT DEFAULT '⚔️', -- emoji ou URL

  -- Buffs (todos opcionais, default 0 / 1.0)
  strength_bonus       INTEGER DEFAULT 0,
  intelligence_bonus   INTEGER DEFAULT 0,
  hp_bonus             INTEGER DEFAULT 0,
  mp_bonus             INTEGER DEFAULT 0,
  xp_multiplier        NUMERIC(4,2) DEFAULT 1.0,  -- 1.0 = sem bónus, 1.2 = +20%
  gold_multiplier      NUMERIC(4,2) DEFAULT 1.0,
  boss_damage_bonus    INTEGER DEFAULT 0,
  streak_protection    BOOLEAN DEFAULT FALSE,

  -- Condições de desbloqueio (JSONB flexível)
  -- Exemplos:
  --   {}                              → sempre disponível
  --   {"min_level": 5}
  --   {"tasks_completed": 50}
  --   {"min_streak": 7}
  --   {"boss_killed": true}
  unlock_conditions    JSONB DEFAULT '{}',

  created_at           TIMESTAMPTZ DEFAULT NOW()
);

-- 2. INVENTÁRIO DO JOGADOR
-- Regista cada item que o character possui (comprado ou ganho).
CREATE TABLE IF NOT EXISTS player_inventory (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  item_id      UUID NOT NULL REFERENCES items(id),
  acquired_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(character_id, item_id)   -- um character não pode ter duplicados
);

-- 3. EQUIPAMENTO ATIVO DO JOGADOR
-- Um slot por character — substituição automática via UPSERT.
CREATE TABLE IF NOT EXISTS player_equipment (
  character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  slot         TEXT NOT NULL CHECK (slot IN ('weapon', 'armor', 'amulet')),
  item_id      UUID NOT NULL REFERENCES items(id),
  equipped_at  TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (character_id, slot)
);

-- 4. SET BONUSES
-- Bónus extra por equipar N peças do mesmo conjunto.
CREATE TABLE IF NOT EXISTS set_bonuses (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  set_id           TEXT NOT NULL,
  pieces_required  INTEGER NOT NULL,  -- 2 ou 3
  -- Bónus no mesmo formato que ItemBuffs:
  -- {"strength_bonus": 5} ou {"gold_multiplier": 1.10}
  bonus_json       JSONB NOT NULL DEFAULT '{}'
);

-- ============================================================
-- DADOS INICIAIS — Itens de exemplo para começar
-- ============================================================

INSERT INTO items (name, description, slot, rarity, set_id, price, icon,
                   strength_bonus, intelligence_bonus, hp_bonus, mp_bonus,
                   xp_multiplier, gold_multiplier, boss_damage_bonus, streak_protection,
                   unlock_conditions)
VALUES
  -- WEAPONS
  ('Espada de Ferro',    'Uma espada simples, mas eficaz.',          'weapon', 'common',   NULL,        80,  '⚔️',  3, 0, 0,  0,  1.0, 1.0,  0, FALSE, '{}'),
  ('Cajado Arcano',      'Amplifica os teus feitiços.',              'weapon', 'uncommon', NULL,        150, '🪄',  0, 5, 0, 10,  1.1, 1.0,  0, FALSE, '{"min_level": 3}'),
  ('Lança das Sombras',  'Forjada nas trevas. Causa dano extra a bosses.', 'weapon', 'rare', 'shadow_set', 320, '🔱', 8, 0, 0, 0,   1.0, 1.0, 15, FALSE, '{"min_level": 5}'),
  ('Arco da Floresta',   'Preciso e letal.',                         'weapon', 'rare',     NULL,        280, '🏹',  5, 3, 0,  0,  1.0, 1.0, 10, FALSE, '{"tasks_completed": 30}'),
  ('Martelo Lendário',   'Forjado por um deus esquecido.',           'weapon', 'legendary',NULL,        999, '🔨', 20, 0,20,  0,  1.0, 1.5, 30, FALSE, '{"min_level": 10, "boss_killed": true}'),

  -- ARMOR
  ('Armadura de Couro',  'Proteção básica.',                         'armor',  'common',   NULL,        60,  '🛡️',  0, 0,20,  0,  1.0, 1.0,  0, FALSE, '{}'),
  ('Manto do Mago',      'Aumenta mana máxima.',                     'armor',  'uncommon', NULL,        130, '🧥',  0, 3, 0, 25,  1.0, 1.0,  0, FALSE, '{"min_level": 3}'),
  ('Armadura das Sombras','Parte do conjunto das sombras.',           'armor',  'rare',     'shadow_set',300, '🖤',  5, 0,15,  0,  1.0, 1.0,  0, TRUE,  '{"min_level": 5}'),
  ('Placa de Titânio',   'Protege streaks de falhar.',               'armor',  'epic',     NULL,        600, '⚙️',  2, 0,40,  0,  1.0, 1.0,  0, TRUE,  '{"min_streak": 7}'),
  ('Armadura Celestial', 'Proteção divina.',                         'armor',  'legendary',NULL,        950, '✨',  5, 5,60, 20,  1.0, 1.0,  0, TRUE,  '{"min_level": 10}'),

  -- AMULETS
  ('Amuleto de Sorte',   'Mais gold em cada missão.',                'amulet', 'common',   NULL,        90,  '🍀',  0, 0, 0,  0,  1.0, 1.15, 0, FALSE, '{}'),
  ('Cristal do Saber',   'O conhecimento tem poder.',                'amulet', 'uncommon', NULL,        160, '🔮',  0, 8, 0,  5,  1.2, 1.0,  0, FALSE, '{"min_level": 4}'),
  ('Olho das Sombras',   'Parte do conjunto das sombras.',           'amulet', 'rare',     'shadow_set',340, '👁️',  3, 3, 0,  0,  1.1, 1.1,  5, FALSE, '{"min_level": 5}'),
  ('Colar do Campeão',   'Para os que cumprem missões sem parar.',   'amulet', 'epic',     NULL,        550, '🏆',  5, 5,10, 10,  1.3, 1.2,  0, FALSE, '{"min_streak": 14}'),
  ('Amuleto do Infinito','O poder do universo condensado.',          'amulet', 'legendary',NULL,        999, '♾️', 10,10,20, 20,  1.5, 1.5, 20, TRUE,  '{"min_level": 10, "tasks_completed": 100}');

-- SET BONUSES: Shadow Set (Lança + Armadura + Olho das Sombras)
INSERT INTO set_bonuses (set_id, pieces_required, bonus_json) VALUES
  ('shadow_set', 2, '{"strength_bonus": 5, "boss_damage_bonus": 10}'),
  ('shadow_set', 3, '{"gold_multiplier": 1.10, "xp_multiplier": 1.10, "strength_bonus": 10}');

-- ============================================================
-- RPC: equipar item
-- Garante atomicidade: add to inventory (se não existe) + upsert equipment
-- ============================================================
CREATE OR REPLACE FUNCTION equip_item(
  p_character_id UUID,
  p_item_id      UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_slot TEXT;
  v_in_inventory BOOLEAN;
BEGIN
  -- Busca o slot do item
  SELECT slot INTO v_slot FROM items WHERE id = p_item_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Item não encontrado.');
  END IF;

  -- Verifica se está no inventário
  SELECT EXISTS(
    SELECT 1 FROM player_inventory
    WHERE character_id = p_character_id AND item_id = p_item_id
  ) INTO v_in_inventory;

  IF NOT v_in_inventory THEN
    RETURN jsonb_build_object('success', false, 'message', 'Item não está no teu inventário.');
  END IF;

  -- Upsert no equipamento (substitui o slot anterior)
  INSERT INTO player_equipment (character_id, slot, item_id, equipped_at)
  VALUES (p_character_id, v_slot, p_item_id, NOW())
  ON CONFLICT (character_id, slot)
  DO UPDATE SET item_id = EXCLUDED.item_id, equipped_at = NOW();

  RETURN jsonb_build_object('success', true, 'message', 'Item equipado com sucesso!', 'slot', v_slot);
END;
$$;

-- ============================================================
-- RPC: desequipar item
-- ============================================================
CREATE OR REPLACE FUNCTION unequip_item(
  p_character_id UUID,
  p_slot         TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM player_equipment
  WHERE character_id = p_character_id AND slot = p_slot;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Nenhum item equipado nesse slot.');
  END IF;

  RETURN jsonb_build_object('success', true, 'message', 'Item removido.');
END;
$$;

-- ============================================================
-- RPC: comprar item de equipamento
-- Debita gold e adiciona ao inventário
-- ============================================================
CREATE OR REPLACE FUNCTION buy_equipment_item(
  p_character_id UUID,
  p_item_id      UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_price      INTEGER;
  v_char_gold  INTEGER;
  v_name       TEXT;
  v_already    BOOLEAN;
BEGIN
  SELECT price, name INTO v_price, v_name FROM items WHERE id = p_item_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Item não encontrado.');
  END IF;

  SELECT gold INTO v_char_gold FROM characters WHERE id = p_character_id;
  IF v_char_gold < v_price THEN
    RETURN jsonb_build_object('success', false, 'message', 'Gold insuficiente.');
  END IF;

  SELECT EXISTS(
    SELECT 1 FROM player_inventory
    WHERE character_id = p_character_id AND item_id = p_item_id
  ) INTO v_already;

  IF v_already THEN
    RETURN jsonb_build_object('success', false, 'message', 'Já possuís este item.');
  END IF;

  -- Debita gold
  UPDATE characters SET gold = gold - v_price WHERE id = p_character_id;

  -- Adiciona ao inventário
  INSERT INTO player_inventory (character_id, item_id)
  VALUES (p_character_id, p_item_id);

  RETURN jsonb_build_object('success', true, 'message', v_name || ' adquirido!');
END;
$$;
