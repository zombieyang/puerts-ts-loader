#if UNITY_EDITOR
using UnityEditor;
using UnityEngine;
using System;
using System.IO;
using System.Reflection;

namespace Puerts
{
    public class TypescriptAsset : ScriptableObject 
    {
        protected string _specifier = null;
        public string specifier 
        {
            get 
            {
                if (_specifier == null) _specifier = TSDirectoryCollector.GetSpecifierByAssetPath(Path.GetFullPath(AssetDatabase.GetAssetPath(this)));
                return _specifier;
            }
        }

        protected static string GetCurrentFolder()
        {
            Type projectWindowUtilType = typeof(ProjectWindowUtil);
            MethodInfo getActiveFolderPath = projectWindowUtilType.GetMethod("GetActiveFolderPath", BindingFlags.Static | BindingFlags.NonPublic);
            object obj = getActiveFolderPath.Invoke(null, new object[0]);
            string pathToCurrentFolder = obj.ToString();
            return pathToCurrentFolder;
        }
        
        [MenuItem("Assets/PuerTS/Create Typescript File(ESM)")]
        public static void CreateMTS()
        {
            System.IO.File.WriteAllText(
                System.IO.Path.Combine(Application.dataPath, "..", GetCurrentFolder(), "script.mts"),
                @"
console.log('hello world');
export default 'hello world'
                "
            );
            AssetDatabase.Refresh();
        }
        [MenuItem("Assets/PuerTS/Create tsconfig.json")]
        public static void CreateTSConfig()
        {
            System.IO.File.WriteAllText(
                System.IO.Path.Combine(Application.dataPath, "..", GetCurrentFolder(), "tsconfig.json"),
                @"
{
    ""compilerOptions"": { 
        ""target"": ""esnext"",
        ""module"": ""ES2015"",
        ""jsx"": ""react"",
        ""inlineSourceMap"": true,
        ""moduleResolution"": ""node"",
        ""experimentalDecorators"": true,
        ""noImplicitAny"": true,
        ""typeRoots"": [
        ],
    }
}"
            );
            AssetDatabase.Refresh();
        }
    }
}
#endif