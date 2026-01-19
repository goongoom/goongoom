# AGENTS

## Direct Server Render Strategy (RSC + PPR)
- Default to Server Components. `use client` is allowed in `components/ui` and other leaf components that require client interactivity.
- Keep server components granular: one async server component per data slice, each wrapped in `<Suspense>` with a matching `*Skeleton`.
- Avoid a single giant `loading.tsx` fallback. Compose `loading.tsx` from section skeletons only.
- Use server actions + `<form action={...}>` for all mutations; avoid client form libraries.
- Deduplicate shared reads with `cache()` and parallelize independent fetches with `Promise.all`.
- PPR is enabled via `cacheComponents: true` (Next 16+). Avoid `experimental.ppr`. Keep the static shell outside Suspense so dynamic sections can stream.

## UI Kit Usage
- Prefer `components/ui` primitives for surfaces, fields, alerts, empty states, and skeletons.

## Avatars
- User avatars must come from Clerk `imageUrl`. Only use dicebear for anonymous users.
