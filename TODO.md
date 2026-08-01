# Production Readiness TODO (Configuration)

## High Priority

- [ ] Add CI workflow under `.github/workflows/` to run `pnpm install --frozen-lockfile`, `pnpm run lint`, and `pnpm run build` on every PR and push.
- [ ] Add a deployment manifest (for example `render.yaml`) so deploy settings are versioned and reproducible.

## Medium Priority

- [ ] Make build output deterministic by avoiding repository-folder mutation after build. Rework Pagefind output handling so deployment artifacts are produced in CI/build outputs, not copied into source folders.
- [ ] Add `.env.example` with all required and optional environment variables and short descriptions.
- [ ] Tighten ESLint ignores in `eslint.config.js` to avoid ignoring all of `public/**`; ignore only generated paths such as `public/pagefind/**` and `.astro/**`.

## Low Priority

- [ ] Remove stale path alias in `tsconfig.json` for `@/astro-paper.config`.
- [ ] Add runtime/tooling constraints in `package.json`:
	- [ ] `packageManager` pin (pnpm version)
	- [ ] `engines.node` and `engines.pnpm`

## Validation Checklist

- [ ] Fresh clone setup works with documented commands.
- [ ] CI passes lint and build checks.
- [ ] Deployment works from config-only setup (no manual dashboard-only steps).
- [ ] No generated artifacts are required to be committed for successful deploy.
