using UnityEngine;
using System;
using System.Linq;
using System.Collections.Generic;
using System.IO;

namespace Puerts.TSLoader
{
    public class TSLoader : ILoader, IResolvableLoader, IModuleChecker, IBuiltinLoadedListener
    {
        DefaultLoader puerDefaultLoader = null;
        List<ILoader> LoaderChain = new();

        public void OnBuiltinLoaded(JsEnv env)
        {
            foreach (var loader in LoaderChain)
            {
                try 
                {
                    if (loader is IBuiltinLoadedListener) (loader as IBuiltinLoadedListener).OnBuiltinLoaded(env);
                }
                catch(Exception e)
                {
                    Debug.LogException(e);
                }
            }
        }

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

        public void UseRuntimeLoader(ILoader loader)
        {
            LoaderChain.Add(loader);
        }

        public bool IsESM(string path)
        {
            return !path.EndsWith(".cjs") && !path.EndsWith(".cts");
        }

        public string Resolve(string specifier, string referrer)
        {
            lastResolveSpecifier = null;
#if UNITY_EDITOR && !PUERTS_TSLOADER_DISABLE_EDITOR_FEATURE
            string fullPath;
            if (PathHelper.IsRelative(specifier))
            {
                fullPath = TSDirectoryCollector.TryGetFullTSPath(
                    PathHelper.normalize(PathHelper.Dirname(referrer) + "/" + specifier)
                );
            }
            else
            {
                fullPath = TSDirectoryCollector.TryGetFullTSPath(specifier);
            }
            if (fullPath != null) return fullPath;
#else
            if (specifier.EndsWith(".ts") || specifier.EndsWith(".mts"))
            {
                specifier = specifier.Replace(".mts", ".mjs").Replace(".ts", ".js");
            }
#endif
            if (LoaderChain.Count == 0) 
            {
                // UnityEngine.Debug.Log(specifier + " use default loader");
                if (puerDefaultLoader == null) puerDefaultLoader = new DefaultLoader();
                if (PathHelper.IsRelative(specifier))
                {
                    specifier = PathHelper.normalize(PathHelper.Dirname(referrer) + "/" + specifier);
                }
                return puerDefaultLoader.FileExists(specifier) ? specifier : null;
            }
            else 
            {
                foreach (var loader in LoaderChain)
                {
                    // UnityEngine.Debug.Log(specifier + " iterating loader chain:" + loader);
                    if (loader is IResolvableLoader)
                    {
                        var resolveResult = (loader as IResolvableLoader).Resolve(specifier, referrer);
                        lastResolveLoader = loader;
                        lastResolveSpecifier = resolveResult;
                        if (!string.IsNullOrEmpty(resolveResult)) {
                            return resolveResult;
                        }
                    } 
                    else 
                    {
                        if (PathHelper.IsRelative(specifier))
                        {
                            specifier = PathHelper.normalize(PathHelper.Dirname(referrer) + "/" + specifier);
                        }
                        if (loader.FileExists(specifier)) 
                        {
                            lastResolveLoader = loader;
                            lastResolveSpecifier = specifier;
                            return specifier;
                        }
                    }
                }
                return null;
            }
        }

        public bool FileExists(string filename)
        {
            return true;
        }
        string lastResolveSpecifier;
        Puerts.ILoader lastResolveLoader;
  
        public virtual string ReadFile(string specifier, out string debugpath)
        {
            debugpath = ""; // uncessary to set debugpath because sourcemap can support the vscode debug
#if UNITY_EDITOR && !PUERTS_TSLOADER_DISABLE_EDITOR_FEATURE
            string filepath = specifier;
            if (filepath.EndsWith(".ts") || filepath.EndsWith(".mts")) 
            {
                return TSDirectoryCollector.EmitTSFile(filepath); 
                
            } 
            else if (File.Exists(filepath)) 
            {
                return File.ReadAllText(filepath);
                
            }
#else
            if (specifier.EndsWith(".ts") || specifier.EndsWith(".mts"))
            {
                specifier = specifier.Replace(".mts", ".mjs").Replace(".ts", ".js");
            }
#endif
            string content = null;
            if (LoaderChain.Count == 0) 
            {
                content = puerDefaultLoader.ReadFile(specifier, out debugpath);
            }
            else 
            {
                if (lastResolveSpecifier == specifier) 
                {
                    content = lastResolveLoader.ReadFile(specifier, out debugpath);
                }
                else
                {
                    foreach (var loader in LoaderChain)
                    {
                        content = loader.ReadFile(specifier, out debugpath);
                    }
                }
            }

#if UNITY_EDITOR && !PUERTS_TSLOADER_DISABLE_EDITOR_FEATURE
            // consider give a hook in puerts.core later.
            if (specifier.Contains("puerts/polyfill.mjs") || specifier.Contains("puerts/nodepatch.mjs")) content = @"
import '../console-track.mjs'
import '../puerts-source-map-support.mjs'
" 
                + content;
#endif
            return content;
        }

        public static byte[] GetBytes(string str) {
            return System.Text.Encoding.UTF8.GetBytes(str);
        }
    }
}