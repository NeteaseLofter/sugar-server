export const babelConfig = {
  presets: [
    ['@babel/preset-typescript'],
    ['@babel/preset-react'],
    [
      '@babel/preset-env',
      {
        loose: true,
        targets: {
          chrome: '58',
          ie: '11'
        }
        // useBuiltIns: "entry"
        // corejs: false
      }
    ]
  ],
  plugins: [
    [
      '@babel/plugin-transform-runtime',
      {
        // "corejs": 3,
        // polyfill: false,
        corejs: false,
        regenerator: true
      }
    ],
    '@babel/plugin-transform-arrow-functions',
    '@babel/plugin-proposal-object-rest-spread',
    [
      '@babel/plugin-proposal-decorators',
      {
        legacy: true
      }
    ],
    [
      '@babel/plugin-proposal-class-properties',
      {
        loose: true
      }
    ]
  ]
}
