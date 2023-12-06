const path = require("path");
const fg = require("fast-glob");
const webpack = require("webpack");

module.exports = (env, argv) => {
  const entries = {};
  for (let file of fg.sync(["./benchmark/controller.ts", "./benchmark/corporation.ts"])) {
    const fullPath = path.resolve(__dirname, file);
    const name = path.relative("./", file).replace(path.extname(file), "");
    entries[name] = fullPath;
  }
  const runtime = "node";
  const scriptExtension = "cjs";
  return {
    entry: entries,
    plugins: [
      new webpack.DefinePlugin({
        "process.env.NODE_ENV": `"development"`,
        "process.env.HEADLESS_MODE": "true",
        "process.env.RUNTIME_NODE": `${runtime === "node"}`,
        "process.env.RUNTIME_DENO": `${runtime === "deno"}`,
        "process.env.SCRIPT_EXTENSION": `"${scriptExtension}"`,
      }),
    ],
    externals: {
      bufferutil: "bufferutil",
      "utf-8-validate": "utf-8-validate",
    },
    devtool: "inline-source-map",
    mode: "development",
    target: "node",
    stats: {
      errorDetails: true,
    },
    module: {
      rules: [
        {
          test: /\.(js$|jsx|ts|tsx)$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
            options: {
              presets: [["@babel/preset-typescript"], ["@babel/preset-react"]],
              cacheDirectory: true,
            },
          },
        },
        {
          test: /\.(ttf|png|jpe?g|gif|jp2|webp)$/,
          type: "asset/resource",
        },
        {
          test: /\.s?css$/,
          use: ["style-loader", "css-loader"],
        },
      ],
    },
    resolve: {
      extensions: [".tsx", ".ts", ".js"],
      alias: {
        "@player": path.resolve(__dirname, "../src/Player"),
        "@enums": path.resolve(__dirname, "../src/Enums"),
        "@nsdefs": path.resolve(__dirname, "../src/ScriptEditor/NetscriptDefinitions.d.ts"),
      },
      fallback: { crypto: false },
    },
    output: {
      filename: "[name].cjs",
      path: path.resolve(__dirname, "dist-webpack"),
      clean: true,
    },
  };
};
