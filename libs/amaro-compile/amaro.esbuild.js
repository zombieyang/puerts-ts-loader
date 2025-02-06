const esbuild = require('esbuild')
const path = require('path')

const build = async () => {
  await esbuild.build({
    entryPoints: [path.resolve(__dirname, './entry.js')],
    bundle: true,
    outfile: path.resolve(__dirname, '../../upm/Editor/Resources/puerts/ts-loader/amaro.gen.mjs'),
    // outfile: path.resolve(__dirname, './dist/amaro.gen.mjs'),
    format: 'esm',
    platform: 'browser',
    target: ['es2020'],
    define: {
      'process.env.NODE_ENV': '"production"'
    },
    alias: {
      'node:buffer': require.resolve('buffer/'),
      'util': path.resolve(__dirname, '../_node-shims/util.js'),
      'path': path.resolve(__dirname, '../_node-shims/path.js'),
      'fs': path.resolve(__dirname, '../_node-shims/fs.js')
    },
  })
}

build().catch((err) => {
  console.error(err)
  process.exit(1)
})
