var webpack = require("webpack");
var path = require("path");

var srcDir = path.join(__dirname, "src");
var outDir = path.join(__dirname, "game", "script");

var config = {
  entry: {
    "main": path.join(srcDir, "main.ts"),
    "eval": path.join(srcDir, "eval.ts"),
    "scenario": path.join(srcDir, "scenario.ts")
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
  ],
  node: {
    fs: "empty"
  }
};

module.exports = config;
