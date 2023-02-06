#if UNITY_EDITOR
using System.IO;
using System;
using System.Linq;
using UnityEditor;
using System.Collections.Generic;

namespace Puerts
{
    [InitializeOnLoad]
    public class TSDirectoryCollector
    {
        protected static Dictionary<string, TSCompiler> tsCompilers = new Dictionary<string, TSCompiler>();

        private class Utils {
            internal static string[] GetMaybeRealSpecifier(string specifier) 
            {
                if (specifier.EndsWith(".mjs")) 
                    return new string[] { 
                        specifier,
                        specifier.Substring(0, specifier.Length - 4) + ".mts"
                    };
                    
                else if (specifier.EndsWith(".cjs"))
                    return new string[] { 
                        specifier,
                        specifier.Substring(0, specifier.Length - 4) + ".cts"
                    };

                else if (specifier.EndsWith(".js"))
                    return new string[] { 
                        specifier, 
                        specifier.Substring(0, specifier.Length - 3) + ".ts"
                    };
                else 
                    return new string[] { 
                        specifier,
                        specifier + ".ts"
                    };
            }
        }

        static TSDirectoryCollector() 
        {
            var tsConfigList = AssetDatabase
                .FindAssets("tsconfig t:textAsset")
                .Select(guid => AssetDatabase.GUIDToAssetPath(guid))
                .Where(path=> path.Contains("/tsconfig.json"));
            foreach (var tsConfigPath in tsConfigList)
            {
                var absPath = Path.GetFullPath(tsConfigPath);
                AddTSCompiler(Path.GetDirectoryName(absPath));
            }

            JsEnv JSONHandler = new JsEnv();
            try
            {
                JSONHandler.UsingFunc<string, JSObject, string>();
                JSONHandler.UsingFunc<string[], JSObject>();

                Func<string, JSObject, string> TSConfigHandler = JSONHandler
                    .Eval<Func<string, JSObject, string>>(@"(function(jsonStr, arr) {
                    if (!arr.length) return jsonStr; 
                    const tsconfig = JSON.parse(jsonStr);
                    tsconfig.compilerOptions.paths = tsconfig.compilerOptions.paths || {};
                    tsconfig.compilerOptions.paths['*'] = arr; 
                    return JSON.stringify(tsconfig); 
                })");
                Func<string[], JSObject> CSArrToJSArr = JSONHandler
                    .Eval<Func<string[], JSObject>>(@"(function(csarr) {
                    const jsarr = [];
                    for (let i = 0; i < csarr.Length; i++) {
                        jsarr.push(csarr.get_Item(i));
                    }
                    return jsarr;
                })");
                string[] allTSRoot = tsCompilers.Keys.ToArray();
                foreach (string tsRoot in allTSRoot)
                {
                    string newTSConfig = TSConfigHandler(
                        File.ReadAllText(Path.Combine(tsRoot, "tsconfig.json")),
                        CSArrToJSArr(tsCompilers.Keys.Where(key => key != tsRoot).ToArray())
                    );
                    UnityEngine.Debug.Log(newTSConfig);
                    File.WriteAllText(Path.Combine(tsRoot, "tsconfig.json"), newTSConfig);
                }
            }
            catch (Exception e)
            {
            }
            JSONHandler.Dispose();
        }

        public static void AddTSCompiler(string absPath)
        {
            tsCompilers[absPath] = new TSCompiler(absPath);
        }

        public static string TryGetFullTSPath(string originSpecifier) 
        {
            string[] specifiers = Utils.GetMaybeRealSpecifier(originSpecifier);
            
            foreach (KeyValuePair<string, TSCompiler> item in tsCompilers)
            {
                foreach (string specifier in specifiers)
                {
                    string tryPath = Path.Combine(item.Key, specifier);
                    if (File.Exists(tryPath)) {
                        return tryPath;
                    }
                }
            }
            return null;
        }

        public static string EmitTSFile(string absPath) 
        {
            foreach (KeyValuePair<string, TSCompiler> item in tsCompilers)
            {
                if (absPath.Contains(item.Key)) {
                    return item.Value.EmitTSFile(absPath);
                } 
            }
            throw new Exception("emit tsfile " + absPath + " failed: not found");
        }

        public static string GetSpecifierByAssetPath(string assetPath) 
        {
            foreach (KeyValuePair<string, TSCompiler> item in tsCompilers)
            {
                if (assetPath.Contains(item.Key)) { 
                    return Path.GetRelativePath(item.Key, assetPath);
                }
            }
            return "";
        }
        public static TypescriptAsset GetAssetBySpecifier(string originSpecifier)
        {
            if (string.IsNullOrEmpty(originSpecifier)) return null;

            string[] specifiers = Utils.GetMaybeRealSpecifier(originSpecifier);

            foreach (KeyValuePair<string, TSCompiler> item in tsCompilers)
            {
                foreach (string specifier in specifiers)
                {
                    string tryPath = Path.Combine(item.Key, specifier);
                    if (File.Exists(tryPath)) {
                        return (TypescriptAsset)AssetDatabase
                            .LoadAssetAtPath(Path.GetRelativePath(Path.Combine(UnityEngine.Application.dataPath, ".."), tryPath), typeof(TypescriptAsset));
                    }
                }
            }
            return null;
        }
    }
}
#endif