const path = require("path");
const common = require("../../webpack.common");

module.exports = {
  ...common,

  mode: "development",

  context: __dirname,

  entry: "./src/main.ts",

  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist")
  }
};
