module.exports = {
    mode: 'production',

    target: 'web',
    entry: './resolve.js',
    output: {
        filename: 'resolve.gen.mjs',
        path: __dirname,
        library: {
            type: 'module'
        }
    },
    experiments: { outputModule: true },
    optimization: { minimize: false }
}