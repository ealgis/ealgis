var webpack = require("webpack")
var LiveReloadPlugin = require("webpack-livereload-plugin")
var CopyWebpackPlugin = require("copy-webpack-plugin")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const CleanWebpackPlugin = require("clean-webpack-plugin")
var fs = require("fs")

module.exports = {
    entry: "./src/index.tsx",
    entry: {
        app: "./src/index.tsx",
        vendor: [
            "dot-prop-immutable",
            "es6-promise",
            "js-cookie",
            "lodash-es",
            "material-ui",
            "material-ui-chip-input",
            "ol",
            "qs",
            "raven-for-redux",
            "raven-js",
            "react",
            "react-color",
            "react-copy-to-clipboard",
            "react-dom",
            "react-ga",
            "react-google-maps-loader",
            "react-list",
            "react-openlayers",
            "react-redux",
            "react-router",
            "react-router-redux",
            "redux",
            "redux-devtools-extension",
            "redux-form",
            "redux-form-material-ui",
            "redux-thunk",
            "styled-components",
            "whatwg-fetch",
            "core-js/fn/object/assign",
            "core-js/fn/object/values",
            "core-js/fn/object/entries",
            "core-js/fn/array/filter",
            "core-js/fn/array/includes",
            "core-js/fn/string/starts-with",
            "core-js/es7/map",
            "core-js/es7/set",
            "raf/polyfill",
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
            DEVELOPMENT: JSON.stringify(true),
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: "vendor",
            filename: "vendor.bundle.[hash].js",
            // (with more entries, this ensures that no other module
            //  goes into the vendor chunk)
            minChunks: Infinity,
        }),
        new CopyWebpackPlugin([
            { from: __dirname + "/src/assets/brand/ealgis_white_favicon.png" },
            { from: __dirname + "/src/assets/brand/ealgis_white_logo_transparent_background.png" },
            { from: __dirname + "/src/assets/brand/ealgis_white_logo_only_transparent_background.png" },
        ]),
        new HtmlWebpackPlugin({
            template: "index.dev.html",
        }),
        new CleanWebpackPlugin(["dist"]),
    ],
    output: {
        filename: "bundle.[hash].js",
        path: __dirname + "/dist",
        publicPath: "/static-front/",
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
            { test: /\.tsx?$/, loader: "awesome-typescript-loader" },
            { test: /\.css$/, loader: "style-loader!css-loader" },
            { test: /\.js$/, loader: "source-map-loader", enforce: "pre" },
        ],
    },
}
