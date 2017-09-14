var webpack = require("webpack");
var path = require("path");

var srcDir = path.join(__dirname, "src");
var outDir = path.join(__dirname, "lib");
var isProd = process.env.NODE_ENV === 'production';

var config = {
  entry: path.join(srcDir, "index.ts"),
  output : {
    path: outDir,
    filename: "index.js",
    library: "cowlick",
    libraryTarget: "commonjs2"
  },
  module : {
    rules: [
      {
        test: /\.ts$/,
        loader: "awesome-typescript-loader",
        include: srcDir,
        exclude: /node_modules/
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

if (isProd) {
  config.plugins = [
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify("production")
    })
  ]
    .concat(config.plugins)
    .concat([
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false
        },
        output  : {
          comments: require("uglify-save-license")
        }
      })
    ]);
}
module.exports = config;
