import nextConfig from 'eslint-config-next';

export default [
  ...nextConfig,
  {
    ignores: ['src/generated/**'],
  },
  {
    rules: {
      // Downgrade new React 19 compiler rules to warnings (pre-existing issues)
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/immutability': 'warn',
      'react-hooks/purity': 'warn',
      'react-hooks/static-components': 'warn',
      'react-hooks/preserve-manual-memoization': 'warn',
      'react/no-unescaped-entities': 'warn',
    },
  },
];
