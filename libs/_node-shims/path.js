module.exports = Object.assign({}, require('path-browserify'), {
    join(...args) {
        const ret = CS.System.IO.Path.Combine(...args)
        return ret
    },
    resolve(...args) {
        const ret = CS.System.IO.Path.Combine(...args)
        return ret
    }
})