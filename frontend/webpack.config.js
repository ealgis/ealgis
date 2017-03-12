var webpack = require('webpack');
var LiveReloadPlugin = require('webpack-livereload-plugin');
var fs = require("fs");

module.exports = {
    entry: "./src/index.tsx",
    entry: {
        app: "./src/index.tsx",
        vendor: ["react",  "redux", "react-redux", "react-dom", "react-router", "react-router-redux", "redux-thunk", "material-ui", "openlayers", "redux-form", "redux-form-material-ui", "react-color", "react-cookie"],
    },
    plugins: [
        new LiveReloadPlugin({'appendScriptTag': false, 'cert': fs.readFileSync('/nginx/foobar.crt'), 'key': fs.readFileSync('/nginx/foobar.key')}),
        new webpack.DefinePlugin({
            DEVELOPMENT: JSON.stringify(true),
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: "vendor",
            filename: "vendor.bundle.js",
            // (with more entries, this ensures that no other module
            //  goes into the vendor chunk)
            minChunks: Infinity,
        })
    ],
    output: {
        filename: "bundle.js",
        path: __dirname + "/dist"
    },

    // Enable sourcemaps for debugging webpack's output.
    devtool: "source-map",

    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: [".webpack.js", ".web.js", ".ts", ".tsx", ".js"]
    },

    module: {
        rules: [
            // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
            { test: /\.tsx?$/, loader: "awesome-typescript-loader" },
            { test: /\.css$/, loader: 'style-loader!css-loader' },
            { test: /\.js$/, loader: "source-map-loader", enforce: "pre" }
        ],
    },
};
