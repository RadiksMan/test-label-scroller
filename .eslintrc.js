module.exports = {
    root: true,
    parser: 'babel-eslint',
    extends: ['airbnb', 'prettier', 'prettier/react'],
    plugins: ['react', 'jsx-a11y', 'import', 'eslint-plugin-prettier', 'eslint-plugin-react'],
    rules: {
      'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
      'import/prefer-default-export': 'off',
      'import/no-unresolved': [2, { caseSensitive: false }],
      'react/jsx-filename-extension': [1, { extensions: ['.js', '.jsx'] }],
      'react/prefer-stateless-function': [0],
      'react/jsx-indent': [0],
      'react/sort-comp': [0],
      'react/destructuring-assignment': [0],
      'react/forbid-prop-types': [0],
      'react/no-unescaped-entities': ['error', { forbid: ['>', '}'] }],
      quotes: ['error', 'single', { avoidEscape: true, allowTemplateLiterals: false }],
      'jsx-quotes': ['error', 'prefer-double'],
      camelcase: 'off',
      'no-use-before-define': 'off',
      semi: ['error', 'always'],
      'global-require': 'off',
  
      'no-underscore-dangle': 0,
      'consistent-return': 0,
      'no-console': 'off',
      'react/jsx-props-no-spreading': 'off'
    },
    settings: {
      'import/resolver': {
        node: {
          paths: ['src']
        }
      }
    },
    env: {
      jest: true,
      es6: true,
      node: true
    },
    globals: {
      fetch: false,
      _: true
    }
  };
  