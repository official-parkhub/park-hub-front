import antfu, { ignores } from '@antfu/eslint-config';
import jsxA11y from 'eslint-plugin-jsx-a11y';

export default antfu(
  {
    react: true,
    nextjs: true,
    typescript: true,
    lessOpinionated: true,
    isInEditor: false,
    stylistic: {
      semi: true,
    },
    formatters: {
      css: true,
    },
    ignores: ['./node_modules/**', './dist/**', './build/**', './.next/**', './tests/**'],
  },
  jsxA11y.flatConfigs.recommended,
  {
    rules: {
      'antfu/no-top-level-await': 'off',
      'style/brace-style': ['error', '1tbs'],
      'ts/consistent-type-definitions': ['error', 'type'],
      'react/prefer-destructuring-assignment': 'off',
      'node/prefer-global/process': 'off',
      'next/no-img-element': 'off',
      'react/no-array-index-key': 'off',
      'react-hooks-extra/no-direct-set-state-in-use-effect': 'off',
      'react/no-unnecessary-use-prefix': 'off',
    },
  },
);
