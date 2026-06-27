const path = require("path");
const common = require("../../webpack.common.js");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  ...common,

  target: "electron-renderer",
  mode: "development",
  devtool: "source-map",

  context: __dirname,
  entry: "./src/renderer/index.ts",

  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist/renderer"),
    clean: true,
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/renderer/index.html",
      filename: "index.html",
    }),
  ],
};
