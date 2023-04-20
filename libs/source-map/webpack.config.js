module.exports = {
    mode: 'production',

    target: 'node16',
    entry: {
        'source-map-support': './source-map-support-entry.js'
    },
    output: {
        filename: '[name].gen.mjs',
        path: __dirname + '../upm/Editor/ConsoleRedirect/Typescripts',
        library: {
            type: 'module'
        }
    },
    experiments: { outputModule: true },
    optimization: { minimize: false },
    externals: [
        'fs',
        'crypto',
        'dns',
        'http',
        'http2',
        'https',
        'net',
        'os',
        'path',
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