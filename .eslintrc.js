module.exports = {
    root: true,
    env: {
      node: true
    },
    extends: ['plugin:vue/essential', '@vue/standard', '@vue/typescript'],
    rules: {
      'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
  
      // ESLint
      camelcase: 'off',
      'no-useless-escape': 'off',
      'no-empty-pattern': 'off',
      'no-new': 'off',
      'space-before-function-paren': 'off',
      indent: 'off'
    },
    parserOptions: {
      parser: '@typescript-eslint/parser'
    }
}
  