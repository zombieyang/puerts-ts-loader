const { join } = require("path");

module.exports = {
    mode: 'production',

    target: 'web',
    entry: './resolve.js',
    output: {
        filename: 'node-resolve.mjs',
        path: join(__dirname, '../../upm/Editor/Resources/puerts/ts-loader/'),
        library: {
            type: 'module'
        }
    },
    experiments: { outputModule: true },
    optimization: { minimize: false }
}