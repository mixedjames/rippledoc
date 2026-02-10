const path = require("path");
const common = require("../../webpack.common.js");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  ...common,

  mode: "development",
  devtool: "source-map",

  context: __dirname,
  entry: "./src/ts/main.ts",

  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
  },

  plugins: [
    // Inject HTML template
    new HtmlWebpackPlugin({
      template: "./src/index.html",
      filename: "index.html"
    })
  ]
};
