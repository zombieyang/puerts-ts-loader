using UnityEditor;
using System;
using System.IO;

namespace Puerts 
{
    public class TSResourcesReleaser 
    {
        [MenuItem("PuerTS/TSLoader/Release TS To Resources")]
        public static void ReleaseToResources()
        {
            var saveTo = Configure.GetCodeOutputDirectory();
            string[] allPaths = TSDirectoryCollector.GetAllDirectoryAbsPath();
            
            var env = new JsEnv();
            env.UsingAction<string>();
            env.Eval<Action<string>>(@"(function (requirePath) { 
                global.require = require('node:module').createRequire(requirePath + '/')
                if (!require('node:fs').existsSync(requirePath + '/node_modules')) {
                    throw new Error(`node_modules is not installed, please run 'npm install' in ${requirePath}`);
                }
            })")(Path.GetFullPath("Packages/com.tencent.puerts.ts-loader/Javascripts~"));

            var TSCRunner = env.Eval<Action<string, string[]>>(@" 
                (function() { 
                    const releaseTS = require('./dist/release').default;

                    return function(saveTo, tsConfigPathCSArr) {
                        const arr = [];
                        for (let i = 0; i < tsConfigPathCSArr.Length; i++) {
                            arr.push(tsConfigPathCSArr.get_Item(i));
                        }
                        return releaseTS(saveTo, arr);
                    }
                })()
            ");

            TSCRunner(saveTo + "/TSOutput/", allPaths);
            UnityEngine.Debug.Log("Outputed Javascript to " + saveTo + "/TSOutput/");
            env.Dispose();
        }
    }
}