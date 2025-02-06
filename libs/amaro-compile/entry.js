import { transformSync } from "amaro";
import { resolve, join, extname, relative, dirname } from "path";
import * as fs from "fs";
import * as ts from "typescript";
const readFileSync = fs.readFileSync
 

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

export function runReleaseTS(saveTo, tsConfigPathCSArr, relativePathCallback) {
    const tsConfigBasePaths = [];
    for (let i = 0; i < tsConfigPathCSArr.Length; i++) {
        tsConfigBasePaths.push(tsConfigPathCSArr.get_Item(i));
    }
    const outputRelativePathCallback = relativePathCallback ? (index) => relativePathCallback.Invoke(index) : void 0

    tsConfigBasePaths.forEach((tsconfigDirPath, tsconfigIndex) => {
        const outDir = join(saveTo, outputRelativePathCallback(tsconfigIndex));
        const configFile = ts.readConfigFile(tsconfigDirPath + "/tsconfig.json", fs.readFileSync);
        if (configFile.error) {
            console.error(`Failed to read tsconfig.json: ${configFile.error}`);
            return false;
        }

        // Parse the config content to get source files
        const parsedConfig = ts.parseJsonConfigFileContent(
            configFile.config,
            {
                ...fs,
                readDirectory
            },
            tsconfigDirPath
        );

        if (parsedConfig.errors.length) {
            console.error(`Failed to parse tsconfig.json: ${parsedConfig.errors[0].messageText}`);
            return false;
        }

        const sourceFiles = parsedConfig.fileNames;

        sourceFiles.forEach(item => {
            const filePath = resolve(item);
            const content = readFileSync(filePath, 'utf-8');
            transformSync(content, {
                mode: "transform"
            }).code;

            const relativePath = relative(tsconfigDirPath.replace(/\\/g, '/'), item.replace(/\\/g, '/'))
                .replace(/.ts$/, '.js');
            fs.mkdirSync(dirname(join(outDir, relativePath)), { recursive: true });
            fs.writeFileSync(join(outDir, relativePath), content);
        })
    })
    return true;
}


function readDirectory(dir, extensions, excludes, includes, depth) {
    let results = [];

    if (depth < 0) return results;

    const list = fs.readdirSync(dir);

    for (const file of list) {
        const filePath = join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            results = results.concat(readDirectory(filePath, extensions, excludes, includes, depth - 1));
        } else {
            const ext = extname(file);
            if (extensions && extensions.includes(ext)) {
                // Check includes
                if (includes && includes.length > 0) {
                    const matchInclude = includes.some(pattern =>
                        new RegExp(pattern.replace(/\*/g, '.*')).test(filePath)
                    );
                    if (!matchInclude) continue;
                }

                // Check excludes
                if (excludes && excludes.length > 0) {
                    const matchExclude = excludes.some(pattern =>
                        new RegExp(pattern.replace(/\*/g, '.*')).test(filePath)
                    );
                    if (matchExclude) continue;
                }

                results.push(filePath);
            }
        }
    }

    return results;
}