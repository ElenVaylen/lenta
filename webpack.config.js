const webpack = require('webpack');
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const autoprefixer = require('autoprefixer');
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

const fs = require('fs')
const PATHS = {
  src: path.join(__dirname, './src'),
  dist: path.join(__dirname, './dist')
}
const PAGES_DIR = `${PATHS.src}`
const PAGES = fs.readdirSync(PAGES_DIR).filter(fileName => fileName.endsWith('.pug'))

module.exports = {
  entry: [
    'babel-polyfill', './src/app.js',
    './src/styles/style.scss'
  ],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: "[name].bundle.js",
  },
  devServer: {
    port: 8080,
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.js$/,
				exclude: /node_modules/,
				use: {
					loader: "babel-loader",
					query: {
						presets: [
							["@babel/preset-env", { modules: false }]
						]
					}
				}
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              hmr: process.env.NODE_ENV === 'development'
            },
          },
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
                plugins: [
                  autoprefixer()
                ],
                sourceMap: true
            }
          },
          'sass-loader',
        ],
      },
      {
        test: /\.(gif|png|jpe?g|svg)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'images/',
            },
          },
        ],
      },
      {
        test: /\.(woff(2)?|ttf|eot)(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'fonts/',
            },
          },
        ],
      },
      {
        test: /\.pug$/,
        loaders: [
          {
            loader: "pug-loader",
            options: {
              "pretty":true
            }
          }
        ]
      }
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css',
    }),
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, 'src/fonts'),
        to: path.resolve(__dirname, 'dist/fonts'),
      },
      {
        from: path.resolve(__dirname, 'src/images'),
        to: path.resolve(__dirname, 'dist/images'),
      },
      {
        from: path.resolve(__dirname, 'src/favicon.ico'),
        to: path.resolve(__dirname, 'dist/'),
      },
    ]),
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery'
		}),
    ...PAGES.map(page => new HtmlWebpackPlugin ({
      template: `${PAGES_DIR}/${page}`,
      filename: `./${page.replace(/\.pug/,'.html')}`
    }))
  ]
};