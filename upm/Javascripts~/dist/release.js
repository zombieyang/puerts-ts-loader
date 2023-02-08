"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const ts = __importStar(require("typescript"));
function compile(refs) {
    let tsconfigIndex = 0;
    const builder = ts.createSolutionBuilder(ts.createSolutionBuilderHost(Object.assign({}, ts.sys, {
        readFile(path) {
            if (path == '/puer-mock/tsconfig.json') {
                return JSON.stringify({ references: refs.map(item => ({ path: item })) });
            }
            return (0, fs_1.readFileSync)(path, 'utf-8');
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
            config.outDir = `T:/_CODE_/puerts_FP_demo/Assets/Puer_Gen/TSOutput/${tsconfigIndex++}/Resources`;
        }
        return ts.createEmitAndSemanticDiagnosticsBuilderProgram.apply(ts, args);
    }, function (err) { console.warn(err.messageText); }), ["/puer-mock/tsconfig.json"], { outDir: 'T:\\_CODE_\\puerts_FP_demo\\Assets\\Puer_Gen\\Resources' });
    return builder.build() == 0;
}
function ReleaseTS(tsConfigBasePaths) {
    return compile(tsConfigBasePaths);
}
exports.default = ReleaseTS;
