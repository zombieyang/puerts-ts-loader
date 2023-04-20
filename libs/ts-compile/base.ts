abstract class PuerBuiltinTranspiler {
    constructor() {

    }

    abstract transpile(specifier: string): { content: string, sourceMap: string };
}

export default PuerBuiltinTranspiler;