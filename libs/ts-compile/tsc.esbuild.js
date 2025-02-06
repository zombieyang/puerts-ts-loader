const esbuild = require('esbuild')
const path = require('path')

const build = async () => {
  await esbuild.build({
    entryPoints: [path.resolve(__dirname, './entry.ts')],
    bundle: true,
    outfile: path.resolve(__dirname, '../../upm/Editor/Resources/puerts/ts-loader/main.gen.mjs'),
    format: 'esm',
    platform: 'browser',
    target: ['es2022'],
    minify: false,
    define: { 
      'process.env.NODE_ENV': '"production"'
    },
    alias: {
      'path': path.resolve(__dirname, '../_node-shims/path.js'),
      'fs': path.resolve(__dirname, '../_node-shims/fs.js')
    },
    external: [
      'crypto', 'dns', 'http', 'http2', 'https', 'net', 'os',
      'querystring', 'stream', 'repl', 'readline', 'tls',
      'dgram', 'url', 'v8', 'vm', 'zlib', 'util', 'assert',
      'events', 'inspector', 'perf_hooks', 'tty'
    ]
  })
}

build().catch((err) => {
  console.error(err)
  process.exit(1)
})
