# Production Readiness TODO (Expo)

## High Priority

- [ ] Add CI workflow under `.github/workflows/` to run `pnpm install --frozen-lockfile`, `pnpm run lint`, `pnpm run typecheck`, and `pnpm run build` on every PR and push.
- [ ] Add a deployment manifest (for example `eas.json` or `render.yaml`) so deploy settings are versioned and reproducible.

## Medium Priority

- [ ] Add `.env.example` with all required and optional environment variables and short descriptions.
- [ ] Remove stale path aliases in `tsconfig.json` (`@contracts/*`) if the `contracts/` directory is merged or relocated.
- [ ] Verify the shadcn/React Native Reusables components (`components/ui/`) against a physical device; the Select component in particular should be tested on Android and iOS.

## Low Priority

- [ ] Add runtime/tooling constraints in `package.json`:
  - [ ] `packageManager` pin (pnpm version)
  - [ ] `engines.node` and `engines.pnpm`

## Validation Checklist

- [ ] Fresh clone setup works with documented commands.
- [ ] CI passes lint, typecheck, and build checks.
- [ ] Deployment works from config-only setup (no manual dashboard-only steps).
- [ ] No generated artifacts are required to be committed for successful deploy.
