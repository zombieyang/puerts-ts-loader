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
                AddTSCompiler(Path.GetDirectoryName(absPath));
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
                string tryPath = Path.Combine(item.Key, specifier);
                if (File.Exists(tryPath)) {
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
        public static TypescriptAsset GetAssetBySpecifier(string specifier)
        {
            if (string.IsNullOrEmpty(specifier)) return null;

            foreach (KeyValuePair<string, TSCompiler> item in tsCompilers)
            {
                string tryPath = Path.Combine(item.Key, specifier);
                if (File.Exists(tryPath)) {
                    return (TypescriptAsset)AssetDatabase
                        .LoadAssetAtPath(Path.GetRelativePath(Path.Combine(UnityEngine.Application.dataPath, ".."), tryPath), typeof(TypescriptAsset));
                }
            }
            return null;
        }
    }
}
#endif