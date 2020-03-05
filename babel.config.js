module.exports = {
  presets: [
    [
      '@babel/preset-env', {
        targets: {
          node: 'current',
        },
      }
    ],
  ],
  plugins: [
    [
      '@babel/plugin-proposal-decorators',
      { decoratorsBeforeExport: false },
    ],
    '@babel/plugin-proposal-class-properties'
  ]
};
