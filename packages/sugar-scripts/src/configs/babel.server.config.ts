const path = require('path');

export const babelConfig = {
  presets: [
    [
      '@babel/preset-typescript',
      {
        'onlyRemoveTypeImports': true
      }
    ],
    ['@babel/preset-react'],
    [
      '@babel/preset-env',
      {
        loose: true,
        targets: {
          node: 'current'
        }
      }
    ]
  ],
  plugins: [
    // [
    //   '@babel/plugin-transform-runtime',
    //   {
    //     corejs: 3,
    //     regenerator: true
    //   }
    // ],
    '@babel/plugin-transform-arrow-functions',
    '@babel/plugin-proposal-object-rest-spread',
    [
      '@babel/plugin-proposal-decorators',
      { legacy: true }
    ],
    [
      '@babel/plugin-proposal-class-properties',
      { loose: true }
    ],
    ['babel-plugin-parameter-decorator']
  ]
}
