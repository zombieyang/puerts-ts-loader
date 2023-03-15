using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEditor;
using Puerts;
using Puerts.TSLoader;
using Unity.CodeEditor;

public class EditorTest
{
    [MenuItem("puer/opentest")]
    public static void OpenTest()
    {
        UnityEngine.Debug.Log(System.IO.Path.GetFullPath("Assets/Typescripts/tsconfig.json"));
        // CodeEditor.CurrentEditor.OpenProject("/Volumes/DATA_/Code/puerts-ts-loader/upm/Editor/ConsoleRedirect/Typescripts/tsconfig.json", 0, 0);
        CodeEditor.CurrentEditor.OpenProject("Assets/Typescripts/tsconfig.json", 0, 0);
    }
}

public class Main : MonoBehaviour
{
    JsEnv env;
    // Start is called before the first frame update
    void Start()
    {
        env = new JsEnv(new TSLoader());

        try {
            env.ExecuteModule(@"main.mjs");
            
        } catch {
            env.ExecuteModule(@"main2.mjs");
        } 
    }

    // Update is called once per frame
    void Update()
    {
        env.Tick();
    }
}
