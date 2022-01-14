module.exports = {
    configureWebpack:{
        module:{
            rules:[
                {
                    test: /\.worker\.js$/,
                    use: { loader: "worker-loader" },
                }
            ]
        }
    },
    devServer: {
        proxy: {
            '/api': {
                target: 'http://127.0.0.1:3000',
                changeOrigin: true
            }
        }
    }
}