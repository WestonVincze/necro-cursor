const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './src/app.js',
  output: {
    filename: 'app.js',
    path: path.resolve(__dirname, 'build'),
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html'
    }),
    new CopyPlugin({
      patterns: [
        { from: 'assets', to: 'assets' },
      ],
    }),
  ],
  devServer: {
    static: [
      {
        directory: path.join(__dirname, 'build'),
        watch: true,
      },
      {
        directory: path.join(__dirname, 'assets'),
        watch: true,
        publicPath: '/assets/',
      },
    ],
    compress: true,
    port: 6969,
  },
};
