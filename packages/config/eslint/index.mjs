// @ts-check
import tsEslint from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier';

/**
 * Base ESLint flat config for all EBMS workspace packages.
 * Extends typescript-eslint recommended rules and disables
 * rules that conflict with Prettier (eslint-config-prettier).
 *
 * @param {string[]} [extraFiles] - Additional glob patterns to lint
 * @returns {import('typescript-eslint').ConfigArray}
 */
export function createBaseConfig(extraFiles = []) {
  return tsEslint.config(
    {
      files: ['src/**/*.ts', 'src/**/*.tsx', ...extraFiles],
      extends: [...tsEslint.configs.recommended],
      rules: {
        // Flag unused variables, but allow underscore-prefixed ones (_var)
        '@typescript-eslint/no-unused-vars': [
          'error',
          { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
        ],
        // Warn on explicit any — use unknown instead where possible
        '@typescript-eslint/no-explicit-any': 'warn',
        // Require explicit return types on module-boundary functions
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        // Consistent type imports
        '@typescript-eslint/consistent-type-imports': [
          'error',
          { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
        ],
      },
    },
    // Disable all ESLint rules that conflict with Prettier formatting
    prettierConfig,
  );
}

export default createBaseConfig();
