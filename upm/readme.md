# TSLoader - 解决在普洱里使用Typescript的大多数问题
* 提供配套Loader
    * 在Editor下，让PuerTS可以直接读取typescript而无需自行tsc。
    * 在Runtime下，可以让你链式添加自己的Loader。
* 内置一套Typescript组织方式
    * 在Asset面板中直接创建Typescript
    * 内置一个将所有Typescript编译为Resources的脚本。你可以将它适配成自己的资源管理模式

## 如何开始
1. 通过upm方式加载本包
2. 在合适的文件夹下，在Projects面板中点击右键，通过`PuerTS/Create tsconfig.json`添加TS目录配置。（注意不是在面板的Create里）
3. 通过`PuerTS/Create Typescript`添加TS文件。并自行重命名，如`main`
4. 创建`Monobehaviour`，在合适位置使用如下代码即可看到效果
```
var env = new Puerts.JsEnv(new Puerts.TSLoader());
env.ExecuteModule("main.mts");
```

## TODO
* sourceMap
