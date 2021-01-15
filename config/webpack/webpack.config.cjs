const path = require("path");
const webpack = require("webpack");

const HtmlWebpackPlugin = require("html-webpack-plugin");

const { NODE_ENV, npm_package_version: RELEASE_VERSION } = process.env;

console.group("Build info");
console.log(`Release version is ${RELEASE_VERSION}`);
console.log(`Webpack version is ${webpack.version}`);
console.log(`Webpack running in ${NODE_ENV} environment`);
console.groupEnd();

const PATHS = {
  src: path.resolve(__dirname, "../../src/"),
  public: path.resolve(__dirname, "../../"),
  build: path.resolve(__dirname, "../../build/"),
  node_modules: path.resolve(__dirname, "../../node_modules/"),
};

const config = {
  mode: NODE_ENV,

  output: {
    path: PATHS.build,
    publicPath: "/",
  },

  module: {
    rules: [
      {
        test: /\.js$/i,
        loader: "babel-loader",
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },

  plugins: [
    new HtmlWebpackPlugin({
      title: "RSS aggregator",
      template: path.join(PATHS.public, "index.html"),
      filename: path.join(PATHS.build, "index.html"),
    }),
  ],
};

module.exports = {
  NODE_ENV,
  PATHS,
  config,
};
