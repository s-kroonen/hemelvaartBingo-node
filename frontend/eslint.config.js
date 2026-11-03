// ESLint flat config for the React website. Rationale: docs/conventions.md.
import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
  // components/ui is generated shadcn/Figma code; it is replaced or removed in HEM-102.
  globalIgnores(['dist', 'src/components/ui', 'src/components/figma']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2023,
      globals: globals.browser,
    },
    rules: {
      // Existing code uses `any` widely (cleanup in HEM-51); warn so new code is flagged
      // without blocking every PR on old files. Same policy as the backend.
      '@typescript-eslint/no-explicit-any': 'warn',
      // Several pages copy fetched data into form state inside an effect. Fixing that means
      // restructuring those components, which needs tests first; warn until then.
      'react-hooks/set-state-in-effect': 'warn',
      'no-console': ['error', { allow: ['warn', 'error'] }],
    },
  },
]);
