const fs = module.exports = {
    existsSync(path) {
        return CS.System.IO.File.Exists(path);
    },
    readFileSync(path) {
        return CS.System.IO.File.ReadAllText(path);
    },
    realpathSync(path) {
        return path
    },
    readdirSync(dir) {
        const ret = [];
        let dirs, files;
        try {
            dirs = CS.System.IO.Directory.GetDirectories(dir);
        } catch (e) {
            if (e.message.indexOf('Could not find a part of the path') != -1) {
                e.code = "ENOTDIR"
            }
            throw e;
        }
        files = CS.System.IO.Directory.GetFiles(dir);
        for (let i = 0; i < dirs.Length; i++) ret.push(dirs.get_Item(i))
        for (let i = 0; i < files.Length; i++) ret.push(files.get_Item(i))
        return ret.map(r => r.replace(/\\/g, '/').replace(dir + '/', ''));
    },
    lstatSync(p) {
        if (!fs.existsSync(p)) {
            const e = new Error('file not exists: ' + p);
            e.code = "ENOENT";
            throw e;
        }
        
        return {
            isDirectory() {
                return CS.System.IO.Directory.Exists(p)
            },
            isSymbolicLink() {
                const fileInfo = new CS.System.IO.FileInfo(p)
                return fileInfo.Attributes & CS.System.IO.FileAttributes.ReparsePoint;
            },
            mtimeMs: new CS.System.DateTimeOffset(CS.System.IO.File.GetLastWriteTime(p)).ToUnixTimeSeconds()
        }
    },
    statSync(p) {
        return fs.lstatSync(p);
    }
}