import eslint from '@eslint/js';
import eslintTypescript from 'typescript-eslint';
import eslintAngular from '@angular-eslint/eslint-plugin';
import eslintAngularTemplate from '@angular-eslint/eslint-plugin-template';
import eslintImport from 'eslint-plugin-import';
import eslintStorybook from 'eslint-plugin-storybook';

export default eslintTypescript.config(
  eslint.configs.recommended,
  ...eslintTypescript.configs.recommended,
  {
    ignores: ['**/*.d.ts', 'dist/**'],
  },
  {
    plugins: {
      '@angular-eslint': eslintAngular,
      import: eslintImport,
    },
    languageOptions: {
      parser: eslintTypescript.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        project: true,
        sourceType: 'module',
      },
    },
    rules: {
      ...eslintAngular.configs.recommended.rules,
      ...eslintAngularTemplate.configs['process-inline-templates'].rules,
      ...eslintImport.configs.recommended.rules,
      ...eslintImport.configs.typescript.rules,
      complexity: ['error', 10],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: ['app', 'lib'],
          style: 'kebab-case',
        },
      ],
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: ['app', 'lib'],
          style: 'camelCase',
        },
      ],
      '@angular-eslint/prefer-standalone': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
      'import/no-named-as-default': 'off',
      'import/no-named-as-default-member': 'off',
      'no-restricted-imports': [
        'error',
        {
          patterns: ['../*'],
        },
      ],
    },
    settings: {
      'import/parsers': {
        espree: ['.js', '.cjs', '.mjs'],
      },
      'import/resolver': {
        typescript: true,
      },
    },
  },
  {
    files: ['*.html'],
    ...eslintAngularTemplate.configs.recommended,
  },
  {
    files: ['*.spec.ts', 'test-helpers.ts'],
    rules: {
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          args: 'none',
        },
      ],
    },
  },
  {
    files: ['*.stories.ts'],
    ...eslintStorybook.configs.recommended,
  }
);
