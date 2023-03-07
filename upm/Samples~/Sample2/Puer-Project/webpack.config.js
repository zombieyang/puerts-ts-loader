module.exports = {
    mode: 'production',

    entry: {
        index: './src/index.mjs'
    },
    output: {
        filename: 'runtime.gen.mjs',
        path: __dirname
    }
}