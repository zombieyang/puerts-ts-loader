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

        static TSDirectoryCollector() 
        {
            var tsConfigList = AssetDatabase
                .FindAssets("tsconfig t:textAsset")
                .Select(guid => AssetDatabase.GUIDToAssetPath(guid))
                .Where(path=> path.Contains("/tsconfig.json"));
            foreach (var tsConfigPath in tsConfigList)
            {
                var absPath = Path.GetFullPath(tsConfigPath);
                AddTSCompiler(System.IO.Path.GetDirectoryName(absPath));
            } 
        }

        public static void AddTSCompiler(string absPath)
        {
            tsCompilers[absPath] = new TSCompiler(absPath);
        }

        public static string TryGetFullTSPath(string specifier) 
        {
            foreach (KeyValuePair<string, TSCompiler> item in tsCompilers)
            {
                string tryPath = System.IO.Path.Combine(item.Key, specifier);
                if (System.IO.File.Exists(tryPath)) {
                    return tryPath;
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
    }
}
#endif