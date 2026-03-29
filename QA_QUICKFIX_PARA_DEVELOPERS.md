# 🚀 QA - GUIA RÁPIDO PARA DEVELOPERS

**Uso**: Imprimir e afixar ao lado do desk durante implementação dos fixes

---

## 🔴 CRÍTICOS (Implementar HOJE)

### 1️⃣ Middleware de Autenticação

**Problema**: Usuários não autenticados veem loading infinito em /dashboard  
**Arquivo**: Criar → `app/middleware.ts`  
**Tempo**: 15 min

```typescript
// app/middleware.ts
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Páginas públicas
  if (
    pathname === "/" ||
    pathname?.startsWith("/login") ||
    pathname?.startsWith("/register")
  ) {
    return NextResponse.next();
  }

  // Páginas protegidas
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (
    !session &&
    (pathname?.startsWith("/dashboard") ||
      pathname?.startsWith("/create-character"))
  ) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return res;
}

export const config = {
  matcher: ["/dashboard/:path*", "/create-character/:path*"],
};
```

**Verificação**:

```bash
npm run build  # Sem erros?
# Teste: Logout, tenta aceder /dashboard → vai para /login
```

---

### 2️⃣ HP/MP Não Crescem com Level

**Problema**: Max HP e Max MP ficam iguais do level 1 ao 999  
**Arquivo**: Editar → `lib/mana-regeneration.ts` OU criar função em `lib/utils.ts`  
**Tempo**: 10 min

**Solução**:

```typescript
// lib/mana-regeneration.ts (adicionar função)

export function getMaxStatsForLevel(
  level: number,
  characterClass: string,
): {
  max_hp: number;
  max_mp: number;
} {
  const baseStats = {
    Guerreiro: { hp: 100, mp: 30 },
    Mago: { hp: 60, mp: 150 },
    Druida: { hp: 80, mp: 100 },
    Arqueiro: { hp: 70, mp: 80 },
  } as const;

  const classBase =
    baseStats[characterClass as keyof typeof baseStats] || baseStats.Guerreiro;
  const levelMult = 0.5; // +0.5 HP/MP por nível

  return {
    max_hp: Math.floor(classBase.hp + (level - 1) * levelMult),
    max_mp: Math.floor(classBase.mp + (level - 1) * levelMult),
  };
}
```

**Integração**:

```typescript
// app/dashboard/page.tsx (linha ~150)
// Mudar:
// const maxHp = character.max_hp;
// const maxMp = character.max_mp;

// Para:
import { getMaxStatsForLevel } from "@/lib/mana-regeneration";

const { max_hp, max_mp } = getMaxStatsForLevel(
  character.level,
  character.class,
);

// Use max_hp e max_mp em vez de character.max_hp/mp
```

**Verificação**:

```bash
# Teste no dashboard: Level up para level 2 → HP deve +0.5
# Level up para level 5 → HP deve +2
```

---

### 3️⃣ XP Boost Duração Errada (24h vs 30min)

**Problema**: XP boost dura 24 horas em vez de 30 minutos  
**Arquivo**: Backend RPC `buy_shop_item` OU trigger  
**Tempo**: 20 min

**Solução** (Supondo supabase com RPC):

```sql
-- No Supabase → SQL Editor, criar RPC:
CREATE OR REPLACE FUNCTION buy_shop_item(
  p_user_id uuid,
  p_item_id integer,
  p_quantity integer
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_item_price decimal;
  v_item_name text;
  v_current_gold decimal;
  v_count_existing integer;
BEGIN
  -- Get item price
  SELECT price, name INTO v_item_price, v_item_name
  FROM shop_items
  WHERE id = p_item_id;

  IF v_item_price IS NULL THEN
    RETURN json_build_object('error', 'Item not found');
  END IF;

  -- Get current gold
  SELECT gold INTO v_current_gold
  FROM characters
  WHERE user_id = p_user_id;

  IF v_current_gold < v_item_price * p_quantity THEN
    RETURN json_build_object('error', 'Insufficient gold');
  END IF;

  -- Check existing counter
  SELECT COALESCE(SUM(quantity), 0) INTO v_count_existing
  FROM character_purchases
  WHERE character_id = p_user_id
    AND shop_item_id = p_item_id
    AND purchase_date > NOW() - INTERVAL '1 day'; -- Considerar timeline correcta

  IF v_count_existing + p_quantity > 3 THEN -- Limite exemplo
    RETURN json_build_object('error', 'Max purchases exceeded');
  END IF;

  -- Deduct gold
  UPDATE characters
  SET gold = gold - (v_item_price * p_quantity)
  WHERE user_id = p_user_id;

  -- Insert purchase
  INSERT INTO character_purchases (character_id, shop_item_id, quantity, purchase_date)
  VALUES (p_user_id, p_item_id, p_quantity, NOW());

  -- Se item = XP Boost, adicionar boost com 30 MIN em vez de 24h:
  IF v_item_name = 'XP Boost' THEN
    INSERT INTO character_buffs (character_id, buff_type, duration, applied_at)
    VALUES (
      p_user_id,
      'xp_multiplier_2x',
      INTERVAL '30 minutes',  -- ✅ AQUI: 30 minutos
      NOW()
    )
    ON CONFLICT (character_id, buff_type) DO UPDATE
    SET duration = INTERVAL '30 minutes',
        applied_at = NOW();
  END IF;

  RETURN json_build_object('success', true, 'message', 'Item purchased');
END;
$$;
```

---

### 4️⃣ Cabeçalho: Character Must Exist Validation

**Problema**: /dashboard carregável sem character criado  
**Arquivo**: `app/dashboard/page.tsx`  
**Tempo**: 5 min

```typescript
// app/dashboard/page.tsx (início da página)

export default async function Dashboard() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  // ✅ NOVO: Verificar character
  const { data: character } = await supabase
    .from("characters")
    .select("*")
    .eq("user_id", session.user.id)
    .single();

  if (!character) {
    // Sem character criado → redirecionar para criar
    redirect("/create-character");
  }

  // ... resto do código
}
```

---

## 🟠 ALTOS (Próximas 2-4 horas)

### 5️⃣ Validações de Registo

**Problema**: Sem validação de senha força, email duplicado, etc.

```typescript
// app/register/page.tsx (adicionar validações):

function validatePassword(pwd: string): { valid: boolean; error?: string } {
  if (pwd.length < 8) return { valid: false, error: "Min 8 chars" };
  if (!/[A-Z]/.test(pwd)) return { valid: false, error: "Need uppercase" };
  if (!/[0-9]/.test(pwd)) return { valid: false, error: "Need number" };
  return { valid: true };
}

function validateEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// No form submit:
const { valid, error } = validatePassword(password);
if (!valid) {
  toast.error(error);
  return;
}

if (!validateEmail(email)) {
  toast.error("Invalid email");
  return;
}
```

---

### 6️⃣ Token Refresh Logic

**Problema**: Token pode expirar silenciosamente sem refresh  
**Arquivo**: Criar hook `hooks/useAuthRefresh.ts`  
**Tempo**: 20 min

```typescript
// hooks/useAuthRefresh.ts
import { useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';

export function useAuthRefresh() {
  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Refresh token a cada 30 minutos
    const interval = setInterval(async () => {
      const { data: { session } } = await supabase.auth.refreshSession();
      if (!session) {
        window.location.href = '/login';
      }
    }, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);
}

// Usar em app/providers.tsx:
'use client';
import { useAuthRefresh } from '@/hooks/useAuthRefresh';

export function Providers({ children }: { children: React.ReactNode }) {
  useAuthRefresh();
  return (/* ... */);
}
```

---

## 🟡 MÉDIOS (Próximos 1-2 dias)

### 7️⃣ Responsive Design - Tablet

**Problema**: Layout quebrado em tablets (768px-1024px)  
**Arquivo**: `components/dashboard/CharacterPanel.tsx`, `TaskFilter.tsx`, `Navbar.tsx`  
**Tempo**: 45 min

```typescript
// Adicionar breakpoints Tailwind:
// Em tailwind.config.ts, verificar:
// md: 768px, lg: 1024px

// Exemplo fix CharacterPanel:
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Items */}
</div>
```

---

### 8️⃣ Modal Confirmação Destrutiva

**Problema**: Delete button sem confirmação clara  
**Arquivo**: `app/dashboard/revive/page.tsx`  
**Tempo**: 20 min

```typescript
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

<AlertDialog>
  <AlertDialogTrigger asChild>
    <button>Delete Character</button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogTitle>Tem a certeza?</AlertDialogTitle>
    <AlertDialogDescription>
      Isto vai eliminar o personagem permanentemente.
    </AlertDialogDescription>
    <AlertDialogAction onClick={() => deleteCharacter()}>
      Sim, eliminar
    </AlertDialogAction>
    <AlertDialogCancel>Cancelar</AlertDialogCancel>
  </AlertDialogContent>
</AlertDialog>
```

---

## 📊 CHECKLIST DE IMPLEMENTAÇÃO

```
FASE 1 (HOJE - 3-4 horas):
[ ] Middleware autenticação (15 min)
[ ] HP/MP growth (10 min)
[ ] XP boost duration (20 min)
[ ] Character validation (5 min)
[ ] Build clean (5 min)
[ ] Teste básico (30 min)
TOTAL: 1h 25min

FASE 2 (AMANHÃ - 4-5 horas):
[ ] Validações registo (30 min)
[ ] Token refresh (20 min)
[ ] Responsive tablet (45 min)
[ ] Modal confirmação (20 min)
[ ] Better errors (30 min)
[ ] Teste completo (90 min)
TOTAL: 4h 15min

FASE 3 (PRÓXIMA SEMANA - 6-8 horas):
[ ] Custom scrollbar
[ ] Shop items
[ ] Prestige system
[ ] Performance opt
```

---

## 🔍 COMANDO DE TESTE RÁPIDO

```bash
# Build
npm run build

# Teste:
npm run dev

# Browser: http://localhost:3000

# Teste rápido:
1. Logout
2. Tenta aceder /dashboard → DEVE ir para /login (não loading)
3. Login
4. Verifica character exists, senão vai criar
5. Level up → HP deve aumentar
6. Compra XP boost → Timer deve ser 30min (não 24h)
```

---

## 📞 DÚVIDAS?

Ver arquivo: `QA_RELATORIO_FUNCIONAL_COMPLETO.md` para detalhes completos
