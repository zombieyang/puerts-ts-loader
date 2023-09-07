module.exports = {
    dirname(path) {
        return CS.System.IO.Path.GetDirectoryName(path);
    },
    resolve(dir, url) {
        url = url.replace(/\\/g, "/");
        while (url.startsWith("../")) {
            dir = CS.System.IO.Path.GetDirectoryName(dir);
            url = url.substr(3);
        }
        return CS.System.IO.Path.Combine(dir, url);
    },
};