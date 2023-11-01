import releaseTS from "./release";
import PuerTSCTranspiler from "./tsc";

export function runReleaseTS(saveTo: string, tsConfigPathCSArr: any, relativePathCallback: any) {
    const arr = [];
    for (let i = 0; i < tsConfigPathCSArr.Length; i++) {
        arr.push(tsConfigPathCSArr.get_Item(i));
    }
    return releaseTS(saveTo, arr, relativePathCallback ? (index) => relativePathCallback.Invoke(index) : void 0);
}

export function makeCompiler(tsProjRoot: string) {
    const transpiler = new PuerTSCTranspiler(tsProjRoot);

    return {
        emitTSFile(tsFilePath: string) {
            return transpiler.transpile(tsFilePath).content;
        },
        getSourceMap(tsFilePath: string) {
            return transpiler.transpile(tsFilePath).sourceMap;
        }
    }
}