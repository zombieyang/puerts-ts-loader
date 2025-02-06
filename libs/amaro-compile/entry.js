const transformSync = require('amaro').transformSync
const { resolve } = require('path')
const { readFileSync } = require('fs')

export function makeCompiler(tsProjRoot) {

    return {
        emitTSFile(tsFilePath) {
            const content = readFileSync(tsFilePath, 'utf-8');
            return transformSync(content, {
                mode: "transform"
            }).code;
        },
        getSourceMap(tsFilePath) {
            const filePath = resolve(tsProjRoot, tsFilePath);
            const content = readFileSync(filePath, 'utf-8');
            return transformSync(content, {
                mode: "transform",
                sourceMap: true,
                filename: filePath,
            }).map;
        }
    }
}