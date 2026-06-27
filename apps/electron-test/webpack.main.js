const path = require("path");

module.exports = {
  target: "electron-main",
  mode: "development",
  devtool: "source-map",

  context: __dirname,
  entry: {
    main: "./src/main/main.ts",
    preload: "./src/main/preload.ts",
  },

  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist/main"),
  },

  resolve: {
    extensions: [".ts", ".js"],
  },

  module: {
    rules: [
      {
        test: /\.ts$/,
        use: {
          loader: "ts-loader",
          options: { transpileOnly: true },
        },
        exclude: /node_modules/,
      },
    ],
  },
};
