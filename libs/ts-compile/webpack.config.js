const webpack = require('webpack')

module.exports = {
  mode: 'production',

  target: 'es2022',
  entry: {
    'main': './entry.ts'
  },
  output: {
    filename: '[name].gen.mjs',
    path: __dirname + '/../../upm/Editor/Resources/puerts/ts-loader/',
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
        resource.request = __dirname + '/../_node-shims/path.js'
      }
    ),
    new webpack.NormalModuleReplacementPlugin(
      /^fs$/,
      function (resource) {
        resource.request = __dirname + '/../_node-shims/fs.js'
      }
    ),
  ],
  resolve: {
    // Add `.ts` and `.tsx` as a resolvable extension.
    extensions: [".ts", ".tsx", ".js"],
    // Add support for TypeScripts fully qualified ESM imports.
    extensionAlias: {
      ".js": [".js", ".ts"],
      ".cjs": [".cjs", ".cts"],
      ".mjs": [".mjs", ".mts"]
    }
  },
  module: {
    rules: [
      // all files with a `.ts`, `.cts`, `.mts` or `.tsx` extension will be handled by `ts-loader`
      { test: /\.([cm]?ts)$/, loader: "ts-loader" }
    ]
  },
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
    'inspector',
    'perf_hooks',
    'tty'
  ].reduce((prev, v) => { prev[v] = 'commonjs ' + v; return prev }, {})
}