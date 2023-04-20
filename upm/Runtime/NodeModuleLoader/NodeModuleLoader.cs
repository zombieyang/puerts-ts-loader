using System.Collections;
using System.Collections.Generic;
using Puerts;
using Puerts.TSLoader;
using System.IO;
using System;

public class NodeModuleLoader: IResolvableLoader, ILoader, IBuiltinLoadedListener
{
    private string _nodeModulePath;
    public NodeModuleLoader(string nodeModulePath) 
    {
        _nodeModulePath = PathHelper.normalize(Path.Combine(nodeModulePath, "node_modules")).Replace("\\", "/");
    }
    private Func<string, string, string> ResolvePackageFunc;
    private Func<string, string> LoadPackageFunc;
	private bool isBuiltinLoaded = false;
    public void OnBuiltinLoaded(JsEnv env)
    {
		isBuiltinLoaded = true;
        ResolvePackageFunc = env.ExecuteModule<Func<string, string, string>>("nodemodule-loader/resolve.mjs", "packageResolve");
        LoadPackageFunc = env.ExecuteModule<Func<string, string>>("nodemodule-loader/resolve.mjs", "packageLoad");
    }

    public string Resolve(string specifier, string referrer)
    {
		if (!isBuiltinLoaded) { return null; }
//        https://nodejs.org/dist/latest-v18.x/docs/api/esm.html#resolver-algorithm-specification
        if (PathHelper.IsRelative(specifier)) 
        {
            if (referrer.Contains(_nodeModulePath)) return PathHelper.normalize(Path.Combine(PathHelper.Dirname(referrer), specifier));
            else return null;
        }
        if (Path.IsPathRooted(specifier)) return null;
        if (IsNodeBuiltin(specifier))
        {
            return "node:" + specifier;
        }
        
        return ResolvePackageFunc(specifier, "file://" + _nodeModulePath);
    }
	private bool IsNodeBuiltin(string specifier) 
	{
		return specifier == "path" || 
		specifier == "url";
	}

    public bool FileExists(string specifier) { return true; }

    public string ReadFile(string specifier, out string debugpath)
    {
		if (specifier.StartsWith("file:")) {
            debugpath = specifier;
            string content = LoadPackageFunc(specifier);
            return content;
        }
        debugpath = "";
        return null;
    }
}