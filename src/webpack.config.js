const path = require('path');
var webpack = require("webpack");

module.exports = (env, argv) => {
   return {
      entry: './src/main.ts',
      devtool: 'inline-source-map',
      module: {
         rules: [
            {
               test: /\.tsx?$/,
               use: 'ts-loader',
               exclude: /node_modules/
            }
         ]
      },
      resolve: {
         extensions: ['.tsx', '.ts', '.js']
      },
      output: {
         filename: 'web-source.js',
         path: path.resolve(__dirname, 'web')
      },
      devServer: {
         static: {
            directory: path.resolve(__dirname, 'web'),
         },
         headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
            "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
         },
         compress: true,
         port: 9000,
      },
      plugins: [
         new webpack.DefinePlugin({
            _DEVMODE: !!(argv.mode == 'development')
         })
      ],
      // ignore file size warning
      performance: {
         hints: false,
      },
   }
};