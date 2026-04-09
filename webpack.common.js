const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  resolve: {
    extensions: [".ts", ".js"],

    alias: {
      "@rippledoc/expressions": path.resolve(
        __dirname,
        "./packages/expressions/src",
      ),
      "@rippledoc/sanitizer": path.resolve(
        __dirname,
        "./packages/sanitizer/src",
      ),
      "@rippledoc/markdown": path.resolve(__dirname, "./packages/markdown/src"),
      "@rippledoc/presentation2": path.resolve(
        __dirname,
        "./packages/presentation2/src",
      ),
    },
  },

  module: {
    rules: [
      {
        test: /\.ts$/,
        use: {
          loader: "ts-loader",
          options: {
            transpileOnly: true,
          },
        },
        exclude: /node_modules/,
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png|jpe?g|gif|svg|woff2?|ttf|eot)$/i,
        type: "asset/resource",
      },
    ],
  },

  plugins: [
    // We'll let per-app config pass template path
  ],
};
