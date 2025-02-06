#if UNITY_EDITOR
using System;

namespace Puerts.TSLoader
{
    public class TSCompiler
    {
        private readonly Func<string, string> emitTSFile;
        private readonly Func<string, string> getSourceMap;
        public TSCompiler(string tsRootPath, string compilerJSName)
        {
            var env = new JsEnv();
            env.UsingFunc<string, string>();
            env.UsingAction<string, string>();

            JSObject compiler = env
                .ExecuteModule(compilerJSName)
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