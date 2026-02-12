const path = require("path");
const common = require("../../webpack.common.js");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

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
    // Inject HTML template for index.html
    new HtmlWebpackPlugin({
      template: "./src/index.html",
      filename: "index.html",
    }),

    // Copy static resources (currently only images) to the output directory
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "src/img"),
          to: "img",
        },
      ],
    }),
  ],
  // End of plugins
};
