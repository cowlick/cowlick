var webpack = require("webpack");
var UglifyJSPlugin = require("uglifyjs-webpack-plugin");
var path = require("path");

var srcDir = path.join(__dirname, "src");
var outDir = path.join(__dirname, "game", "script");

var config = {
  entry: {
    "main": path.join(srcDir, "main.ts"),
    "eval": path.join(srcDir, "eval.ts"),
    "scenario": path.join(srcDir, "scenario.ts"),
    "config": path.join(srcDir, "config.ts"),
  },
  output : {
    path: outDir,
    filename: "[name].js",
    library: "[name]",
    libraryTarget: "commonjs2"
  },
  module : {
    rules: [
      {
        test: /\.ts$/,
        loader: "ts-loader"
      }
    ]
  },
  resolve: {
    extensions: [".js", ".ts"]
  },
  plugins: [
    new UglifyJSPlugin({
      uglifyOptions: {
        ecma: 6,
        compress: {
          warnings: false
        },
        output  : {
          comments: require("uglify-save-license")
        }
      }
    })
  ],
  node: {
    fs: "empty"
  }
};

module.exports = config;
