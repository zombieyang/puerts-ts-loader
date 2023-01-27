# 在PuerTS里更自如地使用Typescript
* 在Asset面板中直接创建Typescript
* 提供配套Loader，让PuerTS可以直接读取TS而无需自行tsc。

## 如何开始
1. 通过upm方式加载本包
2. 在合适的文件夹下，在Projects面板中点击右键，通过`PuerTS/Create tsconfig.json`添加TS目录配置。
3. 通过`PuerTS/Create Typescript`添加TS文件。并自行重命名，如`main`
4. 创建`Monobehaviour`，在合适位置使用如下代码即可看到效果
```
var env = new Puerts.JsEnv(new Puerts.TSLoader());
env.ExecuteModule("main.mts");
```