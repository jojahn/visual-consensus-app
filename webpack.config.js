module.exports = {
    entry: {
        index: './index.mjs',
        paxosWorker: {
            filename: "simulation/_paxosWorker_deprecated.js",
            import: './simulation/_paxosWorker_deprecated.js',
            publicPath: "/simulation/"
        },
    },
    output: {
        path: __dirname + '/dist',
        filename: "[name].js"
    },
    devServer: {
        port: 8080,
        static: "."
    },
};