module.exports = {
    entry: "./js/app.js",
    output: {
        path: __dirname,
        filename: "./dist/bundle.js"
    },
    module: {
        loaders: [{
            test: /\.jsx?$/, // A regexp to test the require path. accepts either js or jsx
            loader: 'babel' // The module to load. "babel" is short for "babel-loader"
        }]
    }
};
