const { join } = require("path");

module.exports = {
    mode: 'production',

    target: 'web',
    entry: './resolve.js',
    output: {
        filename: 'resolve.mjs',
        path: join(__dirname, '../upm/Samples~/Sample4/Assets/Typescripts/nodemodule-loader/'),
        library: {
            type: 'module'
        }
    },
    experiments: { outputModule: true },
    optimization: { minimize: false }
}