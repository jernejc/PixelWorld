const path = require('path');
const webpack = require('webpack');

// Webpack plugins
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const PROD = (process.env.NODE_ENV == 'production');

const config = {
  target: 'web',
  mode: PROD ? process.env.NODE_ENV : 'development',

  entry: {
    app: './client/index.js'
  },

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].bundle.js',
    library: 'collabs',
    libraryTarget: 'var'
  },

  module: {
    rules: [
      {
        test: /config\.json$/,
        use: [
          {
            loader: path.resolve(__dirname, 'webpack/config-loader.js'),
          },
        ],
      },
    ],
  },

  resolve: {
    extensions: ['.js'],
    alias: { // must keep in sync with jsconfig
      '@actions': path.resolve(__dirname, 'client/actions/'),
      '@components': path.resolve(__dirname, 'client/components/'),
      '@models': path.resolve(__dirname, 'client/models/'),
      '@initializers': path.resolve(__dirname, 'client/initializers/'),
      '@scenes': path.resolve(__dirname, 'client/scenes/'),
      '@services': path.resolve(__dirname, 'client/services/'),
      '@util': path.resolve(__dirname, 'client/util/'),
      '@root': path.resolve(__dirname, __dirname)
    }
  },

  plugins: [
    new CleanWebpackPlugin(),
    new CopyPlugin([{
      from: path.resolve(__dirname, 'client/assets'),
      to: path.resolve(__dirname, 'dist/assets')
    }]),
    new CopyPlugin([{
      from: path.resolve(__dirname, 'client/abis'),
      to: path.resolve(__dirname, 'dist/abis')
    }]),
    new webpack.DefinePlugin({
      PRODUCTION: PROD,
      VERSION: "0.1.1",
      DEBUG: false // !PROD
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'client/public/index.html'),
      inject: 'head',
      chunksSortMode: (a, b) => {
        if (a[0] < b[0])
          return 1;
        if (a[0] > b[0])
          return -1;

        return 0;
      }
    })
  ]
}

if (!PROD) { // DEV config
  config.output.filename = '[name].bundle.js';
  config.devtool = 'inline-source-map';
  config.devServer = {
    static: path.join(__dirname, 'dist'),
    compress: true,
    port: 9000
  }
}

module.exports = config;
