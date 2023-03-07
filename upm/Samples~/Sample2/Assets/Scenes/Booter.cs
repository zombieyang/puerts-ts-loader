using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using Puerts;

public class Booter : MonoBehaviour
{
    // Start is called before the first frame update
    void Start()
    {
        var env = new JsEnv(new TSLoader(System.IO.Path.Combine(Application.dataPath, "../Puer-Project")));
        env.ExecuteModule("main.mts");
    }

    // Update is called once per frame
    void Update()
    {
        
    }
}
