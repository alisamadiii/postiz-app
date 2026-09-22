# Fork Modifications — shadcn/ui + Agency Orange reskin

This fork reskins the **frontend only** (presentation). Backend/logic/endpoints are untouched.
When merging `upstream/main`, expect conflicts only in the files below. Everything else merges clean.

## Design decision
- Upgraded **`apps/frontend` to Tailwind v4** (upstream is v3) to match the `@usesend/ui` design system 1:1.
  → This is the main permanent divergence. Tailwind config + global styles will conflict on merge.

## Changed files (the divergence surface)

### Foundation (Tailwind v4 + tokens)
- `package.json` (root) — deps: tailwindcss→v4, tailwind-scrollbar→v4, removed `tailwindcss-rtl` + `autoprefixer`, added `class-variance-authority`, `tailwind-merge`, `tailwindcss-animate`, `framer-motion`, `lucide-react`, `next-themes`, `@radix-ui/*`.
- `apps/frontend/postcss.config.mjs` — `tailwindcss` → `@tailwindcss/postcss`.
- `apps/frontend/tailwind.config.cjs` — **DELETED** (fully ported to CSS-first v4).
- `apps/frontend/src/app/global.scss` → **`global.css`** — v4 `@import "tailwindcss"`, `@theme` (ported all 103 legacy colors + 11 animations + shadows), `@custom-variant` for the old `raw` breakpoints + `child`, `@plugin` for animate/scrollbar. Sass `#{!important}` → v4 `!` suffix; `//` comments → `/* */`.
- `apps/frontend/src/app/colors.scss` → **`colors.css`** — Postiz `--color-*` value vars renamed to `--pz-*` (avoids collision with shadcn's `--color-*` theme namespace); appended the agency-orange shadcn token system (OKLCH, from `@usesend/ui/styles/globals.css`).
- `apps/frontend/src/app/(app)/layout.tsx`, `(provider)/layout.tsx`, `(extension)/layout.tsx` — import `global.scss` → `global.css`.

### Design system (new files — no merge conflict)
- `libraries/react-shared-libraries/src/lib/utils.ts` — `cn()` helper.
- `libraries/react-shared-libraries/src/helpers/cn.ts` — `cn()` helper (alt path).
- `libraries/react-shared-libraries/src/ui/*.tsx` — vendored shadcn components (button, spinner, input, textarea, label, select, dialog, dropdown-menu, tabs, tooltip, popover, switch, separator, card, badge, skeleton) from `@usesend/ui`.

### Primitive swaps / reskin (keep original API + all logic; presentation only)
- `libraries/react-shared-libraries/src/form/button.tsx` — renders shadcn `Button` (66 call sites, props preserved).
- `form/input.tsx`, `form/textarea.tsx`, `form/select.tsx`, `form/custom.select.tsx`, `form/multi.select.tsx` — `rounded-md` + orange focus ring (`ring-ring`), `text-destructive` errors. All react-hook-form logic untouched.
- `form/checkbox.tsx`, `form/slider.tsx` — orange checked/on state (`sdprimary`), `rounded-md`.

### App-wide palette (the "shadcn variables everywhere" move)
- `apps/frontend/src/app/colors.css` — flattened `:root { .dark {} }` nesting to top-level `.dark`/`.light` (nested form wasn't applying), then remapped Postiz structural tokens to shadcn vars: `--new-bgColor→--background`, `--new-bgColorInner→--card`, `--new-border/sep/table-border→--border`, `--new-btn-text→--foreground`, `--pz-primary→--background`, `--pz-forth/--new-btn-primary→--primary`, etc. → all components adopt the agency-orange design system with no per-component edits.

### Animation
- Covered by built-ins: Postiz modals keep `animate-fadeIn`; shadcn dialogs/dropdowns/tooltips/popovers animate via `tailwindcss-animate`; button `active:scale-95`; `transition-colors` on fields. `framer-motion` installed for future targeted motion.

### Declutter
- Reverted — nav kept intact per "don't remove anything". All routes/pages/buttons present.

## Token rename map (if you see broken colors after a merge)
Postiz value vars `--color-X` were renamed to `--pz-X` in `colors.css`, and Tailwind utilities remapped in `global.css` `@theme`. shadcn owns `primary`/`secondary`/`gray`/`input` (now orange/neutral); all other Postiz utilities map to `--pz-*`/`--new-*`.

## Validation
- `pnpm --filter ./apps/frontend build` — compile gate (must pass after each change).
- Visual: `docker compose -f docker-compose.dev.yaml up -d` → `pnpm dev` → http://localhost:4200.
