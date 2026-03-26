# Relatório de Análise Tecnológica

## Base

## Next.js ou Vite
✅ Utilizado (Next.js)
📄 ficheiro: `package.json`
📍 linha: ~6
💡 descrição: Os scripts `dev/build/start` usam `next`, indicando que o projeto está configurado com Next.js (não com Vite).

## TypeScript
✅ Utilizado
📄 ficheiro: `tsconfig.json`
📍 linha: ~1
💡 descrição: A presença do ficheiro de configuração TypeScript confirma tipagem estática no projeto.

## React Hooks (useState, useEffect)
✅ Utilizado
📄 ficheiro: `components/Navbar.tsx`
📍 linha: ~3 e ~39
💡 descrição: O componente importa `useState` e `useEffect` e usa-os para gerir estado de UI/autenticação e ciclo de vida.

## Styling (CSS, Tailwind)
✅ Utilizado
📄 ficheiro: `app/globals.css`
📍 linha: ~1
💡 descrição: O projeto importa Tailwind (`@import "tailwindcss"`) e define estilos globais/componentes em CSS.

## Authentication
✅ Utilizado
📄 ficheiro: `app/login/page.tsx`
📍 linha: ~32
💡 descrição: Login implementado com Supabase através de `supabase.auth.signInWithPassword(...)`.

## SEO (metadata, robots, sitemap)
✅ Utilizado
📄 ficheiro: `app/layout.tsx`
📍 linha: ~13
💡 descrição: Define `metadata` (title, description, openGraph, twitter, robots). Também existem `public/robots.txt` e `app/api/sitemap/route.ts`.

## API CRUD Operations (Fetch ou Axios)
✅ Utilizado
📄 ficheiro: `app/dashboard/page.tsx`
📍 linha: ~59
💡 descrição: Operações CRUD são feitas via cliente Supabase (ex.: `select`, `delete`) para gerir tarefas/personagem; funciona como camada de API.

## Navigation
✅ Utilizado
📄 ficheiro: `components/Navbar.tsx`
📍 linha: ~4
💡 descrição: Navegação com `next/link` e `next/navigation` (`useRouter`, `usePathname`) para rotas e redirecionamentos.

## Responsive Design
✅ Utilizado
📄 ficheiro: `app/login/page.tsx`
📍 linha: ~70
💡 descrição: Uso de classes responsivas Tailwind como `md:grid-cols-2` e `hidden md:block` para adaptar layout a diferentes ecrãs.

## Hosted Online (Vercel, Netlify ou outro)
✅ Utilizado (Vercel)
📄 ficheiro: `app/layout.tsx`
📍 linha: ~14
💡 descrição: O domínio `https://veydral.vercel.app` aparece em `metadataBase` e também em `robots.txt`/sitemap.

---

## Bónus

## Unit Testing
❌ Não utilizado

## Context API ou Redux
✅ Utilizado (Context API)
📄 ficheiro: `components/lightswind/carousel.tsx`
📍 linha: ~32
💡 descrição: Criação de contexto React com `React.createContext(...)` e consumo via `useContext`.

## Animations
✅ Utilizado
📄 ficheiro: `app/dashboard/revive/page.tsx`
📍 linha: ~6
💡 descrição: Uso de `framer-motion` (`motion`, `AnimatePresence`) para animações de entrada/interação.

## React Query
✅ Utilizado
📄 ficheiro: `app/providers.tsx`
📍 linha: ~4
💡 descrição: Configuração de `QueryClient` e `QueryClientProvider` de `@tanstack/react-query` na raiz da app.

## useMemo, useCallback, useRef
✅ Utilizado
📄 ficheiro: `components/lightswind/3d-image-carousel.tsx`
📍 linha: ~3
💡 descrição: O componente importa e utiliza os três hooks para performance, memoização e referências de DOM/intervalos.

## Prisma
❌ Não utilizado

## Analytics
✅ Utilizado
📄 ficheiro: `app/layout.tsx`
📍 linha: ~71
💡 descrição: Integração de Google Analytics com `gtag.js` e tracking manual de page views.
https://analytics.google.com/analytics/web/?hl=pt-br#/a388883883p530064766/reports/intelligenthome

## Google Cloud Console
https://search.google.com/search-console?resource_id=https://veydral.vercel.app/
❌ Não utilizado
