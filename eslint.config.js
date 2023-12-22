import antfu from '@antfu/eslint-config'

export default antfu(
  {
    unocss: true,
    ignores: [
      // eslint ignore globs here
    ],
  },
  {
    rules: {
      'style/no-trailing-spaces': ['error', { ignoreComments: true }],
      'style/max-statements-per-line': ['error', { max: 2 }],
      'unused-imports/no-unused-vars': 'warn',
    },
  },
  {
    files: ['*.md'],
    rules: {
      'style/no-trailing-spaces': 'off',
    },
  },
)
