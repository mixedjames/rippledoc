const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  resolve: {
    extensions: [".ts", ".js"],

    alias: {
      "@core": path.resolve(__dirname, "./packages/core/src"),
      "@expressions": path.resolve(__dirname, "./packages/expressions/src"),
      "@presentation": path.resolve(__dirname, "./packages/presentation/src"),
      "@htmlPresentationView": path.resolve(__dirname, "./packages/htmlPresentationView/src"),
    }
  },

  module: {
    rules: [
      {
        test: /\.ts$/,
        use: {
          loader: "ts-loader",
          options: {
            transpileOnly: true
          }
        },
        exclude: /node_modules/
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"]
      },
      {
        test: /\.(png|jpe?g|gif|svg|woff2?|ttf|eot)$/i,
        type: "asset/resource"
      }
    ]
  },

  plugins: [
    // We'll let per-app config pass template path
  ]
};
