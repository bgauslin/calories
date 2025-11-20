const common = require('./webpack.common.js');
const {merge} = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = merge(common, {
  mode: 'production',
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin(),
    ],
  },
  output: {
    filename: '[contenthash].js',
  },
  plugins: [
    new HtmlWebpackPlugin({
      base: '/calories/',
      filename: 'index.html',
      template: 'src/html/index.html',
    }),
    new MiniCssExtractPlugin({
      filename: '[contenthash].css',
    }),
  ],
});