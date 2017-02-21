'use strict';

// Depends
const path         = require('path');
const webpack      = require('webpack');
const Manifest     = require('manifest-revision-webpack-plugin');
const TextPlugin   = require('extract-text-webpack-plugin');
const autoprefixer = require('autoprefixer');
const HtmlPlugin   = require('html-webpack-plugin');
const BrowserSync  = require('browser-sync-webpack-plugin');

/**
 * Global webpack config
 * @param  {[type]} _path [description]
 * @return {[type]}       [description]
 */
module.exports = function(_path) {
  // define local variables
  const npmPackages = require(_path + '/package');
  const dependencies  = (npmPackages.dependencies) ? Object.keys(npmPackages.dependencies) : false;
  const rootAssetPath = _path + 'app';

  // define entry points
  const entryPoints = {
    application: _path + '/app/app.js'
  };
  // check vendors
  if (dependencies) {
    entryPoints.vendors = dependencies
  }

  // return objecy
  return {
    // entry points
    entry: entryPoints,

    // output system
    output: {
      path: path.join(_path, 'dist'),
      filename: path.join('assets', 'js', '[name].[hash].js'),
      chunkFilename: '[id].bundle.[chunkhash].js',
      publicPath: '/'
    },

    // resolves modules
    resolve: {
      extensions: ['.js'],
      modules: ['node_modules'],
      alias: {
        _svg: path.join(_path, 'app', 'assets', 'svg'),
        _fonts: path.join(_path, 'app', 'assets', 'fonts'),
        _js: path.join(_path, 'app', 'assets', 'javascript'),
        _images: path.join(_path, 'app', 'assets', 'images'),
        _stylesheets: path.join(_path, 'app', 'assets', 'stylesheets')
      }
    },

    // modules resolvers
    module: {
      rules: [
        {
          test: /\.pug$/,
          use: 'pug-loader'
        },
        {
          test: /\.styl$/,
          use: TextPlugin.extract(['css-loader', 'postcss-loader', 'stylus-loader'])
        },
        {
          test: /\.(css|ttf|eot|woff|woff2|png|ico|jpg|jpeg|gif|svg)$/i,
          use: ['file-loader?context=' + rootAssetPath + '&name=assets/static/[ext]/[name].[hash].[ext]']
        },
        {
          test: /\.js$/,
          use: {
            loader: 'babel-loader',
            options: { presets: ['es2015'] }
          },
          exclude: /(node_modules|bower_components)/
        }
      ]
    },

    // load plugins
    plugins: [
      function() {
        // run plugin if there is a vendors
        if (dependencies) {
          return new webpack.optimize.CommonsChunkPlugin({
            name: 'vendors',
            filename: 'assets/js/vendors.[hash].js'
          })
        }
      },
      new TextPlugin('assets/css/[name].[chunkhash].css'),
      new webpack.LoaderOptionsPlugin({
        options: {
          postcss: [
            autoprefixer({ browsers: ['last 5 versions'] })
          ]
        }
      }),
      new Manifest(path.join(_path + '/config', 'manifest.json'), {
        rootAssetPath: rootAssetPath,
        ignorePaths: ['.DS_Store']
      }),
      new BrowserSync({
        host: 'localhost',
        port: 8090,
        proxy: 'http://localhost:8080/'
      }),

      // create instance for entrypoint index.html building
      new HtmlPlugin({
        chunks: ['application', 'vendors'],
        template: path.join(_path, 'app', 'views', 'pages', 'index.pug')
      })
    ]
  };
};
