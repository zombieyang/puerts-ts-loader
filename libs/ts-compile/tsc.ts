import { existsSync, readFileSync, statSync } from "fs";
import { glob } from "glob";
import { join, normalize } from "path";
import ts, { ModuleKind } from "typescript";
import PuerBuiltinTranspiler from "./base";

const DEFAULT_TS_CONFIG = {
    "target": ts.ScriptTarget.ESNext,
    "module": ts.ModuleKind.ES2015,
    "sourceMap": true,
    "inlineSourceMap": true,
    "noImplicitAny": true
}

class PuerTSCTranspiler extends PuerBuiltinTranspiler {
    protected services: ts.LanguageService;

    constructor(tsRootPath: string) {
        super();
        let compilerOptions: ts.CompilerOptions;
        const maybeTSConfigPath = join(tsRootPath, 'tsconfig.json');
        if (!existsSync(maybeTSConfigPath)) {
            compilerOptions = DEFAULT_TS_CONFIG;

        } else {
            const cl: ts.ParsedCommandLine | undefined = ts.getParsedCommandLineOfConfigFile(
                maybeTSConfigPath,
                {},
                Object.assign({ onUnRecoverableConfigFileDiagnostic: (d: any) => d }, ts.sys)
            );
            if (cl?.options) {
                compilerOptions = cl.options;

            } else {
                compilerOptions = DEFAULT_TS_CONFIG
            }
        }

        compilerOptions.module = ModuleKind.ES2015;

        this.services = ts.createLanguageService({
            getScriptFileNames: () => []
                .concat(glob.sync(normalize(tsRootPath + "/**/*.ts").replace(/\\/g, '/')) as any)
                .concat(glob.sync(normalize(tsRootPath + "/**/*.mts").replace(/\\/g, '/')) as any),
            getCompilationSettings: () => compilerOptions,
            getScriptVersion: (path) => statSync(path).mtimeMs.toString(),
            getScriptSnapshot: fileName => {
                if (!existsSync(fileName)) {
                    return undefined;
                }
                return ts.ScriptSnapshot.fromString(readFileSync(fileName).toString());
            },
            getCurrentDirectory: () => process.cwd(),
            getDefaultLibFileName: options => ts.getDefaultLibFilePath(options),
            fileExists: ts.sys.fileExists,
            readFile: ts.sys.readFile,
            // getCustomTransformers: () => {
            //     return {
            //         before: [transformer]
            //     }
            // }
        }, ts.createDocumentRegistry());
    }

    transpile(filepath: string): { content: string, sourceMap: string } {
        filepath = process.platform == 'win32' ? normalize(filepath) : normalize(filepath)
        const emitOutput = this.services.getEmitOutput(filepath);
        const content = emitOutput.outputFiles.filter(file => file.name.endsWith('js'))[0];
        const sourceMap = emitOutput.outputFiles.filter(file => file.name.endsWith('map'))[0];
        return {
            content: content?.text,
            sourceMap: sourceMap?.text
        };
    }
}

export default PuerTSCTranspiler