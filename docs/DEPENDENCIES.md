# Dependencies

This document lists every dependency in `package.json` and its purpose in this project.

## Runtime dependencies (`dependencies`)

### Expo core
- **expo** (`~57.0.11`) - The Expo framework; provides the dev toolchain, modules, and APIs that power the app.
- **expo-constants** (`~57.0.9`) - Provides access to the app's system constants (app config, build info, etc.).
- **expo-font** (`~57.0.1`) - Loads and manages custom fonts (and system font fallbacks).
- **expo-linking** (`~57.0.5`) - Handles deep/universal links; used by Expo Router for navigation.
- **expo-router** (`~57.0.11`) - File-based routing and navigation library on top of React Navigation.
- **expo-splash-screen** (`~57.0.5`) - Controls the native splash screen lifecycle (show/hide on startup).
- **expo-status-bar** (`~57.0.1`) - Wrapper for configuring the system status bar.
- **expo-system-ui** (`~57.0.2`) - Manages root-level system UI (background color, appearance).

### React / React Native
- **react** (`19.2.3`) - Core UI library.
- **react-dom** (`19.2.3`) - DOM renderer for React; needed for react-native-web.
- **react-native** (`0.86.2`) - The React Native runtime that the app is built on.
- **react-native-web** (`~0.21.0`) - Lets the React Native codebase run in the browser (`pnpm web`).

### NativeWind / styling
- **nativewind** (`^4.2.2`) - Tailwind CSS for React Native; compiles utility classes into native styles.
- **react-native-css-interop** (`0.2.6`) - Runtime engine that powers NativeWind's CSS-to-native transformation.
- **tailwind-merge** (`^3.5.0`) - Merges/overrides Tailwind class names without conflicts; used by `cn()`.

### shadcn/ui native primitives (React Native Reusables)
- **@rn-primitives/portal** (`1.5.2`) - Renders children into an app-level portal (used by overlays/dialogs).
- **@rn-primitives/select** (`1.5.2`) - Headless select/dropdown primitive used by `components/ui/`.
- **@rn-primitives/slot** (`1.5.2`) - Passes props to a single child component (Radix-style Slot pattern).
- **class-variance-authority** (`^0.7.1`) - Variant-based styling API used by UI components.
- **clsx** (`^2.1.1`) - Conditional class name builder used alongside tailwind-merge.
- **lucide-react-native** (`^1.30.0`) - Icon set for the app's UI.

### React Native native modules
- **react-native-gesture-handler** (`~2.32.0`) - Gesture handling for touch interactions.
- **react-native-reanimated** (`4.5.1`) - High-performance animations library.
- **react-native-safe-area-context** (`~5.7.0`) - Safe area (notch/home indicator) insets.
- **react-native-screens** (`~4.26.0`) - Native screen containers for faster navigation transitions.
- **react-native-svg** (`15.15.4`) - SVG rendering (icons, vector graphics).
- **react-native-worklets** (`0.10.1`) - Worklet runtime for reanimated (v4 uses worklets standalone).

### Utilities
- **zod** (`^4.4.3`) - Schema validation for forms and data contracts.

## Development dependencies (`devDependencies`)

- **@babel/core** (`^7.26.0`) - Babel compiler core; used by Metro to transform the codebase.
- **@eslint/js** (`^10.0.1`) - ESLint's official shared config for the flat config format.
- **@types/react** (`~19.2.2`) - TypeScript type definitions for React.
- **eslint** (`^9.39.5`) - Linter (flat config).
- **eslint-config-expo** (`~57.0.1`) - Expo's recommended ESLint config.
- **globals** (`^16.0.0`) - Global variable definitions for ESLint environments.
- **tailwindcss** (`^3.4.14`) - Tailwind CSS compiler used by NativeWind.
- **tailwindcss-animate** (`^1.0.7`) - Tailwind plugin for animation utilities used by UI components.
- **typescript** (`~6.0.3`) - TypeScript compiler; used by `pnpm typecheck`.
- **typescript-eslint** (`^8.66.0`) - TypeScript support for ESLint.
