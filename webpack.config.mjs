import path from "path";
import {fileURLToPath} from "url";

import {execSync} from "child_process";
import {glob} from "glob";

import webpack from "webpack";
import HtmlWebpackPlugin from "html-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import WorkboxPlugin from "workbox-webpack-plugin";
import AppManifestPlugin from "webpack-web-app-manifest-plugin";

// config

// the short title of the app
const TITLE = "Ture";

// the longer title with tagline
const LONG_TITLE = "Ture - Turing machine interpreter";

// end config

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// detect if server is running or this is a build
const is_server = process.env.WEBPACK_SERVE === "true";
const css_strategy = !is_server ? MiniCssExtractPlugin.loader : "style-loader";

console.log("css_strategy:", css_strategy);
const get_commit_details = () => {
    try {
        // get hash, name, and date
        return execSync(`git log -1 --pretty=format:"%h: %s (%ad)" --date=short`, {encoding: "utf8"})
    } catch (error) {
        console.error("Error getting commit details:", error);
        return "";
    }
}

export default (env, argv) => {
    // note: service worker generation not enabled if hmr enabled
    // unregister the sw and restart the server if changing this setting
    // with hmr off, unregister the sw and reload when you make a change
    const USE_HMR = argv.hot || argv.mode === "development";
    const using_hmr = is_server && USE_HMR;

    console.log("hot module replacement enabled:", USE_HMR);

    return {
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
                },
                {
                    test: [/\.png$/, /\.jpg$/, /\.jpeg$/, /\.gif$/, /\.svg$/],
                    type: "asset/resource",
                    generator: {
                        filename: "manifest/[name]-[contenthash:8][ext][query]",
                    },
                }
            ],
        },
        resolve: {
            extensions: [".tsx", ".ts", ".js"],
        },
        output: {
            filename: "[name].[contenthash].bundle.js",
            path: path.resolve(__dirname, "dist"),
            publicPath: "/",
        },
        devServer: {
            hot: USE_HMR,
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
                __USE_SW__: !using_hmr,
            }),

            new HtmlWebpackPlugin({
                title: LONG_TITLE,
                template: "./src/index.html",
                inject: false,
                templateParameters: {
                    commit_details: get_commit_details(),
                },
            }),

            new MiniCssExtractPlugin({
                filename: "[name].[contenthash].css",
            }),

            new AppManifestPlugin({
                content: {
                    name: TITLE,
                    short_name: TITLE,
                    background_color: "#111",
                    start_url: "/",
                    display: "standalone",
                },
                destination: "/manifest",
                useDigest: false
            }),

            // disable service worker if hmr is enabled
            ...(!using_hmr ? [
                new WorkboxPlugin.GenerateSW({
                    clientsClaim: true,
                    skipWaiting: false,

                    // navigation fallback: it is effectively a SPA but we use search params for different scripts
                    // therefore just force the index page to be served for all navigation requests
                    navigateFallback: "/index.html",

                    // forcibly cache the public/precache directory
                    additionalManifestEntries: [
                        ...glob.sync("public/precache/**/*", {cwd: __dirname, nodir: true}).map(file => ({
                            url: `/${file}`,
                            revision: null,
                        })),
                    ],
                })
            ] : []),
        ]
    };
}
