const path = require("path");
const { merge } = require("webpack-merge");

const { CleanWebpackPlugin } = require("clean-webpack-plugin");

const { config, PATHS } = require("./webpack.config.cjs");

module.exports = merge(config, {
  devtool: "hidden-source-map",

  entry: {
    client: [path.join(PATHS.src, "index.js")],
  },

  plugins: [
    new CleanWebpackPlugin({ cleanOnceBeforeBuildPatterns: [PATHS.build] }),
  ],
});
