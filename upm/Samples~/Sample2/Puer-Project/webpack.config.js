module.exports = {
    mode: 'production',

    entry: {
        'runtime': './runtime/index.mjs',
        'editor': './editor/index.mjs',
        'axios': 'axios'
    },
    output: {
        filename: '[name].gen.mjs',
        path: __dirname + '/external'
    }
}