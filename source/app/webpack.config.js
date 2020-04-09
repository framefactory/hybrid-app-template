"use strict";

require("dotenv").config();

const fs = require("fs-extra");
const path = require("path");
const childProcess = require("child_process");
const webpack = require("webpack");

const TerserPlugin = require("terser-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const HTMLWebpackPlugin = require("html-webpack-plugin");

////////////////////////////////////////////////////////////////////////////////

const project = path.resolve(__dirname, "../..");

const dirs = {
    project,
    source: path.resolve(project, "source"),
    output: path.resolve(project, "bin"),
    modules: path.resolve(project, "node_modules"),
    libs: path.resolve(project, "libs"),
};

const app = {
    name: "app",
    title: "App",
    entryPoint: "app/index.ts",
    template: "index.hbs",
    element: "ff-application"
};

let version = "vXXX";
try {
    console.log("trying to retrieve latest git tag...");
    version = childProcess.execSync("git describe --tags").toString().trim();
}
catch {
}

////////////////////////////////////////////////////////////////////////////////

module.exports = function(env, argv)
{
    const isDevMode = argv.mode !== undefined ? argv.mode !== "production" : process.env["NODE_ENV"] !== "production";
    const devMode = isDevMode ? "development" : "production";
    const devTool = isDevMode ? "source-map" : undefined;
    const appTitle = `${app.title} ${version} ${isDevMode ? " DEV" : " PROD"}`;

    return {
        mode: devMode,
        devtool: devTool,

        entry: {
            [app.name]: path.resolve(dirs.source, app.entryPoint),
        },

        output: {
            path: dirs.output,
            filename: isDevMode ? "js/[name].dev.js" : "js/[name].min.js",
        },

        resolve: {
            // component aliases
            alias: {
                "@ff/core": path.resolve(dirs.libs, "ff-core/source"),
                "@ff/ui": path.resolve(dirs.libs, "ff-ui/source"),
            },
            // Resolvable extensions
            extensions: [".ts", ".tsx", ".js", ".json"],
        },


        optimization: {
            minimize: !isDevMode,

            minimizer: [
                new TerserPlugin({ parallel: true }),
                new OptimizeCSSAssetsPlugin({}),
            ]
        },

        plugins: [
            new webpack.DefinePlugin({
                ENV_PRODUCTION: JSON.stringify(!isDevMode),
                ENV_DEVELOPMENT: JSON.stringify(isDevMode),
            }),
            new MiniCssExtractPlugin({
                filename: isDevMode ? "css/[name].dev.css" : "css/[name].min.css",
                allChunks: true,
            }),
            new HTMLWebpackPlugin({
                filename: isDevMode ? `${app.name}-dev.html` : `${app.name}.html`,
                template: app.template,
                title: appTitle,
                version: version,
                isDevelopment: isDevMode,
                element: `<${app.element}></${app.element}>`,
                chunks: [ app.name ],
            })
        ],

        module: {
            rules: [
                {
                    // Typescript
                    test: /\.tsx?$/,
                    loader: "ts-loader",
                },
                {
                    // Enforce source maps for all javascript files
                    enforce: "pre",
                    test: /\.js$/,
                    loader: "source-map-loader"
                },
                {
                    test: /\.s[ac]ss$/i,
                    use: [
                        MiniCssExtractPlugin.loader,
                        // Translates CSS into CommonJS
                        'css-loader',
                        // Compiles Sass to CSS
                        'sass-loader',
                    ],
                },
                {
                    // Handlebars templates
                    test: /\.hbs$/,
                    loader: "handlebars-loader"
                },
            ],
        },
    };
};
