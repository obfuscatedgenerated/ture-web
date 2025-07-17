import path from "path";
import { fileURLToPath } from "url";

import HtmlWebpackPlugin from "html-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// detect if server is running or this is a build
const is_server = process.env.WEBPACK_SERVE === "true";
const css_strategy = !is_server ? MiniCssExtractPlugin.loader : "style-loader";

console.log("css_strategy:", css_strategy);

export default {
    entry: "./src/index.ts",
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
            {
                test: /\.css$/i,
                use: [css_strategy, "css-loader"],
            },
            {
                test: /\.md$/,
                use: [
                    {
                        loader: "html-loader",
                    },
                    {
                        loader: "markdown-loader",
                    },
                ],
            }
        ],
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"],
    },
    output: {
        filename: "[name].[contenthash].bundle.js",
        path: path.resolve(__dirname, "dist"),

    },
    devServer: {
        port: 3000,
        static: {
            directory: path.join(__dirname, "dist"),
        },
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: "./src/index.html",
            //inject: false
        }),
        new MiniCssExtractPlugin({
            filename: "[name].[contenthash].css",
        }),
    ]
}