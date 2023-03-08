# TSLoader: 解决普洱下使用Typescript的大部分问题
* 提供一个PuerTS的Loader，使你：
    * 在Editor下，可以直接读取TS。无需研究tsconfig、无需自行tsc。
    * 在Runtime下，也允许让你插入自己的Loader，且Loader以链式组织。
* 内置一套Typescript管理方式
    * 可在Asset面板中直接创建Typescript。
    * 将Typescript文件视为ScriptableObject，可拖入Editor面板上。
    * 可以编写自己的工具，在发布前将Typescript统一编译为js文件。

## 如何开始
1. 通过upm方式加载本包
2. 在合适的文件夹下，在Projects面板中点击右键，通过`PuerTS/Create tsconfig.json`添加TS目录配置。（注意不是在面板的Create里）
3. 通过`PuerTS/Create Typescript`添加TS文件。并自行重命名，如`main`
4. 创建`Monobehaviour`，在合适位置使用如下代码即可看到效果
```
var env = new Puerts.JsEnv(new Puerts.TSLoader());
env.ExecuteModule("main.mts");
```

## 示例
本包遵循UPM包结构。示例位于`upm/Samples`
1. Sample 1
    最简单的示例，Editor下加载Assets目录下的TS，Runtime下通过链式组织两个Loader完成加载工作。
    且通过PUERTS_TSLOADER_DISABLE_EDITOR_FEATURE，可以在Editor内测试Runtime下的Loader的效果。
2. Sample 2
    演示了如何添加一个Assets目录外的TSProject，且该Project使用webpack将node_modules里的代码打包入项目

## TODO
* sourceMap
* consoleRedirect
* 解除对Node的依赖
