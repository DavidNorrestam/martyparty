import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import svelte from 'eslint-plugin-svelte';
import svelteParser from 'svelte-eslint-parser';
import globals from 'globals';

export default [
    js.configs.recommended,
    {
        files: ['**/*.ts', '**/*.svelte'],
        languageOptions: {
            parser: tsparser,
            parserOptions: {
                sourceType: 'module',
                ecmaVersion: 2020,
                extraFileExtensions: ['.svelte']
            },
            globals: {
                ...globals.browser,
                ...globals.es2017,
                ...globals.node
            }
        },
        plugins: {
            '@typescript-eslint': tseslint
        },
        rules: {
            ...tseslint.configs.recommended.rules,
            // Svelte 5 specific: allow unused vars starting with $ (runes)
            '@typescript-eslint/no-unused-vars': [
                'warn',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^\\$'
                }
            ],
            // Allow explicit any when necessary
            '@typescript-eslint/no-explicit-any': 'warn'
        }
    },
    {
        files: ['**/*.svelte'],
        languageOptions: {
            parser: svelteParser,
            parserOptions: {
                parser: tsparser
            }
        },
        plugins: {
            svelte
        },
        rules: {
            ...svelte.configs.recommended.rules
        }
    },
    {
        ignores: [
            'node_modules/**',
            '.svelte-kit/**',
            'dist/**',
            'build/**',
            '**/*.config.js',
            '**/*.config.ts'
        ]
    }
];
