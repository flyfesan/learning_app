import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import expo from 'eslint-config-expo/flat.js';
import globals from 'globals';
import { configs as tseslintConfigs } from 'typescript-eslint';

export default defineConfig([
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      '.expo/**',
      '.astro/**',
      'public/**',
      'supabase/**',
      'supabase/.temp/**',
    ],
  },
  js.configs.recommended,
  ...tseslintConfigs.recommended,
  expo,
  {
    files: ['**/*.{js,mjs,cjs,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
    rules: {
      'no-console': 'warn',
      'no-debugger': 'error',
      'no-alert': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-explicit-any': 'error'
    }
  },
  {
    files: ['*.config.js', '*.config.mjs', 'eslint.config.mjs', '*.config.ts'],
    languageOptions: {
      globals: {
        ...globals.node
      }
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off'
    }
  }
]);
