using UnityEngine;
using System;
using System.Linq;
using System.Collections.Generic;

namespace Puerts.TSLoader
{
    public class TSLoader : Puerts.ILoader, Puerts.IModuleChecker
    {
        Puerts.DefaultLoader puerDefaultLoader = null;
        List<Puerts.ILoader> LoaderChain = new List<Puerts.ILoader>();

        public TSLoader(string externalTSConfigPath): this(new string[]{ externalTSConfigPath }) {}

        public TSLoader(string[] externalTSConfigPath = null)
        {
#if UNITY_EDITOR
            if (externalTSConfigPath != null)
            {   
                foreach(string path in externalTSConfigPath)
                {
                    TSDirectoryCollector.AddTSCompiler(path);
                }
            }
#endif
        }

        public void UseRuntimeLoader(Puerts.ILoader loader)
        {
            LoaderChain.Add(loader);
        }

        public bool IsESM(string path)
        {
            return !path.EndsWith(".cjs") && !path.EndsWith(".cts");
        }

        public virtual string Resolve(string specifier)
        {
            lastResolveSpecifier = null;
#if UNITY_EDITOR && !PUERTS_TSLOADER_DISABLE_EDITOR_FEATURE
            var fullPath = TSDirectoryCollector.TryGetFullTSPath(specifier);
            if (fullPath != null) return fullPath;
#else
            if (specifier.EndsWith(".ts") || specifier.EndsWith(".mts"))
            {
                specifier = specifier.Replace(".mts", ".mjs").Replace(".ts", ".js");
            }
#endif
            if (LoaderChain.Count == 0) 
            {
                if (puerDefaultLoader == null) puerDefaultLoader = new Puerts.DefaultLoader();
                return puerDefaultLoader.FileExists(specifier) ? specifier : null;
            }
            else 
            {
                foreach (var loader in LoaderChain)
                {
                    if (loader.FileExists(specifier)) 
                    {
                        lastResolveLoader = loader;
                        lastResolveSpecifier = specifier;
                        return specifier;
                    }
                }
                return null;
            }
        }

        public bool FileExists(string filename)
        {
            var resolveResult = Resolve(filename);
            return !string.IsNullOrEmpty(resolveResult);
        }
        string lastResolveSpecifier;
        Puerts.ILoader lastResolveLoader;
  
        public virtual string ReadFile(string specifier, out string debugpath)
        {
#if UNITY_EDITOR && !PUERTS_TSLOADER_DISABLE_EDITOR_FEATURE
            string filepath = Resolve(specifier);
            if (filepath.EndsWith("ts")) {
                debugpath = filepath; 
                var content = TSDirectoryCollector.EmitTSFile(filepath);
                return content; 
            } else if (System.IO.File.Exists(filepath)) {
                debugpath = filepath;
                return System.IO.File.ReadAllText(filepath);
                
            }
#else
            if (specifier.EndsWith(".ts") || specifier.EndsWith(".mts"))
            {
                specifier = specifier.Replace(".mts", ".mjs").Replace(".ts", ".js");
            }
#endif
            if (LoaderChain.Count == 0) 
            {
                return puerDefaultLoader.ReadFile(specifier, out debugpath);
            }
            else 
            {
                if (lastResolveSpecifier == specifier) 
                {
                    return lastResolveLoader.ReadFile(specifier, out debugpath);
                }
                foreach (var loader in LoaderChain)
                {
                    if (loader.FileExists(specifier)) 
                    {
                        return loader.ReadFile(specifier, out debugpath);
                    }
                }
                debugpath = "";
                return null;
            }
        }
    }
}