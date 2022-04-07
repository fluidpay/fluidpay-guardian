module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],
    plugins: ['@typescript-eslint'],
    ignorePatterns: ['*.cjs', 'node_modules'],
    parserOptions: {
        sourceType: 'module',
        ecmaVersion: 2019
    },
    env: {
        browser: true,
        es2017: true,
        node: true
    },
    rules: {
        '@typescript-eslint/consistent-type-assertions': ['error', { assertionStyle: 'as' }],
        '@typescript-eslint/array-type': ['error', { default: 'array' }]
    }
};
