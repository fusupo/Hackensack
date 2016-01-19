module.exports = {
    entry: "./main.js",
    output: {
        path: __dirname+'/dist',
        filename: "bundle.js",
    },
    module: {
        loaders: [{
            test: /\.css$/,
            loader: "style!css"
        }, {
            test: /\.jsx?$/, // A regexp to test the require path. accepts either js or jsx
            loader: 'babel' // The module to load. "babel" is short for "babel-loader"
        }]
    }
};
