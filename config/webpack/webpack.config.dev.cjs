const path = require("path");
const { merge } = require("webpack-merge");

const { config, PATHS } = require("./webpack.config.cjs");

module.exports = merge(config, {
  devtool: "inline-source-map",
  entry: path.join(PATHS.src, "index.js"),

  optimization: { moduleIds: "named" },

  devServer: {
    historyApiFallback: true,
    disableHostCheck: true,
    stats: "minimal",
    host: "0.0.0.0",
    port: 8080,
    contentBase: PATHS.public,
  },
});
