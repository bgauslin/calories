const common = require('./webpack.common.js');
const merge = require('webpack-merge');
const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = merge(common, {
  mode: 'development',
  output: {
    filename: '[name].js',
  },
  devServer: {
    contentBase: './dist'
  },
  plugins: [
    new CopyPlugin([
      { from: 'src/json' },
    ]),
    new MiniCssExtractPlugin({
      filename: '[name].css',
    }),
  ],
});
