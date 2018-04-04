var webpack = require("webpack")
var LiveReloadPlugin = require("webpack-livereload-plugin")
var CopyWebpackPlugin = require("copy-webpack-plugin")
var fs = require("fs")

module.exports = {
    target: "web",
    entry: "./src/index.tsx",
    entry: {
        app: "./src/index.tsx",
        vendor: [
            "react",
            "redux",
            "react-redux",
            "react-dom",
            "react-router",
            "react-router-redux",
            "redux-thunk",
            "material-ui",
            "openlayers",
            "redux-form",
            "redux-form-material-ui",
            "react-color",
            "react-cookie",
            "dot-prop-immutable",
            "react-list",
            "react-copy-to-clipboard",
            "material-ui-chip-input",
            "lodash",
            "qs",
            "core-js/fn/object/assign",
            "core-js/fn/object/values",
            "core-js/fn/object/entries",
            "core-js/fn/array/filter",
            "core-js/fn/array/includes",
            "core-js/fn/string/starts-with",
            "core-js/es7/map",
        ],
    },
    externals: {
        Config: JSON.stringify(require("./config.dev.json")),
    },
    plugins: [
        new LiveReloadPlugin({
            appendScriptTag: false,
            cert: fs.readFileSync("/nginx/foobar.crt"),
            key: fs.readFileSync("/nginx/foobar.key"),
        }),
        new webpack.DefinePlugin({
            "process.env": { NODE_ENV: JSON.stringify(process.env.NODE_ENV || "development") },
        }),
        new CopyWebpackPlugin([
            { from: __dirname + "/src/assets/brand/ealgis_white_favicon.png" },
            { from: __dirname + "/src/assets/brand/ealgis_white_logo_transparent_background.png" },
            { from: __dirname + "/src/assets/brand/ealgis_white_logo_only_transparent_background.png" },
        ]),
    ],

    optimization: {
        // namedModules: true,
        splitChunks: {
            name: "vendor",
            chunks: "all",
        },
        // concatenateModules: true,
    },

    output: {
        filename: "[name].js",
        path: __dirname + "/dist",
    },

    // Enable sourcemaps for debugging webpack's output.
    devtool: "source-map",

    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: [".webpack.js", ".web.js", ".ts", ".tsx", ".js"],
    },

    module: {
        rules: [
            // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
            {
                test: /\.tsx?$/,
                use: [
                    {
                        loader: require.resolve("awesome-typescript-loader"),
                        options: {
                            // compile with TypeScript, then transpile with Babel
                            useBabel: true,
                        },
                    },
                ],
            },
            { test: /\.css$/, loader: "style-loader!css-loader" },
            { test: /\.js$/, loader: "source-map-loader", enforce: "pre" },
        ],
    },
}
