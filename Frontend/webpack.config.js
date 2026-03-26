const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const dotenv = require('dotenv');
const fs = require('fs');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  const shouldAnalyze = process.env.ANALYZE === 'true';

  const envFile = isProduction ? '.env.production' : '.env.development';
  const envVars = {
    ...(fs.existsSync('.env') ? dotenv.parse(fs.readFileSync('.env')) : {}),
    ...(fs.existsSync(envFile) ? dotenv.parse(fs.readFileSync(envFile)) : {}),
  };

  const defineEnv = Object.keys(envVars).reduce((acc, key) => {
    acc[`process.env.${key}`] = JSON.stringify(envVars[key]);
    return acc;
  }, {
    'process.env.NODE_ENV': JSON.stringify(isProduction ? 'production' : 'development'),
  });

  return {
    mode: isProduction ? 'production' : 'development',

    entry: './src/index.js',

    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isProduction
        ? 'static/js/[name].[contenthash:8].js'
        : 'static/js/[name].js',
      chunkFilename: isProduction
        ? 'static/js/[name].[contenthash:8].chunk.js'
        : 'static/js/[name].chunk.js',
      assetModuleFilename: 'static/media/[name].[contenthash:8][ext]',
      publicPath: '/',
      clean: true,
    },

    devtool: isProduction ? 'source-map' : 'eval-source-map',

    devServer: {
      port: 3000,
      hot: true,
      historyApiFallback: true,
      open: true,
      compress: true,
      static: {
        directory: path.resolve(__dirname, 'public'),
        publicPath: '/',
      },
      client: {
        overlay: { errors: true, warnings: false },
      },
      proxy: [
        {
          context: ['/predict', '/api'],
          target: 'http://localhost:8000',
          changeOrigin: true,
        },
      ],
    },

    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
              plugins: !isProduction ? ['react-refresh/babel'] : [],
            },
          },
        },
        {
          test: /\.css$/,
          use: [
            isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
            'css-loader',
            'postcss-loader',
          ],
        },
        {
          test: /\.(png|jpe?g|gif|webp|avif)$/i,
          type: 'asset',
          parser: { dataUrlCondition: { maxSize: 10 * 1024 } },
        },
        {
          test: /\.svg$/i,
          type: 'asset/resource',
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/i,
          type: 'asset/resource',
          generator: { filename: 'static/fonts/[name].[contenthash:8][ext]' },
        },
      ],
    },

    plugins: [
      new webpack.DefinePlugin(defineEnv),

      new HtmlWebpackPlugin({
        template: './public/index.html',
        favicon: fs.existsSync('./public/favicon.ico')
          ? './public/favicon.ico'
          : undefined,
        ...(isProduction && {
          minify: {
            removeComments: true,
            collapseWhitespace: true,
            removeRedundantAttributes: true,
            useShortDoctype: true,
            removeEmptyAttributes: true,
            removeStyleLinkTypeAttributes: true,
            keepClosingSlash: true,
            minifyJS: true,
            minifyCSS: true,
            minifyURLs: true,
          },
        }),
      }),

      new CopyWebpackPlugin({
        patterns: [
          {
            from: 'public',
            to: '',
            globOptions: { ignore: ['**/index.html'] },
            noErrorOnMissing: true,
          },
        ],
      }),

      ...(!isProduction
        ? [new ReactRefreshWebpackPlugin()]
        : [
            new MiniCssExtractPlugin({
              filename: 'static/css/[name].[contenthash:8].css',
              chunkFilename: 'static/css/[name].[contenthash:8].chunk.css',
            }),
          ]),

      ...(shouldAnalyze ? [new BundleAnalyzerPlugin()] : []),
    ],

    optimization: {
      minimize: isProduction,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            compress: { drop_console: true, drop_debugger: true },
            output: { comments: false },
          },
          extractComments: false,
        }),
        new CssMinimizerPlugin(),
      ],
      splitChunks: {
        chunks: 'all',
        maxInitialRequests: 20,
        maxAsyncRequests: 20,
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
          },
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: 'react',
            chunks: 'all',
            priority: 20,
          },
          recharts: {
            test: /[\\/]node_modules[\\/](recharts|d3-.*)[\\/]/,
            name: 'recharts',
            chunks: 'all',
            priority: 15,
          },
        },
      },
      runtimeChunk: 'single',
    },

    resolve: {
      extensions: ['.js', '.jsx', '.json'],
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },

    performance: {
      hints: isProduction ? 'warning' : false,
      maxEntrypointSize: 512000,
      maxAssetSize: 512000,
    },

    stats: isProduction ? 'normal' : 'minimal',
  };
};
