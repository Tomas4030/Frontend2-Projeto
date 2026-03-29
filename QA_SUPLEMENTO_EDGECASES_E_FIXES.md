# QA - SUPLEMENTO: EDGE CASES DETALHADOS E CORREÇÕES DE CÓDIGO

---

## PARTE 2: TESTES DETALHADOS DE EDGE CASES

### 1. AUTENTICAÇÃO - EDGE CASES CRÍTICOS

#### Caso #1: Sessão Expirada a Meio de Uma Ação

```
PASSOS:
1. Utilizador faz login (token criado)
2. Inicia uma missão
3. Token expira no servidor (sem refresh)
4. Clica "Concluir Missão"
5. Chamada RPC falha com 401 Unauthorized

RESULTADO ESPERADO:
- Catch block mostra toast "Sessão expirada, faz login novamente"
- Redirect para /login
- User pode fazer login novamente

RESULTADO OBTIDO:
- Sem tratamento específico
- Erro genérico "Erro ao atualizar personagem"
- Sem redirect automático
- User preso no dashboard

CRITICIDADE: 🔴 CRÍTICA
```

#### Caso #2: Múltiplas Abas Abertas - Ações Conflitantes

```
PASSOS:
1. Abrir /dashboard em ABA A
2. Abrir /dashboard em ABA B
3. Em ABA A: Comprar item (gold vai de 100 → 50)
4. Em ABA B: Ainda mostra gold = 100
5. Clicar em ABA B "Comprar item"
6. Backend rejeita (gold insuficiente)
7. ABA B mostra erro, MAS gold ainda visível como 100

RESULTADO ESPERADO:
- Ambas abas sincronizam periodicamente
- UI mostra estado real

RESULTADO OBTIDO:
- Abas dessincronizadas
- User vê informação contraditória

CRITICIDADE: 🟠 ALTA
```

#### Caso #3: Registo com Campos Vazios Após Trim

```
PASSOS:
1. Nome: "   " (apenas espaços)
2. Email: "test@test.com"
3. Password: "senha123"
4. ConfirmPassword: "senha123"
5. Clicar "Criar Herói"

RESULTADO ESPERADO:
- Toast "Nome não pode estar vazio"
- Impedir submission

RESULTADO OBTIDO:
- Envia para backend
- Backend cria character com name=""

CRITICIDADE: 🟠 ALTA
```

### 2. GAMEPLAY - EDGE CASES

#### Caso #4: Level Up com Multiplicador e Equipamento

```
PASSOS:
1. Character: Nível 9, XP = 850/900
2. Equipar item com XP multiplier 1.1
3. Comprar XP boost (mult 2.0)
4. Completar missão de +50 XP

CÁLCULO ESPERADO:
baseXp=50 × shopping_boost(2.0) × equipment_mult(1.1) = 110 XP total
Final XP = 850 + 110 = 960 → LEVEL UP (mas level 10 custa 100*10=1000)

RESULTADO ESPERADO:
- XP após level up = 960 - 900 = 60 XP no nível 10

RESULTADO OBTIDO:
- [TESTE NECESSÁRIO - SEM ACESSO A DB]

CRITICIDADE: 🟠 ALTA (Verificar)
```

#### Caso #5: Falhar Missão com Atributos em 0

```
PASSOS:
1. Character: Força = 2
2. Falhar missão com penalidade -5 Força

CÁLCULO ESPERADO:
newForca = Math.max(0, 2 - 5) = 0

RESULTADO ESPERADO:
- Força vai para 0 (mínimo)
- Toast mostra "-5 Força (clampado a 0)"

RESULTADO OBTIDO:
- Toast mostra "-5 Força"
- MAS não está claro no UI que foi clampado

CRITICIDADE: 🟡 MÉDIA (UX confusa)
```

#### Caso #6: Comprar Item Exatamente Quando Reset Acontece

```
PASSOS:
1. Shop reset em 59:59 (1 segundo antes midnight)
2. Usuário clica "Comprar Poção" simultaneamente
3. RPC executa: `NOW()` = exatamente 00:00:00
4. getTodayRange() retorna: start do DIA ANTERIOR (bug?)

RESULTADO ESPERADO:
- Compra registra no dia correto
- Purchase count reseta após midnight

RESULTADO OBTIDO:
- Possível race condition
- Purchase pode não contar corretamente

CRITICIDADE: 🟠 ALTA (Race condition)
```

### 3. PERSISTÊNCIA - EDGE CASES

#### Caso #7: Reload com Timer Ativo

```
PASSOS:
1. Comprar XP boost (começa timer: 30:00)
2. Aguardar 5 segundos
3. Fazer F5 (reload)
4. Observar timer

RESULTADO ESPERADO:
- Timer continua de ~24:55 (subtraindo o tempo decorrido)

RESULTADO OBTIDO:
- Timer reinicia de 30:00
- OU mostra tempo incorreto

CRITICIDADE: 🟡 MÉDIA (Visual desincroniza do real)
```

#### Caso #8: Fechar Browser com Ação a Meio

```
PASSOS:
1. Iniciar compra na shop
2. Fechar browser antes de response da RPC
3. Reabrir browser e fazer login

RESULTADO ESPERADO:
- Frontend é consistente com backend
- Se RPC foi bem-sucedido: user tem compra + menos gold
- Se RPC falhou: user tem gold como antes

RESULTADO OBTIDO:
- [TESTE NECESSÁRIO - SEM ACESSO A LOGS]

CRITICIDADE: 🟡 MÉDIA (Potencial inconsistência)
```

### 4. NAVEGAÇÃO - EDGE CASES

#### Caso #9: Tentar Aceder a /dashboard/revive sem Morrer

```
PASSOS:
1. Character vivo (HP = 100)
2. Abrir devtools → URL bar
3. Ir para http://localhost:3000/dashboard/revive
4. Observar resultado

RESULTADO ESPERADO:
- Redirect automático para /dashboard
- Toast "Não podes reviver se estás vivo"

RESULTADO OBTIDO:
- Página /dashboard/revive carrega
- Mostra botões Reviver/Reiniciar mesmo estando vivo
- Clicar "Reviver" novamente set HP=100 (redundante, mas ok)

CRITICIDADE: 🟡 MÉDIA (UX confusa)
```

#### Caso #10: Browser Back Button Após Logout

```
PASSOS:
1. Estar em http://localhost:3000/dashboard (autenticado)
2. Fazer logout (redirect para /)
3. Clicar botão "back" do browser
4. Volta para /dashboard

RESULTADO ESPERADO:
- Routing detect sem auth
- Redirect para /login com mensagem "Sessão expirada"

RESULTADO OBTIDO:
- /dashboard carrega
- Vê loading spinner infinito
- Sem redirect

CRITICIDADE: 🔴 CRÍTICA
```

### 5. VALIDAÇÃO - EDGE CASES

#### Caso #11: Registo com Email Muito Comprido

```
PASSOS:
1. Email: "aaaaaaaaaaaaa...aaaaaa@test.com" (>255 caratteri)
2. Password: "senha123"
3. Clicar "Criar Herói"

RESULTADO ESPERADO:
- Toast "Email demasiado longo (máx 255 caracteres)"

RESULTADO OBTIDO:
- [SEM VALIDAÇÃO - Envia para backend]

CRITICIDADE: 🟡 MÉDIA
```

#### Caso #12: Nome de Personagem com Caracteres Especiais

```
PASSOS:
1. Nome: "<script>alert('xss')</script>"
2. Selecionar classe
3. Clicar "Criar"

RESULTADO ESPERADO:
- Validação reject ou sanitização
- Character criado com nome seguro

RESULTADO OBTIDO:
- [TESTE NECESSÁRIO - XSS Attack Test]

CRITICIDADE: 🟠 ALTA (Security)
```

### 6. PERFORMANCE - EDGE CASES

#### Caso #13: Muitas Missões no Dashboard

```
PASSOS:
1. Criar 100+ missões
2. Abrir /dashboard
3. Monitorar performance

RESULTADO ESPERADO:
- Paginação funciona (4 por página)
- Performance aceitvel

RESULTADO OBTIDO:
- [TESTE NECESSÁRIO]

CRITICIDADE: 🟢 BAIXA
```

---

## PARTE 3: CÓDIGO DE CORREÇÃO PARA BUGS CRÍTICOS

### Bug #1: Adicionar Middleware de Proteção

**Arquivo**: `middleware.ts` (NOVO)

```typescript
import { type NextRequest, NextResponse } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  const supabase = createMiddlewareClient({ req: request, res: response });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Rotas que precisam autenticação
  const protectedRoutes = ["/dashboard", "/create-character"];

  if (
    protectedRoutes.some((route) => request.nextUrl.pathname.startsWith(route))
  ) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Se utiliazador autenticado, não pode ir para login/register
  const authRoutes = ["/login", "/register"];

  if (
    authRoutes.some((route) => request.nextUrl.pathname === route) &&
    session
  ) {
    const character = await supabase
      .from("characters")
      .select("id")
      .eq("user_id", session.user.id)
      .single();

    if (character.data) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.redirect(new URL("/create-character", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/create-character/:path*",
    "/login",
    "/register",
  ],
};
```

### Bug #2: Corrigir XP Boost Duration

**Arquivo**: Supabase SQL (Backend - RPC `buy_shop_item`)

```sql
-- ANTES (ERRADO):
xp_boost_expires_at = NOW() + INTERVAL '24 hours'

-- DEPOIS (CORRETO):
xp_boost_expires_at = NOW() + INTERVAL '30 minutes'
```

### Bug #3: Adicionar HP/MP Growth com Level

**Arquivo**: `app/create-character/page.tsx` (modificado)

```typescript
// Adicionar função helper
const getClassStats = (selectedClass: string) => {
  const stats = {
    guerreiro: { hp: 5, mp: 2 },
    mago: { hp: 2, mp: 7 },
    druida: { hp: 4, mp: 5 },
    arqueiro: { hp: 3, mp: 3 },
  };
  return stats[selectedClass as keyof typeof stats] || stats.guerreiro;
};

// No handleSubmit, usar:
const classStats = getClassStats(selectedClass);
const { error } = await supabase.from("characters").insert([
  {
    user_id: user.id,
    name: name.trim(),
    class: selectedClass,
    forca: chosen.stats.str,
    inteligencia: chosen.stats.int,
    agilidade: chosen.stats.agi,
    fe: chosen.stats.fth,
    hp: 100,
    max_hp: 100, // ← Deixar como está (base)
    mp: 50,
    max_mp: 50, // ← Deixar como está (base)
    // ... rest
  },
]);

// Depois, ao fazer level up, aplicar growth:
// Ver em dashboardUtils.ts - função handleLevelUp
```

**Arquivo**: `components/dashboard/dashboardUtils.ts` (modificado)

```typescript
const MAX_LEVEL = 999;

// ADICIONAR NOVA FUNÇÃO:
export function getMaxStatsForLevel(
  baseClass: CharacterClass,
  level: number,
): { max_hp: number; max_mp: number } {
  const classStats = {
    guerreiro: { hpPerLevel: 5, mpPerLevel: 2 },
    mago: { hpPerLevel: 2, mpPerLevel: 7 },
    druida: { hpPerLevel: 4, mpPerLevel: 5 },
    arqueiro: { hpPerLevel: 3, mpPerLevel: 3 },
  };

  const stats = classStats[baseClass];

  return {
    max_hp: 100 + (level - 1) * stats.hpPerLevel,
    max_mp: 50 + (level - 1) * stats.mpPerLevel,
  };
}

// MODIFICAR handleLevelUp:
export function handleLevelUp(
  xp: number,
  level: number,
  baseClass?: CharacterClass,
) {
  let currentXP = xp;
  let currentLevel = level;
  let xpForNextLevel = 100 * currentLevel;

  while (currentXP >= xpForNextLevel && currentLevel < MAX_LEVEL) {
    currentXP -= xpForNextLevel;
    currentLevel += 1;
    xpForNextLevel = 100 * currentLevel;
  }

  if (currentLevel >= MAX_LEVEL) {
    currentLevel = MAX_LEVEL;
  }

  // NOVO: Calcular max stats com o novo level
  let maxStats: { max_hp: number; max_mp: number } | null = null;
  if (baseClass) {
    maxStats = getMaxStatsForLevel(baseClass, currentLevel);
  }

  return { xp: currentXP, level: currentLevel, maxStats };
}
```

**Arquivo**: `app/dashboard/page.tsx` (modificado)

```typescript
// Ao fazer level up e atualizar character:
const leveled = handleLevelUp(
  character.xp + gainedXp,
  character.level,
  character.class,
);

// Se level subiu, atualizar também max stats
if (leveled.level > character.level && leveled.maxStats) {
  const updatedAttrs = {
    // ... existing attrs
    max_hp: leveled.maxStats.max_hp,
    max_mp: leveled.maxStats.max_mp,
  };
} else {
  // ... existing update
}
```

### Bug #4: Corrigir Import em lib/equipment.ts

**Arquivo**: `lib/equipment.ts` (linha 6)

```typescript
// ANTES:
import type { Character } from "@/components/dashboard/dashboardUtils";

// DEPOIS:
import type { Character } from "@/types/dashboard";
```

### Bug #5: Adicionar Validação de Registo

**Arquivo**: `app/register/page.tsx` (handleSubmit modificado)

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  // VALIDAÇÕES ADICIONADAS:
  if (!name.trim()) {
    toast.error("Nome inválido", {
      description: "O nome não pode estar vazio",
    });
    return;
  }

  if (name.length > 50) {
    toast.error("Nome muito comprido", {
      description: "Máximo 50 caracteres",
    });
    return;
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    toast.error("Email inválido", {
      description: "Verifica se o email está correto",
    });
    return;
  }

  // Password strength
  if (password.length < 8) {
    toast.error("Senha muito curta", {
      description: "Mínimo 8 caracteres",
    });
    return;
  }

  if (password !== confirmPassword) {
    toast.error("As senhas não coincidem!", {
      description: "Verifica se digitaste a mesma senha nos dois campos.",
    });
    return;
  }

  // ... rest da original implementação
};
```

### Bug #6: Melhorar Error Handling no Dashboard

**Arquivo**: `app/dashboard/page.tsx` (fetchCharacter modificado)

```typescript
const fetchCharacter = useCallback(async () => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("Autenticação perdida", {
        description: "Faz login novamente",
      });
      router.push("/login");
      return;
    }

    const { data, error } = await supabase
      .from("characters")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // Não existe character
        router.push("/create-character");
        return;
      }

      throw error;
    }

    if (data) {
      const { xp, level } = handleLevelUp(
        data.xp || 0,
        data.level || 1,
        data.class,
      );

      setCharacter({
        ...data,
        xp,
        level,
      } as Character);
    }
  } catch (error: any) {
    console.error("Erro ao carregar personagem:", error.message);
    toast.error("Erro ao carregar dados", {
      description: "Tenta fazer refresh da página",
    });
  }
}, [supabase, router]);
```

### Bug #7: Sincronização de Timer com Servidor

**Arquivo**: `components/dashboard/shop/ItemShop.tsx` (modificado)

```typescript
// Modificar useEffect do XP boost timer:
useEffect(() => {
  const updateXpBoostTime = () => {
    if (!character?.xp_boost_expires_at) {
      setXpBoostRemainingTime("");
      return;
    }

    const expiresAt = new Date(character.xp_boost_expires_at).getTime();
    const now = Date.now();
    const remaining = Math.max(0, expiresAt - now);

    if (remaining <= 0) {
      setXpBoostRemainingTime("");
      // NOVO: Se expirou, atualizar character
      if (character.xp_boost_multiplier === 2) {
        supabase
          .from("characters")
          .update({
            xp_boost_multiplier: 1,
            xp_boost_expires_at: null,
          })
          .eq("id", character.id)
          .then(() => {
            // Forçar reload
            character.xp_boost_multiplier = 1;
            character.xp_boost_expires_at = null;
          });
      }
    } else {
      setXpBoostRemainingTime(formatDuration(remaining));
    }
  };

  updateXpBoostTime();
  const interval = setInterval(updateXpBoostTime, 1000);

  // NOVO: Sincronizar ao voltar para aba:
  const handleVisibilityChange = () => {
    if (!document.hidden) {
      updateXpBoostTime(); // Ressincronizar
    }
  };

  document.addEventListener("visibilitychange", handleVisibilityChange);

  return () => {
    clearInterval(interval);
    document.removeEventListener("visibilitychange", handleVisibilityChange);
  };
}, [character?.xp_boost_expires_at, character?.id, supabase]);
```

---

## PARTE 4: CHECKLIST DE TESTES PÓS-FIX

### Depois de implementar os fixes críticos:

```
TESTES A FAZER:
[ ] Middleware protege /dashboard quando não auth
[ ] Middleware protege /create-character quando não auth
[ ] Logout + back button não deixa entrar em /dashboard
[ ] XP boost dura exatamente 30 minutos
[ ] HP aumenta ao fazer level up
[ ] MP aumenta ao fazer level up
[ ] Character import corrigido (sem erros TypeScript)
[ ] Registo rejeita passwords < 8 caracteres
[ ] Registo rejeita emails inválidos
[ ] Reload em /dashboard com auth funciona
[ ] Reload em /dashboard sem auth redireciona para /login
[ ] Timer sincroniza após tab inativa
[ ] Erro handling mostra mensagens úteis
[ ] XP boost expira automaticamente quando termina
[ ] Atributos têm cap em 999 (implementação futura)
```

---

**Fim de Documento**  
**Última atualização**: 29/03/2026
