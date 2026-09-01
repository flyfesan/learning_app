# Dependencies

This document lists every dependency in `package.json`, what it does, and where/why it is used in this project.

## Runtime dependencies (`dependencies`)

### Expo core

- **expo** (`~57.0.11`) - The Expo framework; provides the dev toolchain, modules, and the native runtime.
  - **Used in:** `package.json` scripts (`start`/`ios`/`android`/`web`/`build`), `app.json` (app config/plugins), and as the entry point (`main: "expo-router/entry"`). Everything in the app runs on it.
- **expo-constants** (`~57.0.9`) - Provides access to app/system constants (app config, build info).
  - **Used in:** Not imported directly in source; it is a dependency of Expo modules that read `app.json` config at runtime (e.g. `expo-router`).
- **expo-font** (`~57.0.1`) - Loads and manages custom fonts.
  - **Used in:** Declared as a plugin in `app.json` so Expo loads system font fallbacks for the app.
- **expo-linking** (`~57.0.5`) - Deep/universal linking support.
  - **Used in:** Not imported directly; Expo Router uses it under the hood to turn the `scheme` in `app.json` into deep links and to resolve `Link` navigation.
- **expo-router** (`~57.0.11`) - File-based routing and navigation built on React Navigation.
  - **Used in:** `app/_layout.tsx` (root `Stack`), `app/index.tsx`, `app/about.tsx`, and `components/header.tsx` (`Link`, `usePathname`). It is why every route is a file under `app/`.
- **expo-splash-screen** (`~57.0.5`) - Controls the native splash screen lifecycle.
  - **Used in:** Configured via `app.json` (`splash` section) to show the launch image until the app is ready.
- **expo-status-bar** (`~57.0.1`) - Configures the system status bar.
  - **Used in:** `app/_layout.tsx` renders `<StatusBar>` with the color matching the active color scheme.
- **expo-system-ui** (`~57.0.2`) - Manages root-level system UI (background color, appearance).
  - **Used in:** Not imported directly; installed so the root background color syncs with the app theme.

### React / React Native

- **react** (`19.2.3`) - Core UI library.
  - **Used in:** Every screen and component (`app/*`, `components/*`); all JSX renders through it.
- **react-dom** (`19.2.3`) - DOM renderer for React.
  - **Used in:** Not imported directly; required by `react-native-web` so the app can run in the browser (`pnpm web`).
- **react-native** (`0.86.2`) - The React Native runtime the app is built on.
  - **Used in:** All core UI (`View`, `TextInput`, `Pressable`, `Platform`, etc.) throughout `app/` and `components/`.
- **react-native-web** (`~0.21.0`) - Lets the React Native codebase run in the browser.
  - **Used in:** Not imported directly; Metro picks it up when running `pnpm web`, translating RN components to DOM.

### NativeWind / styling

- **nativewind** (`^4.2.2`) - Tailwind CSS for React Native; compiles utility classes into native styles.
  - **Used in:** Every `className` in the codebase (e.g. `app/index.tsx`, `components/ui/*`), `global.css` import in `app/_layout.tsx`, `babel.config.js` (`nativewind/babel`), `metro.config.js` (`withNativeWind`), `tailwind.config.js` (preset), and `cssInterop` in `components/ui/icon.tsx`.
- **react-native-css-interop** (`0.2.6`) - Runtime engine that powers NativeWind's CSS-to-native transformation.
  - **Used in:** Not imported directly; it is the engine NativeWind compiles to at runtime.
- **tailwind-merge** (`^3.5.0`) - Merges/overrides Tailwind class names without conflicts.
  - **Used in:** `lib/utils.ts` inside the `cn()` helper, which every UI component (`components/ui/*`) uses to combine classes.

### shadcn/ui native primitives (React Native Reusables)

- **@rn-primitives/portal** (`1.5.2`) - Renders children into an app-level portal.
  - **Used in:** `components/ui/select.tsx` wraps the dropdown in `SelectPrimitive.Portal`, and `app/_layout.tsx` mounts `<PortalHost />` at the root so select overlays render above everything.
- **@rn-primitives/select** (`1.5.2`) - Headless select/dropdown primitive.
  - **Used in:** `components/ui/select.tsx` builds the styled `Select` on top of it; that `Select` is used in `app/index.tsx` for the source/target language pickers.
- **@rn-primitives/slot** (`1.5.2`) - Passes props to a single child (Radix-style Slot pattern).
  - **Used in:** `components/ui/text.tsx` enables `asChild` so a `<Text>` can render another component's children (e.g. inside `Button`).
- **class-variance-authority** (`^0.7.1`) - Variant-based styling API.
  - **Used in:** `components/ui/button.tsx` (`buttonVariants`) and `components/ui/text.tsx` (`textVariants`) to define variant/size class maps.
- **clsx** (`^2.1.1`) - Conditional class name builder.
  - **Used in:** `lib/utils.ts` inside the `cn()` helper, alongside `tailwind-merge`.
- **lucide-react-native** (`^1.30.0`) - Icon set.
  - **Used in:** `components/ui/icon.tsx` (generic `Icon` wrapper), `components/ui/select.tsx` (`Check`, `ChevronDown`, etc.), and `components/header.tsx` (`Moon`, `Sun` for the theme toggle).

### React Native native modules

- **react-native-gesture-handler** (`~2.32.0`) - Gesture handling for touch interactions.
  - **Used in:** `app/_layout.tsx` wraps the app in `<GestureHandlerRootView>` as required by the gesture system (also needed by reanimated).
- **react-native-reanimated** (`4.5.1`) - High-performance animations library.
  - **Used in:** `components/ui/select.tsx` (`FadeIn`/`FadeOut` entering/exiting animations) and `components/ui/native-only-animated-view.tsx` (`Animated.View`/`createAnimatedComponent`).
- **react-native-safe-area-context** (`~5.7.0`) - Safe area (notch/home indicator) insets.
  - **Used in:** `app/_layout.tsx` wraps the layout in `<SafeAreaView>` so content avoids device notches.
- **react-native-screens** (`~4.26.0`) - Native screen containers for faster navigation transitions.
  - **Used in:** `components/ui/select.tsx` imports `FullWindowOverlay` from it so the select dropdown renders above everything on iOS. It is also used internally by Expo Router for native navigation.
- **react-native-svg** (`15.15.4`) - SVG rendering.
  - **Used in:** Not imported directly; `lucide-react-native` renders its icons through it.
- **react-native-worklets** (`0.10.1`) - Worklet runtime.
  - **Used in:** Not imported directly; reanimated v4 runs its animations on this standalone worklet runtime.

### Utilities

- **zod** (`^4.4.3`) - Schema validation.
  - **Used in:** `contracts/translate.ts` defines `TranslateRequestSchema` (shared with the Supabase Edge Function), and `services/translate.ts` validates request input with `safeParse` before calling the API.

## Development dependencies (`devDependencies`)

- **@babel/core** (`^7.26.0`) - Babel compiler core.
  - **Used in:** `babel.config.js` (via `babel-preset-expo`) for transforming the codebase through Metro.
- **@eslint/js** (`^10.0.1`) - ESLint's official shared config for the flat config format.
  - **Used in:** `eslint.config.mjs` (`js.configs.recommended`).
- **@types/react** (`~19.2.2`) - TypeScript type definitions for React.
  - **Used in:** Type checking only (`pnpm typecheck`); enables correct types on JSX/React APIs.
- **eslint** (`^9.39.5`) - Linter.
  - **Used in:** `pnpm lint` with flat config in `eslint.config.mjs`.
- **eslint-config-expo** (`~57.0.1`) - Expo's recommended ESLint config.
  - **Used in:** `eslint.config.mjs` (`expo` flat config).
- **globals** (`^16.0.0`) - Global variable definitions for ESLint environments.
  - **Used in:** `eslint.config.mjs` provides `globals.node` for config files.
- **tailwindcss** (`^3.4.14`) - Tailwind CSS compiler.
  - **Used in:** `tailwind.config.js` and `global.css`; NativeWind consumes it to generate the utility classes used in `className`.
- **tailwindcss-animate** (`^1.0.7`) - Tailwind plugin for animation utilities.
  - **Used in:** `tailwind.config.js` (`plugins`); provides the `animate-in`/`slide-in-from-*` utilities used by `components/ui/select.tsx` on web.
- **typescript** (`~6.0.3`) - TypeScript compiler.
  - **Used in:** `pnpm typecheck` (`tsc --noEmit`) and IDE tooling via `tsconfig.json`.
- **typescript-eslint** (`^8.66.0`) - TypeScript support for ESLint.
  - **Used in:** `eslint.config.mjs` (`tseslintConfigs.recommended`) for type-aware linting rules.
