#if UNITY_EDITOR
using System;
using System.IO;
using System.Collections.Generic;

namespace Puerts.TSLoader
{
    public class TSCompiler
    {
        Func<string, string> emitTSFile;
        Func<string, string> getSourceMap;
        public TSCompiler(string tsRootPath)
        {
            if (!Directory.Exists(TSLoader.TSLoaderPath)) 
            {
                throw new Exception("Please set TSLoader.TSLoaderPath as the installed path of puerts.ts-loader in your project");
            }
                
            var env = new JsEnv();
            env.UsingFunc<string, string>();
            env.UsingAction<string, string>();

            JSObject compiler = env
                .ExecuteModule("puerts/ts-loader/main.gen.mjs")
                .Get<Func<string, JSObject>>("makeCompiler")(tsRootPath);
            emitTSFile = compiler.Get<Func<string, string>>("emitTSFile");
            getSourceMap = compiler.Get<Func<string, string>>(@"getSourceMap");
        }

        public string EmitTSFile(string tsPath) 
        {
            var ret = emitTSFile(tsPath);
            return ret;
        }

        public string GetSourceMap(string tsPath) 
        {
            var ret = getSourceMap(tsPath);
            return ret;
        }
    }
}
#endif