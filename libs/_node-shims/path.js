const browserify = require('path-browserify')
module.exports = Object.assign({}, browserify, {
    join(...args) {
        const ret = CS.System.IO.Path.Combine(...args)
        return ret
    },
    resolve(...args) {
        const ret = CS.System.IO.Path.Combine(...args)
        return ret
    },
    // browserify cannot handle windows style correctly. Just tranlate it to posix style.
    // but side-effect is not tested yet.
    dirname(path, ...args) {
        path = path.replace(/\\/g, '/');
        return browserify.dirname(path, ...args);
    }
})