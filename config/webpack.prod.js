const ngtools = require('@ngtools/webpack');
const html = require('html-webpack-plugin');
const copy = require('copy-webpack-plugin');
const path = require('path');
const webpack = require('webpack');
const compression = require('compression-webpack-plugin');
const extract = require('extract-text-webpack-plugin');
const autoprefixer = require('autoprefixer');

module.exports = {
  context: path.resolve(__dirname, '..'),
  resolve: { extensions: ['.ts', '.js', '.json'] },
  entry: {
    app: './src/main.aot.ts'
  },
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: 'js/[name].bundle.js',
    sourceMapFilename: 'js/[name].bundle.map',
    chunkFilename: 'js/[id].chunk.js'
  },
  plugins: [
    new ngtools.AotPlugin({ tsConfigPath: './tsconfig.json' }),
    new html({ template: './src/index.html' }),
    new copy([{ context: './public', from: '**/*' }]),
    new webpack.optimize.UglifyJsPlugin({ mangle: { screw_ie8: true }, compress: { screw_ie8: true, warnings: false } }),
    new compression({ asset: "[path].gz[query]", algorithm: "gzip", test: /\.js$|\.html$/, threshold: 10240, minRatio: 0.8 }),
    new extract('[name].css'),
    new webpack.LoaderOptionsPlugin({ options: { postcss: [ autoprefixer ] } })
  ],
  module: {
    rules: [
      { test: /\.css$/, use: extract.extract({ fallback: 'style-loader', use: [ 'css-loader', 'postcss-loader' ] }), include: [path.resolve(__dirname, '../src/styles')] },
      { test: /\.css$/, use: ['to-string-loader', 'css-loader', 'postcss-loader' ], exclude: [path.resolve(__dirname, '../src/styles')] },
      { test: /\.scss$|\.sass$/, loader: extract.extract({ fallback: 'style-loader', use: ['css-loader', 'postcss-loader', 'sass-loader'] }), exclude: [path.resolve(__dirname, '../src/app')] },
      { test: /\.scss$|\.sass$/, use: ['to-string-loader', 'css-loader', 'postcss-loader', 'sass-loader'], exclude: [path.resolve(__dirname, '../src/styles')] },
      { test: /\.html$/, loader: 'raw-loader' },
      { test: /\.ts$/, loader: '@ngtools/webpack' },
      { test: /\.json$/, loader: 'json-loader' },
      { test: /\.(jp?g|png|gif)$/, loader: 'file-loader', options: { hash: 'sha512', digest: 'hex', name: 'images/[hash].[ext]' } },
      { test: /\.(eot|woff2?|svg|ttf|otf)([\?]?.*)$/, loader: 'file-loader', options: { hash: 'sha512', digest: 'hex', name: 'fonts/[hash].[ext]' } }
    ]
  }
};
