import path from "path";
import {fileURLToPath} from "url";

import {execSync} from "child_process";

import webpack from "webpack";
import HtmlWebpackPlugin from "html-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// detect if server is running or this is a build
const is_server = process.env.WEBPACK_SERVE === "true";
const css_strategy = !is_server ? MiniCssExtractPlugin.loader : "style-loader";

console.log("css_strategy:", css_strategy);

const get_commit_details = () => {
    try {
        // get hash, name, and date
        return execSync(`git log -1 --pretty=format:"%h: %s (%ad)" --date=short`, {encoding: 'utf8'})
    } catch (error) {
        console.error("Error getting commit details:", error);
        return "";
    }
}

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
            directory: path.join(__dirname, "public"),
            publicPath: "/public",
        },
    },
    plugins: [
        // note: doesnt update on watch mode but doesnt matter
        new webpack.DefinePlugin({
            __COMMIT_DETAILS__: JSON.stringify(get_commit_details()),
        }),

        new HtmlWebpackPlugin({
            template: "./src/index.html",
            //inject: false
        }),

        new MiniCssExtractPlugin({
            filename: "[name].[contenthash].css",
        }),
    ]
}