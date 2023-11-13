import ts from "typescript";

abstract class PuerBuiltinTranspiler {
    constructor() {

    }

    abstract transpile(specifier: string): { content: string, sourceMap: string };
}

export default PuerBuiltinTranspiler;

export const hostGetDefaultLibMixin = (function () {
    const host: any = {};

    const getDefaultLibLocation = host.getDefaultLibLocation = function () {
        return 'puer:///ts-loader/tslib/'
    }
    host.getDefaultLibFileName = function (config: any) {
        return getDefaultLibLocation() + ts.getDefaultLibFileName(config);
    }

    return host;
})()