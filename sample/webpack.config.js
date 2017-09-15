var webpack = require("webpack");
var path = require("path");

var srcDir = path.join(__dirname, "src");
var outDir = path.join(__dirname, "game", "script");

var config = {
  entry: path.join(srcDir, "main.ts"),
  output : {
    path: outDir,
    filename: "[name].js",
    library: "main",
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
