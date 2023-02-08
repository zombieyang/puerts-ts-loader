import { readFileSync } from "fs";
import * as ts from "typescript";

function compile(refs: string[]): boolean {
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
        }), function(...args) {
            const config = args[1];
            if (config) {
                config.outDir = `T:/_CODE_/puerts_FP_demo/Assets/Puer_Gen/TSOutput/${tsconfigIndex++}/Resources`;
            }
            return ts.createEmitAndSemanticDiagnosticsBuilderProgram.apply(ts, args);
        }, function(err) {console.warn(err.messageText)}),
        ["/puer-mock/tsconfig.json"], { outDir: 'T:\\_CODE_\\puerts_FP_demo\\Assets\\Puer_Gen\\Resources' }
    );
    return builder.build() == 0;
}


export default function ReleaseTS(tsConfigBasePaths: string[]): boolean {
    return compile(tsConfigBasePaths);
}