const webpack = require('webpack')

module.exports = {
    mode: 'production',

    target: 'es2022',
    entry: {
        'source-map-support': './source-map-support-entry.js'
    },
    output: {
        filename: '[name].gen.mjs',
        path: __dirname + '/../../upm/Editor/ConsoleRedirect/Typescripts',
        library: {
            type: 'module'
        }
    },
    experiments: { outputModule: true },
    optimization: { minimize: false },
    plugins: [
        new webpack.NormalModuleReplacementPlugin(
          /^path$/,
          function (resource) {
            console.log(resource.request)
            resource.request = __dirname + '/path.js'
          }
        ),
        new webpack.NormalModuleReplacementPlugin(
          /^fs$/,
          function (resource) {
            console.log(resource.request)
            resource.request = __dirname + '/fs.js'
          }
        ),
    ],
    externals: [
        // 'fs',
        // 'path',
        'crypto',
        'dns',
        'http',
        'http2',
        'https',
        'net',
        'os',
        'querystring',
        'stream',
        'repl',
        'readline',
        'tls',
        'dgram',
        'url',
        'v8',
        'vm',
        'zlib',
        'util',
        'assert',
        'events',
        'tty'
    ].reduce((prev, v) => { prev[v] = 'commonjs ' + v; return prev }, {})
}