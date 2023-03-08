# TSLoader: 解决普洱下使用Typescript的大部分问题
* 提供一个PuerTS的Loader，使你：
    * 在Editor下，可以直接读取TS。无需研究tsconfig、无需自行编译ts。
    * 在Runtime下，也允许你插入额外的Loader，且Loader以链式组织，便于维护。
* 内置一套Typescript管理方式
    * 可在Asset面板中直接创建Typescript。
    * 将Typescript文件视为ScriptableObject，可拖入Editor面板上。
    * 可以编写自己的工具，在发布前将Typescript统一编译为js文件。

## 如何开始
1. 确认你已通过upm方式安装好PuerTS，可以用openupm、也可以clone后add from file。
2. 通过upm方式加载本包，加载方式请与PuerTS保持一致。本报的openupm包名为`com.tencent.puerts.ts-loader`
3. 在任意文件夹下，在Projects面板中点击右键，通过`PuerTS/Create tsconfig.json`添加`tsconfig.json`。（注意是在右键菜单的顶层，不是在菜单的Create子菜单里）
4. 通过`PuerTS/Create Typescript`在`tsconfig`旁边添加TS文件。并将其重命名，如`main`。
5. 创建`Monobehaviour`，在合适位置使用如下代码即可看到效果
```
var env = new Puerts.JsEnv(new Puerts.TSLoader());
env.ExecuteModule("main.mts");
```
## TS加载说明
在`ts-loader`概念里，每个`tsconfig`以及它所在的目录与子目录，会被认为是一个**TS项目**（有点类似asmdef的概念）。ts-loader在Unity编辑器下会自动扫描所有目录下的`tsconfig`，记录他们的位置。

每个TS项目里的TS，都可以用它`相对于tsconfig.json的路径`，被ExecuteModule加载到（比如上文中的`main.mts`）。如果你创建ts的路径相对于`tsconfig`是`./lib/sub.mts`，那你就可以通过`ExecuteModule('./lib/sub.mts')`加载它。

不同的tsconfig间，其下的ts文件可以互相加载，比如相对于tsconfig A的`./main.mts`，可以通过`import './sub.mts'`加载相对于tsconfig B的`./sub.mts`。而无论tsconfig A和tsconfig B各自放在哪个位置。但这种情况下，你需要在tsconfig里做好配置，才能获得其他tsconfig下ts文件的代码提示。详见[tsconfig间引用说明](#tsconfig间引用说明)

tsconfig下也可以放置js文件，且能像上述方式一样加载，但需要你在`tsconfig`里添加`compilerOptions.allowJS = true`

> 当前版本请勿在一个tsconfig控制的范围内添加另一个tsconfig

## 示例
本包遵循UPM包结构。示例位于`upm/Samples`
1. Sample 1 - 简单示例
    最简单的示例，Editor下加载Assets目录下的TS，Runtime下通过链式组织两个Loader完成加载工作。
    且通过PUERTS_TSLOADER_DISABLE_EDITOR_FEATURE，可以在Editor内测试Runtime下的Loader的效果。
2. Sample 2 - 与webpack和node_modules配合
    演示了如何添加一个Assets目录外的TSProject。
该Project使用webpack，将node_modules里的代码打包成为单独的JS（为了解决node_modules不好发布的问题）。这些单独的JS再被TSLoader控制中的TS所使用。

## TODO
* sourceMap
* consoleRedirect
* 解除对Node的依赖

## tsconfig间引用说明
ts-loader本身支持tsconfig之间的ts互相`import`，但你需要做一些配置才能让编辑器的`tsc`给你正确的提示
1. project references
   
   这个是与`compilerOptions`同级的配置，若不配置，则无法获得别的ts导出的内容。配置方式如下：
```
 "references": [
     {
         "path": "另一个tsconfig的路径"
     },
     {
         "path": "另一个tsconfig的路径"
     }
 ]
```
2. paths
   
   这个是在`compilerOptions`里的配置，如果不配置，则自动完成的加载路径会有一堆相对符号，最终无法被ts-loader处理。
```
"*": [
    "另一个tsconfig的路径/*",
    "另一个tsconfig的路径/*"
]
```
3. module
   
   这个是`compilerOptions`里的配置。没错就是用于指定输出模块格式的。只有配置为`None`或者`commonjs`，别的地方才能正确获得本项目的代码提示。本人不确定这是不是Bug。但总之该配置项会在ts-loader最终处理ts时统一改为ES2015，因此建议你在项目中填`None`
