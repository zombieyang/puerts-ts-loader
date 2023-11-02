using UnityEditor;
using System;
using System.Linq;
using System.IO;

namespace Puerts.TSLoader
{
    public class TSReleaser 
    {
        protected static JsEnv _env = null;
        protected static JsEnv env 
        {
            get 
            {
                if (_env == null) {
                    _env = new JsEnv();
                    _env.UsingAction<string>();
                    _env.UsingFunc<int, string>();
                    _env.UsingAction<string, string[], Func<int, string>>();
                } 
                return _env;
            }
        }

        protected static Action<string, string[], Func<int, string>> _TSCRunner;
        public static void ReleaseAllTS(string saveTo, Func<int, string> outputRelativeCallback = null) 
        {
            string[] allPaths = TSDirectoryCollector.GetAllDirectoryAbsPath();
            allPaths = allPaths.Where(path => !path.Contains("/Editor/")).ToArray();

            if (_TSCRunner == null) 
            {
                _TSCRunner = env.ExecuteModule(@"puerts/ts-loader/main.gen.mjs").Get<Action<string, string[], Func<int, string>>>("runReleaseTS");
            }
            _TSCRunner(saveTo, allPaths, outputRelativeCallback);
        }

        [MenuItem(Puerts.Editor.Generator.UnityMenu.PUERTS_MENU_PREFIX + "/TSLoader/Release TS To Resources")]
        public static void ReleaseToResources()
        {
            var saveTo = Configure.GetCodeOutputDirectory();
            ReleaseAllTS(saveTo + "/TSOutput/", (index) => index + "/Resources");

            UnityEngine.Debug.Log("Outputed Javascript to " + saveTo + "/TSOutput/");
        }
    }
}