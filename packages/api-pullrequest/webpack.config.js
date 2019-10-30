const webpack = require("webpack");
const path = require("path");
const slsw = require("serverless-webpack");

module.exports = {
  mode: "development",
  entry: slsw.lib.entries,
  target: "node",
  output: {
    libraryTarget: "commonjs2",
    library: "index",
    path: path.resolve(__dirname, ".webpack"),
    filename: "[name].js"
  },
  plugins: [
    new webpack.DefinePlugin({
      "typeof navigator": JSON.stringify("object"),
      "navigator.product": JSON.stringify("NativeScript"),
      "navigator.userAgent": JSON.stringify("NativeScript"),
    })
  ],
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: "babel-loader",
        options: {
          presets: [
            [
              "@babel/preset-env",
              {
                targets: {
                  node: true,
                },
              },
            ],
            "@babel/typescript",
          ],
        },
        include: [__dirname],
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  output: {
    libraryTarget: "commonjs2",
    path: path.join(__dirname, ".webpack"),
    filename: "[name].js",
  },
};
