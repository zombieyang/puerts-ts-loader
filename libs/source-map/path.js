module.exports = {
    existsSync(path) {
        return CS.System.IO.File.Exists(path);
    },
    readFileSync(path) {
        return CS.System.IO.File.ReadAllText(path);
    },
}