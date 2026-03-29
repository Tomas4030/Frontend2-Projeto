# 📐 PADRÕES, REFATORAÇÃO & BEST PRACTICES

**Foco**: React/Next.js patterns, state management, performance, e segurança

---

## 📊 ANTI-PATTERNS ENCONTRADOS

### Anti-Pattern #1: Múltiplos `getSession()` Calls

#### ❌ Problema Actual

```typescript
// pages/dashboard/page.tsx
export default async function Dashboard() {
  const session = await getSession();
  if (!session) redirect("/login");

  // ... mais código ...

  const { data: character } = await supabase
    .from("characters")
    .select("*")
    .eq("user_id", session.user.id) // ← Usando session again
    .single();

  // ...
}

// components/CharacterPanel.tsx
export async function CharacterPanel() {
  const session = await getSession(); // ← 3ª chamada!

  // ...
}
```

**Impacto**:

- Múltiplas chamadas ao auth provider
- Aumenta latência
- Código repetido

#### ✅ Solução: Context API + RLS (Row-Level Security)

```typescript
// app/layout.tsx
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // 1. Fetch session UMA VEZ
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // 2. Passar como prop ou context
  return (
    <html>
      <body>
        <SessionProvider session={session}>
          <Providers>{children}</Providers>
        </SessionProvider>
      </body>
    </html>
  );
}

// context/SessionContext.ts
import { createContext, useContext } from "react";
import type { Session } from "@supabase/supabase-js";

const SessionContext = createContext<Session | null>(null);

export function useSession() {
  return useContext(SessionContext);
}

export function SessionProvider({
  session,
  children
}: {
  session: Session | null;
  children: React.ReactNode;
}) {
  return (
    <SessionContext.Provider value={session}>
      {children}
    </SessionContext.Provider>
  );
}

// app/dashboard/page.tsx (REFATORADO)
export default async function Dashboard() {
  const session = useSession(); // ← Sem chamada ao auth!

  if (!session) redirect("/login");

  // ... resto do código
}
```

---

### Anti-Pattern #2: State Management em Múltiplos Lugares

#### ❌ Problema Actual

```typescript
// Estado em 3 lugares diferentes:

// 1. No componente
const [character, setCharacter] = useState(null);

// 2. No localStorage (implícito via Supabase)
localStorage.setItem("character", JSON.stringify(data));

// 3. No Supabase
const { data: character } = await supabase.from("characters").select();

// Resultado: Dessincronización, bugs, confusão
```

#### ✅ Solução: React Query (Recomendado para Produção)

```typescript
// hooks/useCharacter.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

const CHARACTER_QUERY_KEY = ["character"];

export function useCharacter(userId: string) {
  return useQuery({
    queryKey: [...CHARACTER_QUERY_KEY, userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("characters")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 30,   // 30 minutos
  });
}

export function useUpdateCharacter() {
  const queryClient = useQueryClient();
  const { session } = useAuth();

  return useMutation({
    mutationFn: async (updates: Partial<Character>) => {
      const { data, error } = await supabase
        .from("characters")
        .update(updates)
        .eq("user_id", session?.user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Invalidar cache para refetch
      queryClient.invalidateQueries({
        queryKey: CHARACTER_QUERY_KEY,
      });

      // Atualizar cache otimistically
      queryClient.setQueryData([...CHARACTER_QUERY_KEY, session?.user.id], data);
    },
  });
}

// Usar:
export function Dashboard() {
  const { data: character, isLoading, error } = useCharacter(userId);
  const { mutate: updateCharacter } = useUpdateCharacter();

  if (isLoading) return <Loading />;
  if (error) return <Error message={error.message} />;

  return (
    <div>
      {/* Conteúdo */}
      <button onClick={() => updateCharacter({ level: character.level + 1 })}>
        Level Up
      </button>
    </div>
  );
}
```

---

### Anti-Pattern #3: Error Handling Inconsistente

#### ❌ Problema Actual

```typescript
// Sem try-catch
const handleMission = async () => {
  const xpGained = calculateXp(mission);
  const { error } = await supabase.rpc("complete_mission", { ... });

  // Sem verificação de error!
  toast.success("Missão concluída!"); // Pode suceder mesmo com erro
};

// Ou com try-catch vazio
try {
  // ...
} catch (error) {
  console.log(error); // Silencioso, user não sabe
}
```

#### ✅ Solução: Global Error Handler

```typescript
// lib/error-handler.ts
export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode: number = 500
  ) {
    super(message);
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    switch (error.code) {
      case "AUTH_UNAUTHORIZED":
        return "Sessão expirada, faz login novamente";
      case "CHARACTER_NOT_FOUND":
        return "Personagem não encontrado";
      case "INSUFFICIENT_GOLD":
        return "Ouro insuficiente";
      case "INSUFFICIENT_MANA":
        return "Mana insuficiente";
      default:
        return error.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Erro desconhecido";
}

// hooks/useAsync.ts (Reusável)
export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  immediate = true
) {
  const [state, setState] = useState<{
    loading: boolean;
    data: T | null;
    error: string | null;
  }>({ loading: immediate, data: null, error: null });

  const execute = useCallback(async () => {
    setState({ loading: true, data: null, error: null });

    try {
      const response = await asyncFunction();
      setState({ loading: false, data: response, error: null });
      return response;
    } catch (error) {
      const message = getErrorMessage(error);
      setState({ loading: false, data: null, error: message });
      throw error;
    }
  }, [asyncFunction]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return { execute, ...state };
}

// Usar:
export function MissionCard({ mission }: { mission: Mission }) {
  const { execute: completeMission, loading, error } = useAsync(
    () => supabase.rpc("complete_mission", { mission_id: mission.id }),
    false // Not immediate
  );

  return (
    <div>
      <button onClick={completeMission} disabled={loading}>
        {loading ? "Completando..." : "Completar"}
      </button>
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}
```

---

### Anti-Pattern #4: Re-renders Desnecessários

#### ❌ Problema Actual

```typescript
// Component que re-renderiza a cada keystroke

export function Dashboard() {
  const [character, setCharacter] = useState(initialCharacter);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(false);

  // Este hook dispara fetch e re-render sempre
  useEffect(() => {
    fetchCharacter(); // Executa sempre que dependency muda
  }, [character]); // ← BUG: Character é dependência, causa loop!

  return (
    <div>
      <CharacterPanel character={character} />
      <TaskList tasks={tasks} filter={filter} />
      <p>Renders: {renderCount++}</p> {/* Pode ser 50+ renders! */}
    </div>
  );
}
```

#### ✅ Solução: Memoization + Dependency Optimization

```typescript
// 1. Componentes memoizados
const CharacterPanel = memo(
  ({ character }: { character: Character }) => (
    <div>
      <h2>{character.name}</h2>
      <p>Level {character.level}</p>
    </div>
  ),
  (prev, next) => prev.character.id === next.character.id // Compare lógico
);

// 2. Callbacks memoizados
export function Dashboard() {
  const [filter, setFilter] = useState("all");

  // Não re-cria função a cada render
  const handleFilterChange = useCallback((newFilter: string) => {
    setFilter(newFilter);
  }, []); // Deps vazias = criada UMA vez

  // Evitar inline objects/arrays em props
  return (
    <TaskList
      tasks={tasks}
      onFilterChange={handleFilterChange}
      // ❌ Evitar: filter={{ type: filter }} (novo object a cada render)
    />
  );
}

// 3. Selectors para evitar re-renders
const selectCharacterName = (state: Character) => state.name; // Só retorna name

// Se usar Zustand:
const name = useCharacterStore(selectCharacterName);
// Só re-renderiza se name mudou
```

---

### Anti-Pattern #5: Async Operations Sem Cleanup

#### ❌ Problema Actual

```typescript
// Memory leak: requests continuam mesmo após componente unmount

export function CharacterLoader() {
  useEffect(() => {
    fetch("/api/character")
      .then(res => res.json())
      .then(data => setCharacter(data)); // ← Se componente unmount, state update em mounted component!
  }, []);

  return <div>{character?.name}</div>;
}
```

#### ✅ Solução: Cleanup Function

```typescript
export function CharacterLoader() {
  useEffect(() => {
    let isMounted = true; // Flag para track

    const loadCharacter = async () => {
      try {
        const { data } = await supabase
          .from("characters")
          .select("*")
          .single();

        // Só atualizar se componente ainda está mounted
        if (isMounted) {
          setCharacter(data);
        }
      } catch (error) {
        if (isMounted) {
          setError(error);
        }
      }
    };

    loadCharacter();

    // Cleanup: marca como unmounted
    return () => {
      isMounted = false;
    };
  }, []);

  return <div>{character?.name}</div>;
}

// Ou com AbortController (moderno)
export function CharacterLoaderModern() {
  useEffect(() => {
    const abortController = new AbortController();

    const loadCharacter = async () => {
      try {
        const { data } = await supabase
          .from("characters")
          .select("*")
          .single();

        setCharacter(data);
      } catch (error) {
        if (error.name !== "AbortError") {
          setError(error);
        }
      }
    };

    loadCharacter();

    return () => abortController.abort(); // Cancela request
  }, []);

  return <div>{character?.name}</div>;
}
```

---

## 🚀 REFATORAÇÃO RECOMENDADA POR COMPONENTE

### Refator #1: `components/Navbar.tsx`

#### Current Issues

- useAuth() chamado em cada render (sem memoization)
- Navbar re-renderiza mesmo quando character não muda
- Without skeleton loading

#### Refactored Version

```typescript
// components/Navbar.tsx (REFATORADO)

import { memo, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useCharacter } from "@/hooks/useCharacter";

const NavbarContent = memo(
  ({
    session,
    character,
    onLogout
  }: {
    session: Session | null;
    character: Character | null;
    onLogout: () => Promise<void>;
  }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = useCallback(async () => {
      await onLogout();
      setIsOpen(false);
    }, [onLogout]);

    return (
      <nav className="navbar">
        <div className="navbar-start">
          <Link href="/" className="btn btn-ghost">
            ⚔️ Veydral
          </Link>
        </div>

        <div className="navbar-end">
          {session ? (
            <>
              {character && (
                <span className="mr-4">
                  {character.name} (Nível {character.level})
                </span>
              )}
              <button
                className="btn btn-sm"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-sm">
                Login
              </Link>
              <Link href="/register" className="btn btn-sm btn-primary">
                Registar
              </Link>
            </>
          )}
        </div>
      </nav>
    );
  }
);

NavbarContent.displayName = "NavbarContent";

export function Navbar() {
  const { session, logout } = useAuth();
  const { data: character } = useCharacter(session?.user.id);

  return (
    <NavbarContent
      session={session}
      character={character}
      onLogout={logout}
    />
  );
}

export default memo(Navbar);
```

---

### Refactor #2: `components/dashboard/dashboardUtils.ts`

#### Current Issues

- Mix de lógica e UI
- Funções muito grandes
- Sem type safety completo

#### Refactored

```typescript
// lib/game-logic.ts (NOVO - Lógica pura)

import type { Character, CharacterClass } from "@/types/character";

/**
 * Lógica PURA - sem side effects
 */
export class GameLogic {
  static calculateXpForNextLevel(currentLevel: number): number {
    return 100 * currentLevel;
  }

  static calculateLevelUp(
    currentXp: number,
    currentLevel: number,
    xpGained: number,
  ): { newLevel: number; remainingXp: number; leveledUp: boolean } {
    let totalXp = currentXp + xpGained;
    let level = currentLevel;
    let leveledUp = false;

    while (totalXp >= this.calculateXpForNextLevel(level) && level < 999) {
      totalXp -= this.calculateXpForNextLevel(level);
      level++;
      leveledUp = true;
    }

    return { newLevel: level, remainingXp: totalXp, leveledUp };
  }

  static calculateMissionRewards(
    baseXp: number,
    xpMultiplier: number = 1,
    equipmentBonus: number = 0,
  ): number {
    return Math.floor(baseXp * xpMultiplier * (1 + equipmentBonus / 100));
  }

  static clampAttributes(
    value: number,
    min: number = 0,
    max: number = 999,
  ): number {
    return Math.max(min, Math.min(max, value));
  }
}

// hooks/useGameLogic.ts (Hook que usa lógica + side effects)
export function useGameLogic(supabase: SupabaseClient) {
  const completeMission = useCallback(
    async (character: Character, mission: Mission) => {
      const xpReward = GameLogic.calculateMissionRewards(
        mission.xp,
        character.xp_boost_active ? 2 : 1,
        character.equipment_bonus,
      );

      const levelUpResult = GameLogic.calculateLevelUp(
        character.xp,
        character.level,
        xpReward,
      );

      // RPC call (side effect)
      const { error } = await supabase.rpc("complete_mission", {
        mission_id: mission.id,
        xp_gained: xpReward,
        new_level: levelUpResult.newLevel,
        new_xp: levelUpResult.remainingXp,
      });

      if (error) throw error;

      return levelUpResult;
    },
    [supabase],
  );

  return { completeMission };
}
```

---

### Refactor #3: Loading States & Skeletons

#### Current Issue

- Sem visual feedback
- Spinner text simples

#### Refactored

```typescript
// components/ui/LoadingState.tsx (NOVO)

export const LoadingStates = {
  LOADING: "loading",
  SUCCESS: "success",
  ERROR: "error",
  IDLE: "idle",
} as const;

interface LoadingStateProps {
  state: (typeof LoadingStates)[keyof typeof LoadingStates];
  children: React.ReactNode;
  fallback?: React.ReactNode;
  error?: Error | null;
}

export function LoadingState({
  state,
  children,
  fallback = <Skeleton />,
  error,
}: LoadingStateProps) {
  switch (state) {
    case LoadingStates.LOADING:
      return fallback;
    case LoadingStates.ERROR:
      return (
        <div className="text-red-500">
          Erro: {error?.message || "Algo correu mal"}
        </div>
      );
    case LoadingStates.SUCCESS:
      return <>{children}</>;
    default:
      return null;
  }
}

// components/ui/Skeleton.tsx
export function Skeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2 animate-pulse">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-4 bg-gray-300 rounded w-full" />
      ))}
    </div>
  );
}

// Usar:
export function Dashboard() {
  const { data: character, isLoading, error } = useCharacter(userId);

  return (
    <LoadingState
      state={
        isLoading ? "loading" : error ? "error" : "success"
      }
      error={error}
      fallback={<DashboardSkeleton />}
    >
      <CharacterPanel character={character!} />
    </LoadingState>
  );
}
```

---

## 🔐 SECURITY BEST PRACTICES

### Security Issue #1: SQL Injection Risk (Via RLS)

#### ✅ Recommendation

```typescript
// Sempre usar RLS (Row-Level Security) no Supabase

-- SQL no Supabase:
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only see own character"
ON characters
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can only update own character"
ON characters
FOR UPDATE
USING (auth.uid() = user_id);

-- Frontend: Sem necessidade de verificar user_id
// ✅ Seguro - RLS valida
const { data } = await supabase
  .from("characters")
  .select("*")
  .eq("id", characterId);
  // Automaticamente filtra por auth.uid()
```

### Security Issue #2: XSS Risk (Character Names)

#### ✅ Recommendation

```typescript
// Next.js sanitiza por default, mas verificar:

// ✅ Seguro - React escapa HTML
<h1>{character.name}</h1>

// ❌ PERIGO - innerHTML não sanitizado
<h1 dangerouslySetInnerHTML={{ __html: character.name }} />

// Se precisar de HTML:
import DOMPurify from "isomorphic-dompurify";

const safeName = DOMPurify.sanitize(character.name);
```

---

## 📈 PERFORMANCE OPTIMIZATIONS

### Optimization #1: Image Loading

```typescript
// ❌ Antes - bloqueia render
<img src="/character.jpg" alt="character" />

// ✅ Depois - lazy + next/image
import Image from "next/image";

<Image
  src="/character.jpg"
  alt="character"
  width={200}
  height={200}
  priority={false}
  loading="lazy"
  placeholder="blur"
/>
```

### Optimization #2: Code Splitting

```typescript
// ❌ Antes - 1 bundle grande
import { DashboardContent } from "./dashboard-content";

// ✅ Depois - Dynamic import
import dynamic from "next/dynamic";

const DashboardContent = dynamic(() => import("./dashboard-content"), {
  loading: () => <Skeleton />,
  ssr: false, // Se complex
});
```

---

## 📋 REFACTORING CHECKLIST

```
[ ] Remover múltiplos getSession() calls
[ ] Implementar React Query (ou SWR)
[ ] Centralizar error handling
[ ] Memoizar componentes que re-renderizam muito
[ ] Adicionar cleanup functions em useEffects
[ ] Refatorar dashboardUtils.ts (separar lógica)
[ ] Adicionar SkeletonLoaders
[ ] Implementar RLS no backend
[ ] Code splitting para lazy pages
[ ] Adicionar TypeScript strict mode checks
```

---

**Foco em**: Code quality, maintainability, e performance  
**Tempo estimado**: 8-10 horas de refactoring (faseably incremental)
