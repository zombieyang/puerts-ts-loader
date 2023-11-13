let fdIndex = 0;
const openedFile = {};

const fs = module.exports = {
    mkdirSync(p) {
        CS.System.IO.Directory.CreateDirectory(p)
    },
    openSync(p, mode) {
        if (mode != 'w') throw new Error(`filemode ${mode} is not implemented yet`);
        const fd = ++fdIndex;
        openedFile[fd] = CS.System.IO.File.Open(p, CS.System.IO.FileMode.OpenOrCreate);
        return fd;
    },
    writeSync(fd, str, position) {
        if (typeof str != 'string') throw new Error(`only write string is supported`)
        const f = openedFile[fd];
        const buffer = CS.Puerts.TSLoader.TSLoader.GetBytes(str);
        f.Write(buffer, position || f.Current, buffer.Length);
    },
    closeSync(fd) {
        openedFile[fd].Close();
        openedFile[fd].Dispose();
        delete openedFile[fd];
    },
    existsSync(p) {
        return CS.System.IO.File.Exists(p) || CS.System.IO.Directory.Exists(p);
    },
    readFileSync(p) {
        if (p.indexOf('puer://') == 0) {
            const filepath = 'puerts' + p.substring(7);
            if (puer.fileExists(filepath))
                return puer.loadFile(filepath).content;
            else
                throw new Error('file not found: ' + filepath);

        } else {
            return CS.System.IO.File.ReadAllText(p);
        }
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
            isFile() {
                return CS.System.IO.File.Exists(p)
            },
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