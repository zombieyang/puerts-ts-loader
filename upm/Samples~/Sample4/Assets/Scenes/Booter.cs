using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using Puerts;
using Puerts.TSLoader;
using System.IO;
using System;

public class NodeModuleLoader: IResolvableLoader, ILoader, IBuiltinLoadedListener
{
    private string _nodeModulePath;
    public NodeModuleLoader(string nodeModulePath) 
    {
        _nodeModulePath = PathHelper.normalize(Path.Combine(nodeModulePath, "node_modules"));
    }
    private Func<string, string, string> ResolvePackageFunc;
	private bool isBuiltinLoaded = false;
    public void OnBuiltinLoaded(JsEnv env)
    {
		isBuiltinLoaded = true;
        ResolvePackageFunc = env.ExecuteModule<Func<string, string, string>>("nodemodule-loader/resolve.mjs", "packageResolve");
    }

    public string Resolve(string specifier, string referrer)
    {
		if (!isBuiltinLoaded) { return null; }
//        https://nodejs.org/dist/latest-v18.x/docs/api/esm.html#resolver-algorithm-specification
        if (PathHelper.IsRelative(specifier)) 
        {
            UnityEngine.Debug.Log(specifier + " - " + referrer + " ? " + _nodeModulePath + " = " + referrer.Contains(_nodeModulePath));
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
		if (specifier.StartsWith("file://")) {
            string abspath = specifier.Substring(7);
            debugpath = abspath;
            return File.ReadAllText(abspath);
        }
        debugpath = "";
        return null;
    }
}

public class Booter : MonoBehaviour
{
    JsEnv env;
    // Start is called before the first frame update
    void Start()
    {
        var loader = new TSLoader(System.IO.Path.Combine(Application.dataPath, "../Puer-Project"));
        loader.UseRuntimeLoader(new NodeModuleLoader(Application.dataPath + "/../Puer-Project"));
        loader.UseRuntimeLoader(new DefaultLoader());
        env = new JsEnv(loader);
        env.ExecuteModule("main.mts");
    }

    // Update is called once per frame
    void Update()
    {
    }
}
