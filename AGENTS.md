# AGENTS.md

## Project context
- This is an Expo (React Native) app built with Expo Router, TypeScript, and NativeWind.
- UI components come from shadcn/ui native (React Native Reusables) in `components/ui/`.
- The translation feature calls a Supabase Edge Function defined in `supabase/functions/translate`; shared request/response types live in `contracts/`.
- Project documentation lives in `docs/` (e.g. `docs/DEPENDENCIES.md`). Put all documentation here instead of the repo root.

## Commands
- `pnpm start` - start the Expo dev server (Metro on port 8081)
- `pnpm ios` / `pnpm android` - run on iOS / Android
- `pnpm web` - run in the browser (react-native-web)
- `pnpm lint` - ESLint (flat config, includes eslint-config-expo)
- `pnpm typecheck` - TypeScript type checking
- `pnpm build` - export a production build (`expo export`)
- Supabase: use the Supabase CLI (`supabase start`, `supabase functions serve`). The Edge Function runs on Deno; `.vscode/settings.json` enables the Deno extension for `supabase/functions`.

## Working conventions
- Keep changes focused and easy to review.
- Prefer the simplest solution that satisfies the request and fits the existing files.
- Preserve existing conventions when they are present; when none exist, favor standard patterns for the framework being used.
- Add or update tests when behavior changes, especially for bug fixes and new features.
- Avoid unnecessary dependencies or large refactors unless the task explicitly calls for them.

## When making changes
- Check the repository contents first and avoid assuming a stack that is not present.
- If a task is ambiguous, ask for clarification rather than making assumptions.
- Keep documentation and instructions updated as the project evolves.

## Expectations for AI agents
- Be concise and practical.
- Prefer explaining intent and tradeoffs briefly when changing structure or architecture.
- Do not invent project conventions that are not supported by the repository.
