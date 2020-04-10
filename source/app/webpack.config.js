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

const folders = {
    project,
    source: path.resolve(project, "source"),
    output: path.resolve(project, "bin"),
    modules: path.resolve(project, "node_modules"),
    libs: path.resolve(project, "libs"),
};

const files = [
    //{ source: path.resolve(folders.modules, "@ionic/core/css/global.bundle.css"), target: path.resolve(folders.output, "css/global.bundle.css") },
    //{ source: path.resolve(folders.modules, "@ionic/core/css/ionic.bundle.css"), target: path.resolve(folders.output, "css/ionic.bundle.css") },
    // { source: path.resolve(folders.modules, "@ionic/core/dist/ionic/ionic.esm.js"), target: path.resolve(folders.output, "js/ionic.esm.js") },
    // { source: path.resolve(folders.modules, "@ionic/core/dist/ionic/ionic.js"), target: path.resolve(folders.output, "js/ionic.js") },
];

let projectVersion = "vXXX";
try {
    console.log("trying to retrieve latest git tag...");
    projectVersion = childProcess.execSync("git describe --tags").toString().trim();
}
catch {
}

const components = {
    "default": {
        name: "app",
        title: "App",
        version: projectVersion,
        entryPoint: "app/index.ts",
        template: "index.hbs",
        element: "ff-application"
    }
};

////////////////////////////////////////////////////////////////////////////////

module.exports = function(env, argv)
{
    const environment = {
        isDevMode: argv.mode !== undefined ? argv.mode !== "production" : process.env["NODE_ENV"] !== "production",
    };

    console.log(`
WEBPACK - PROJECT BUILD CONFIGURATION
      build mode: ${environment.isDevMode ? "development" : "production"}
   source folder: ${folders.source}
   output folder: ${folders.output}
  modules folder: ${folders.modules}
  library folder: ${folders.libs}
    `);

    // copy files
    files.forEach(file => {
        fs.copySync(file.source, file.target, { overwrite: true });
    });

    const componentKey = argv.component !== undefined ? argv.component : "default";

    if (componentKey === "all") {
        return Object.keys(components).map(key => createBuildConfiguration(components[key]));
    }

    return createBuildConfiguration(environment, folders, components[componentKey]);
};

////////////////////////////////////////////////////////////////////////////////

function createBuildConfiguration(environment, folders, component)
{
    const isDevMode = environment.isDevMode;
    const devMode = isDevMode ? "development" : "production";
    const devTool = isDevMode ? "source-map" : undefined;
    const displayTitle = `${component.title} ${component.version} ${isDevMode ? "DEV" : "PROD"}`;
    const jsOutputFileName = isDevMode ? "js/[name].dev.js" : "js/[name].min.js";
    const cssOutputFileName = isDevMode ? "css/[name].dev.css" : "css/[name].min.css";
    const htmlOutputFileName = "index.html"; // isDevMode ? `${component.name}-dev.html` : `${component.name}.html`;

    console.log(`
WEBPACK - COMPONENT BUILD CONFIGURATION
  component: ${component.name}
    version: ${component.version}
      title: ${displayTitle}
    `);

    return {
        mode: devMode,
        devtool: devTool,

        entry: {
            [component.name]: path.resolve(folders.source, component.entryPoint),
        },

        output: {
            path: folders.output,
            filename: jsOutputFileName,
        },

        resolve: {
            modules: [
                folders.libs,
                folders.modules,
            ],
            // library aliases
            alias: {
                "app": path.resolve(folders.source, "app"),
                "@ff/core": "ff-core/source",
                "@ff/browser": "ff-browser/source",
                "@ff/ui": "ff-ui/source",
            },
            // Resolvable extensions
            extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
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
                ENV_VERSION: JSON.stringify(component.version),
            }),
            new MiniCssExtractPlugin({
                filename: cssOutputFileName,
                allChunks: true,
            }),
            new HTMLWebpackPlugin({
                filename: htmlOutputFileName,
                template: component.template,
                title: displayTitle,
                version: component.version,
                isDevelopment: isDevMode,
                element: `<${component.element}></${component.element}>`,
                chunks: [ component.name ],
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
                    // SCSS
                    test: /\.s[ac]ss$/i,
                    use: [
                        MiniCssExtractPlugin.loader,
                        'css-loader',
                        'sass-loader',
                    ],
                },
                {
                    // CSS
                    test: /\.css$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        "css-loader"
                    ]
                },
                {
                    // Handlebars templates
                    test: /\.hbs$/,
                    loader: "handlebars-loader"
                },
            ],
        },
    };
}

