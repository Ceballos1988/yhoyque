import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default [
  {
    ignores: ['dist'], // Directory to ignore
  },
  {
    files: ['**/*.{js,jsx}'], // Files to lint
    languageOptions: {
      ecmaVersion: 2020, // ECMAScript 2020
      globals: globals.browser, // Global variables available in browser environments
      parserOptions: {
        ecmaVersion: 'latest', // Use the latest ECMAScript version
        ecmaFeatures: { jsx: true }, // Enable JSX
        sourceType: 'module', // Enable ECMAScript modules
      },
    },
    settings: {
      react: {
        version: 'detect', // Automatically detect the version of React
      },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules, // Include JavaScript best practices
      ...react.configs.recommended.rules, // Include recommended React rules
      ...react.configs['jsx-runtime'].rules, // Include JSX runtime rules for React 17+
      ...reactHooks.configs.recommended.rules, // Include React hooks rules
      'react/jsx-no-target-blank': 'off', // Disable rule for links with target="_blank"
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true }, // Allow export of constant components
      ],
    },
  },
];
