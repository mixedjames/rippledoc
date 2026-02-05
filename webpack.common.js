const path = require("path");

module.exports = {
  resolve: {
    extensions: [".ts", ".js"],

    alias: {
      "@core": path.resolve(__dirname, "./packages/core/src"),
      "@ui": path.resolve(__dirname, "./packages/ui/src")
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
      }
    ]
  }
};
