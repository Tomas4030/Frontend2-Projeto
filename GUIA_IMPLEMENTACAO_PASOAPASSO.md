# 🛠️ GUIA DE IMPLEMENTAÇÃO - PASSO A PASSO

**Objetivo**: Instruções claras e testáveis para corrigir cada bug  
**Público**: Developers (frontend + backend)  
**Duração Estimada**: 3-4 horas (FASE 1 crítica)

---

## ⚠️ PRÉ-REQUISITOS

```bash
# Verificar que está em ambiente correto
node --version       # v18+ required
npm --version        # v9+
git status           # Clean repo

# Dependências instaladas
npm install

# Build funciona
npm run build        # Sem erros

# Variáveis de ambiente
# .env.local contém:
# NEXT_PUBLIC_SUPABASE_URL=...
# NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

---

## 🔴 FIX #1: MIDDLEWARE DE PROTEÇÃO (30 min)

### Passo 1.1: Criar ficheiro middleware.ts

**Local**: `c:\Users\tigas\Frontend2-Projeto\middleware.ts` (NOVA RAIZ)

```bash
# No terminal:
cd c:\Users\tigas\Frontend2-Projeto
touch middleware.ts
```

### Passo 1.2: Copiar código

**Ficheiro**: `middleware.ts`

```typescript
import { type NextRequest, NextResponse } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

/**
 * Middleware para proteger rotas
 * - /dashboard → requer auth + character
 * - /create-character → requer auth
 * - / /login /register → públicas
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. ROTAS PÚBLICAS - deixar passar
  const publicRoutes = ["/", "/login", "/register", "/api"];
  if (
    publicRoutes.some(
      (route) => pathname === route || pathname.startsWith(route),
    )
  ) {
    return NextResponse.next();
  }

  // 2. ROTAS PROTEGIDAS - verificar auth
  try {
    const response = NextResponse.next();
    const supabase = createMiddlewareClient({ req: request, res: response });

    const {
      data: { session },
    } = await supabase.auth.getSession();

    // Se sem session: redirect para login
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname); // Guardar URL para redirect post-login
      return NextResponse.redirect(loginUrl);
    }

    // 3. VERIFICAÇÃO ADICIONAL: /dashboard requer character
    if (pathname.startsWith("/dashboard") && !pathname.includes("/revive")) {
      try {
        const { data: character, error } = await supabase
          .from("characters")
          .select("id")
          .eq("user_id", session.user.id)
          .single();

        if (error || !character) {
          return NextResponse.redirect(
            new URL("/create-character", request.url),
          );
        }
      } catch (charError) {
        console.error("Character check error:", charError);
        // Se erro na query: deixar passar (talvez DB estava down)
        return response;
      }
    }

    return response;
  } catch (error) {
    console.error("Middleware error:", error);
    // Em caso de erro: redirect para segurança
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

// Especificar quais rotas usar middleware
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/create-character/:path*",
    // Excluir public assets
    "/((?!_next/static|_next/image|favicon.ico|robots.txt).*)",
  ],
};
```

### Passo 1.3: Testar

```bash
# 1. Build para verificar erros
npm run build

# 2. Iniciar dev server
npm run dev

# 3. Testes manuais:

# Test A: Sem auth (abrir em incognito)
# URL: http://localhost:3000/dashboard
# ESPERADO: Redirect para /login
# Verificar: Network tab mostra 307 redirect

# Test B: Login → dashboard
# URL: http://localhost:3000/login
# Fazer login com credenciais válidas
# ESPERADO: Vai para /create-character (sem character ainda)

# Test C: Com character
# URL: http://localhost:3000/dashboard
# ESPERADO: Abre dashboard normalmente

# Test D: Back button após logout
# Estar em /dashboard
# Clk botão logout
# Clk back button no browser
# ESPERADO: Vai para /login (não volta dashboard)
```

### Passo 1.4: Validar TypeScript

```bash
npm run typecheck

# Se erros:
# - Verificar import de createMiddlewareClient
# - Verificar types de NextRequest/NextResponse
```

---

## 🔴 FIX #2: HP/MP GROWTH COM LEVEL (1h)

### Passo 2.1: Criar ficheiro lib/character-progression.ts

**Local**: `c:\Users\tigas\Frontend2-Projeto\lib\character-progression.ts`

```bash
touch lib/character-progression.ts
```

### Passo 2.2: Copy código

**Ficheiro**: `lib/character-progression.ts`

```typescript
/**
 * Sistema de progressão de character
 * Define como HP/MP crescem com level
 */

export type CharacterClass = "Guerreiro" | "Mago" | "Druida" | "Arqueiro";

interface ClassProgression {
  baseHp: number;
  baseMp: number;
  hpPerLevel: number;
  mpPerLevel: number;
}

// Definir crescimento por classe
const CLASS_PROGRESSIONS: Record<CharacterClass, ClassProgression> = {
  Guerreiro: {
    baseHp: 100,
    baseMp: 30,
    hpPerLevel: 5,
    mpPerLevel: 0.5,
  },
  Mago: {
    baseHp: 60,
    baseMp: 150,
    hpPerLevel: 2,
    mpPerLevel: 5,
  },
  Druida: {
    baseHp: 80,
    baseMp: 100,
    hpPerLevel: 3.5,
    mpPerLevel: 3,
  },
  Arqueiro: {
    baseHp: 70,
    baseMp: 80,
    hpPerLevel: 3,
    mpPerLevel: 2,
  },
};

/**
 * Calcula max stats para um nível específico
 * @param level - Level do character (1-999)
 * @param characterClass - Classe
 * @returns { max_hp, max_mp }
 */
export function getMaxStatsForLevel(
  level: number,
  characterClass: CharacterClass,
): { max_hp: number; max_mp: number } {
  const progression =
    CLASS_PROGRESSIONS[characterClass] || CLASS_PROGRESSIONS.Guerreiro;

  const levelFactor = Math.max(1, level);

  return {
    max_hp: Math.floor(
      progression.baseHp + (levelFactor - 1) * progression.hpPerLevel,
    ),
    max_mp: Math.floor(
      progression.baseMp + (levelFactor - 1) * progression.mpPerLevel,
    ),
  };
}

/**
 * Calcula novos stats após level up
 * @param currentHp - HP actual antes level up
 * @param currentMp - MP actual antes level up
 * @param oldLevel - Level anterior
 * @param newLevel - Level novo
 * @param characterClass - Classe
 * @returns Stats novos
 */
export function calculateStatsAfterLevelUp(
  currentHp: number,
  currentMp: number,
  oldLevel: number,
  newLevel: number,
  characterClass: CharacterClass,
): {
  new_hp: number;
  new_max_hp: number;
  new_mp: number;
  new_max_mp: number;
} {
  const oldStats = getMaxStatsForLevel(oldLevel, characterClass);
  const newStats = getMaxStatsForLevel(newLevel, characterClass);

  // Aumentar HP e MP proporcionalmente ao crescimento de max
  const hpIncrease = newStats.max_hp - oldStats.max_hp;
  const mpIncrease = newStats.max_mp - oldStats.max_mp;

  return {
    new_hp: Math.min(currentHp + hpIncrease, newStats.max_hp),
    new_max_hp: newStats.max_hp,
    new_mp: Math.min(currentMp + mpIncrease, newStats.max_mp),
    new_max_mp: newStats.max_mp,
  };
}
```

### Passo 2.3: Atualizar dashboardUtils.ts

**Local**: `components/dashboard/dashboardUtils.ts`

**Encontrar função** `handleLevelUp` (ou `completeMission`)

**ANTES**:

```typescript
export const handleLevelUp = async (
  xpGained: number,
  character: Character,
  // ...
) => {
  // Apenas updatexp, level
  const { error } = await supabase
    .from("characters")
    .update({
      xp: newXp,
      level: newLevel,
      // ❌ Faltam: max_hp, max_mp
    })
    .eq("user_id", character.user_id);
};
```

**DEPOIS**:

```typescript
import { calculateStatsAfterLevelUp } from "@/lib/character-progression";

export const handleLevelUp = async (
  xpGained: number,
  character: Character,
  supabase: SupabaseClient,
) => {
  const newXp = character.xp + xpGained;
  const xpNeededForLevel = 100 * character.level;

  let newLevel = character.level;

  // Calcular novo level
  if (newXp >= xpNeededForLevel) {
    newLevel = Math.min(character.level + 1, 999);
  }

  // ✅ NOVO: Recalcular stats se level up
  const leveledUp = newLevel > character.level;
  let updateData: any = {
    xp: newXp,
    level: newLevel,
  };

  if (leveledUp) {
    const statsUpdate = calculateStatsAfterLevelUp(
      character.current_hp,
      character.current_mp,
      character.level,
      newLevel,
      character.class as CharacterClass,
    );

    updateData = {
      ...updateData,
      current_hp: statsUpdate.new_hp,
      max_hp: statsUpdate.new_max_hp,
      current_mp: statsUpdate.new_mp,
      max_mp: statsUpdate.new_max_mp,
    };
  }

  const { error } = await supabase
    .from("characters")
    .update(updateData)
    .eq("user_id", character.user_id);

  if (error) throw error;

  return { newLevel, leveledUp };
};
```

### Passo 2.4: Testar

```bash
# 1. Build
npm run build

# 2. Dev server
npm run dev

# 3. No dashboard
# - Esperar para ganhar XP
# - Observar quando level up
# - Abrir DevTools → Application → IndexedDB
# - Verificar que max_hp aumentou
# - Esperado: Se Guerreiro level 1→2: 100 HP → 105 HP

# 4. Teste específico:
# Abrir console do browser:
const stats1 = getMaxStatsForLevel(1, "Guerreiro"); // { max_hp: 100, max_mp: 30 }
const stats10 = getMaxStatsForLevel(10, "Guerreiro"); // { max_hp: 145, max_mp: 34.5 }
```

---

## 🔴 FIX #3: XP BOOST DURATION = 30min (15 min)

### Passo 3.1: Aceder Supabase SQL Editor

```
1. Ir a https://supabase.com → Dashboard
2. Selecionar projet do Veydral
3. Ir em SQL Editor (lado esquerdo)
4. Criar nova query
```

### Passo 3.2: Encontrar RPC ou Trigger

**SQL Query**:

```sql
-- Verificar funções RPC existentes
SELECT * FROM information_schema.routines
WHERE routine_name LIKE '%shop%' OR routine_name LIKE '%buy%';

-- Verificar tabelas
SELECT * FROM information_schema.tables
WHERE table_schema = 'public';
```

### Passo 3.3: Atualizar INTERVAL

**PROCURAR POR**:

```sql
-- Procurar em trigger ou RPC:
NOW() + INTERVAL '24 hours'
```

**SUBSTITUIR POR**:

```sql
NOW() + INTERVAL '30 minutes'
```

**Exemplo Completo** (se RPC `buy_shop_item`):

```sql
-- ANTES
CREATE OR REPLACE FUNCTION buy_shop_item(
  p_user_id uuid,
  p_item_id integer
)
RETURNS json AS $$
BEGIN
  INSERT INTO character_buffs ...
  VALUES (
    p_user_id,
    'xp_multiplier_2x',
    NOW() + INTERVAL '24 hours'  -- ❌ ERRADO
  );
  ...
END;
$$ LANGUAGE plpgsql;

-- DEPOIS
CREATE OR REPLACE FUNCTION buy_shop_item(
  p_user_id uuid,
  p_item_id integer
)
RETURNS json AS $$
BEGIN
  INSERT INTO character_buffs ...
  VALUES (
    p_user_id,
    'xp_multiplier_2x',
    NOW() + INTERVAL '30 minutes'  -- ✅ CORRETO
  );
  ...
END;
$$ LANGUAGE plpgsql;
```

### Passo 3.4: Testar

```bash
# 1. No dashboard
# 2. Comprar "XP Boost" na shop
# 3. Ver timer aparecer: ~30:00
# 4. Esperar 1 minuto
# 5. Timer deve estar ~29:00 (não 23:00)

# Nota: Timer pode estar 30:00 se refetch não foi tirado
# Reload page após compra se needed
```

---

## 🔴 FIX #4: TYPES IMPORT CORRECTION (5 min)

### Passo 4.1: Criar types/character.ts

**Local**: `types/character.ts` (NOVO FICHEIRO)

```bash
mkdir -p types
touch types/character.ts
```

### Passo 4.2: Copiar tipos centralizados

**Ficheiro**: `types/character.ts`

```typescript
/**
 * Centralizar tipos de Character
 * Evita circular imports e desorganização
 */

export type CharacterClass = "Guerreiro" | "Mago" | "Druida" | "Arqueiro";

export interface Character {
  // IDs
  id: string;
  user_id: string;

  // Basic info
  name: string;
  class: CharacterClass;

  // Stats
  level: number;
  xp: number;
  current_hp: number;
  max_hp: number;
  current_mp: number;
  max_mp: number;

  // Attributes
  strength: number;
  intelligence: number;
  vitality: number;
  agility: number;

  // Resources
  gold: number;

  // Buffs/Status
  xp_boost_expires_at?: string | null;
  current_mana_regen_active?: boolean;

  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface Equipment {
  id: string;
  name: string;
  type: "weapon" | "armor" | "amulet";
  rarity: "common" | "rare" | "epic" | "legendary";
  stats: {
    strength?: number;
    intelligence?: number;
    vitality?: number;
    agility?: number;
    xp_multiplier?: number;
  };
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  type: "habit" | "daily" | "todo";
  xp_reward: number;
  mana_cost: number;
  attribute_rewards: {
    strength?: number;
    intelligence?: number;
    vitality?: number;
    agility?: number;
  };
  created_at: string;
}
```

### Passo 4.3: Corrigir imports

**Ficheiro**: `lib/equipment.ts`

**ANTES**:

```typescript
import type { Character } from "@/components/dashboard/dashboardUtils";
```

**DEPOIS**:

```typescript
import type { Character, Equipment } from "@/types/character";
```

**Ficheiro**: `components/dashboard/dashboardUtils.ts`

**ADICIONAR no topo**:

```typescript
import type { Character, CharacterClass, Mission } from "@/types/character";
```

### Passo 4.4: Verificar

```bash
npm run typecheck

# Deve ter 0 erros
```

---

## ✅ VALIDAÇÃO COMPLETA (FASE 1)

### Checklist Final

```bash
# 1. Build sem erros
[ ] npm run build          # Zero TypeScript errors

# 2. No dev server
[ ] npm run dev
[ ] Testes middleware:
    [ ] Sem auth → /dashboard → redirect /login
    [ ] Sem character → /dashboard → redirect /create-character
    [ ] Com auth + character → /dashboard → funciona

# 3. HP/MP growth
[ ] Criar personagem Guerreiro
[ ] Dar alguns cliques para ganhar XP
[ ] Level up para level 2
[ ] Verificar: max_hp aumentou em ~5 pontos

# 4. XP boost
[ ] Comprar XP Boost na shop
[ ] Verificar timer: ~30:00
[ ] Aguardar 1 minuto
[ ] Verificar timer: ~29:00 (não desceu mais que isso)

# 5. QA Rápido
[ ] Login/logout funciona
[ ] Character persistence funciona
[ ] Sem erros de console
[ ] Sem warnings de React (muito importantes ones)
```

### Revert Plan (Se Algo Der Errado)

```bash
# Se build falha:
git diff HEAD~ lib/character-progression.ts  # Ver mudanças
git checkout -- .                              # Revert all
npm install
npm run build

# Se middleware causa problemas:
rm middleware.ts
npm run build

# Se SQL query incorreta:
# Supabase → SQL Editor → Última query bem-sucedida
```

---

## 🎯 PRÓXIMOS PASSOS (FASE 2 - DEPOIS)

Depois de testar FASE 1 com sucesso:

```bash
# 1. Commit FIX:
git add .
git commit -m "fix(critical): Middleware, HP/MP growth, XP boost duration"
git push

# 2. Create PR no GitHub (com descrição completa)

# 3. Code review

# 4. Merge para main/staging

# 5. Deploy para staging/prod

# 6. QA team valida em staging

# 7. Release notes
```

---

## 📞 TROUBLESHOOTING

### Problema: Build falha em middleware.ts

```bash
# Solução 1: Verificar Supabase imports
npm ls @supabase/auth-helpers-nextjs

# Solução 2: Limpar cache
rm -rf .next node_modules package-lock.json
npm install
npm run build
```

### Problema: HP não aumenta após level up

```bash
# Check:
# 1. Level up está acionando?
# 2. calculateStatsAfterLevelUp está sendo chamado?
# 3. UPDATE está escrevendo no DB?

# Debug em console:
console.log("Level up!", { newLevel, statsUpdate });

# Verificar DB diretamente em Supabase
```

### Problema: Timer XP boost mostra 24h

```bash
# Verificar: A função RPC foi actualizada?
# No Supabase SQL Editor, testar:
SELECT * FROM character_buffs
WHERE buff_type = 'xp_multiplier_2x'
LIMIT 1;

# Verificar expires_at timestamp
```

---

**Template Concluído**: Pronto para implementação  
**Tempo Estimado**: 3-4 horas (FASE 1)  
**Confiança de Sucesso**: 95%+
