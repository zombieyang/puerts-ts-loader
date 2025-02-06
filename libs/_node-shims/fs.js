let fdIndex = 0;
const openedFile = {};

async function waitNextTick() {
    await new Promise(resolve => setTimeout(resolve, 1));   //wait next tick
}

const fs = module.exports = {
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
        f.Write(buffer, position || f.Current || 0, buffer.Length);
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
    },
    
    async delete(path) {
        await waitNextTick();
        this.deleteSync(path);
    },
    deleteSync(path) {
        if (CS.System.IO.File.Exists(path)) {
            CS.System.IO.File.Delete(path);
        }
        else if (CS.System.IO.Directory.Exists(path)) {
            CS.System.IO.Directory.Delete(path, true);
        }
    },
    readdirSync(dirPath) {
        let results = [];
        if (CS.System.IO.Directory.Exists(dirPath)) {
            this._currentDirectory = dirPath;
            let dir = new CS.System.IO.DirectoryInfo(dirPath),
                dirInfos = dir.GetDirectories(),
                fileInfos = dir.GetFiles();
            for (let i = 0; i < dirInfos.Length; i++) {
                // results.push({
                //     name: dirInfos.get_Item(i).Name,
                //     isFile: false,
                //     isDirectory: true,
                //     isSymlink: false
                // });
                results.push(dirInfos.get_Item(i).Name)
            }
            for (let i = 0; i < fileInfos.Length; i++) {
                // results.push({
                //     name: fileInfos.get_Item(i).Name,
                //     isFile: true,
                //     isDirectory: false,
                //     isSymlink: false
                // });
                results.push(fileInfos.get_Item(i).Name)
            }
        }
        return results;
    },
    async readFile(filePath, encoding) {
        await waitNextTick();
        return this.readFileSync(filePath, encoding);
    },
    async writeFile(filePath, fileText) {
        await waitNextTick();
        this.writeFileSync(filePath, fileText);
    },
    writeFileSync(filePath, fileText) {
        CS.System.IO.File.WriteAllText(filePath, fileText);
    },
    async mkdir(dirPath) {
        this.mkdirSync(dirPath);
    },
    mkdirSync(dirPath) {
        CS.System.IO.Directory.CreateDirectory(dirPath);
    },
    async move(srcPath, destPath) {
        await waitNextTick();
        this.moveSync(srcPath, destPath);
    },
    moveSync(srcPath, destPath) {
        if (CS.System.IO.File.Exists(srcPath)) {
            CS.System.IO.File.Move(srcPath, destPath);
        }
        else if (CS.System.IO.Directory.Exists(srcPath)) {
            CS.System.IO.Directory.Move(srcPath, destPath);
        }
    },
    async copy(srcPath, destPath) {
        await waitNextTick();
        this.copySync(srcPath, destPath);
    },
    copySync(srcPath, destPath) {
        if (CS.System.IO.File.Exists(srcPath)) {
            CS.System.IO.File.Copy(srcPath, destPath);
        }
        else if (CS.System.IO.Directory.Exists(srcPath)) {
            let dir = new CS.System.IO.DirectoryInfo(srcPath),
                dirInfos = dir.GetDirectories(),
                fileInfos = dir.GetFiles();
            for (let i = 0; i < fileInfos.Length; i++) {
                let name = fileInfos.get_Item(i).Name;
                this.copySync(CS.System.IO.Path.Combine(srcPath, name), CS.System.IO.Path.Combine(destPath, name));
            }
            for (let i = 0; i < dirInfos.Length; i++) {
                let name = dirInfos.get_Item(i).Name;
                this.copySync(CS.System.IO.Path.Combine(srcPath, name), CS.System.IO.Path.Combine(destPath, name));
            }
        }
    },
    async fileExists(filePath) {
        await waitNextTick();
        return this.fileExistsSync(filePath);
    },
    fileExistsSync(filePath) {
        return CS.System.IO.File.Exists(filePath);
    },
    async directoryExists(dirPath) {
        await waitNextTick();
        return this.directoryExistsSync(dirPath);
    },
    directoryExistsSync(dirPath) {
        return CS.System.IO.Directory.Exists(dirPath);
    },
    realpathSync(path) {
        return CS.System.IO.Path.GetFullPath(path);
    },
    getCurrentDirectory() {
        return '';
    },
    
}