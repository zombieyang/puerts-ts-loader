using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using Puerts;

public class TSLoaderExample : MonoBehaviour
{
    // Start is called before the first frame update
    void Start()
    {
        JsEnv env = new JsEnv(new TSLoader());
        env.ExecuteModule("main.mts");
    }

    // Update is called once per frame
    void Update()
    {
        
    }
}
