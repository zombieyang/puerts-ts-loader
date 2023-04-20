import { readFileSync } from "fs";
import { join } from "path";
import * as ts from "typescript";

function compile(saveTo: string, refs: string[], outputRelativePathCallback: (index: number) => string): boolean {
    let tsconfigIndex = 0;
    const builder = ts.createSolutionBuilder(
        ts.createSolutionBuilderHost(Object.assign({}, ts.sys, {
            readFile(path: string) {
                if (path == '/puer-mock/tsconfig.json') {
                    return JSON.stringify({ references: refs.map(item => ({ path: item })) })
                }
                return readFileSync(path, 'utf-8');
                // },
                // writeFile(...args: any[]) {
                //     if (!args[0].endsWith('tsconfig.tsbuildinfo')) {
                //         console.log(args[0])
                //         console.log(args)
                //     }
                //     return (ts.sys.writeFile as any).apply(ts.sys, args);
            }
        }), function (...args) {
            const config = args[1];
            if (config) {
                config.outDir = join(saveTo, outputRelativePathCallback(tsconfigIndex));
                config.module = ts.ModuleKind.ES2015
            }
            return ts.createEmitAndSemanticDiagnosticsBuilderProgram.apply(ts, args);
        }, function (err) { console.warn(JSON.stringify(err.messageText)) }),
        ["/puer-mock/tsconfig.json"], {}
    );
    return builder.build() == 0;
}


export default function ReleaseTS(saveTo: string, tsConfigBasePaths: string[], outputRelativePathCallback: (index: number) => string = ((index) => index.toString())): boolean {
    return compile(saveTo, tsConfigBasePaths, outputRelativePathCallback);
}