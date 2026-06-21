const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  resolve: {
    extensions: [".ts", ".js"],

    alias: {
      "@rippledoc/sanitizer": path.resolve(
        __dirname,
        "./packages/sanitizer/src",
      ),
      "@rippledoc/markdown": path.resolve(__dirname, "./packages/markdown/src"),
      "@rippledoc/presentation4": path.resolve(
        __dirname,
        "./packages/presentation4/src",
      ),
      "@rippledoc/presentation4/viewAPI": path.resolve(
        __dirname,
        "./packages/presentation4/src/viewAPI",
      ),
      "@rippledoc/view-editor": path.resolve(
        __dirname,
        "./packages/view-editor/src",
      ),
      "@rippledoc/editor-component": path.resolve(
        __dirname,
        "./packages/editor-component/src",
      ),
      "@rippledoc/dialogs": path.resolve(__dirname, "./packages/dialogs/src"),
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
