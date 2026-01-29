## 如何使用 sugar-scripts 和 sugar-server-utils 搭建前端应用
之前我们已经了解了如何使用 `sugar-server` 启动一个 node 服务。

这里是介绍如何使用 **sugar-scripts** 和 **sugar-server-utils** 搭建一个包含完整前端功能的应用。

- **sugar-scripts**：对浏览器和服务端代码进行构建的工具
- **sugar-server-utils**：提供运行时的额外工具函数

> 如果你是新建项目，推荐使用脚手架 **`create-sugar-app`**，它已经帮你：
> - 创建包含 `server` / `browser` 的目录结构；
> - 配置好 `sugar-scripts` 和 `tsconfig`；
> - 安装 `sugar-server` / `sugar-server-utils` 等依赖。
>
> 本文的内容，可以作为你阅读脚手架生成项目时的「详解版」。

搭建完成的例子可以参考 `examples` 下的示例项目。

---

### 使用 create-sugar-app 快速初始化一个带前端的项目

在任意目录运行：

```bash
npx create-sugar-app my-sugar-app
```

根据提示选择：

- **template**：推荐选择 `react`（会自动创建 `browser/` 目录并内置 React 示例）
- **packageManager**：选择你习惯的（推荐 `pnpm`）

执行完成后，会在当前目录生成 `my-sugar-app`：

- `server/`：基于 sugar-server 的服务端代码
- `browser/`：前端代码（如 React）
- `sugar.config.ts`：sugar-scripts 的项目配置
- 已配置好的 `tsconfig.json` 等

你可以直接进入项目目录，执行：

```bash
cd my-sugar-app
sugar-scripts dev
```

即可启动本地开发服务。

> 如果你想进一步理解这些文件的含义，可以继续阅读下面的「从零搭建」步骤。

---

### 第一步，创建静态资源服务
关键点：使用 `sugar-server-utils` 里的 `StaticController`。代码如下
```ts
import path from 'path';
import {
  Application
} from 'sugar-server';

import {
  StaticController
} from 'sugar-server-utils';

class App extends Application {
  static Controllers = [
    StaticController.createStaticController({
      staticResourcesPath: path.resolve(
        __dirname,
        path.relative(
          process.env.SUGAR_SERVER_DIR || '',
          process.env.SUGAR_BROWSER_DIR || ''
        )
      ),
      prefix: '/static'
    })
  ]
}

const app = new App();
app.listen(9000, () => {
  console.log('start server on 9000')
});
```
其中比较让人好奇的是 `process.env.SUGAR_SERVER_DIR` 和 `process.env.SUGAR_BROWSER_DIR` 两个环境变量是怎么来的。它们是 **sugar-scripts** 在构建/运行时注入的：

- `SUGAR_SERVER_DIR`：当前 server 构建产物所在目录；
- `SUGAR_BROWSER_DIR`：当前 browser 构建产物所在目录；
- 上面的 `path.relative` + `path.resolve` 组合，是为了从 server 输出目录找到 browser 输出目录。

> 如果是由 `create-sugar-app` 创建的项目，一般不需要手动改动这段逻辑，只需理解它的作用即可。

---

### 第二步，写一点浏览器代码
比如我们可以在 `browser/home/index.tsx` 里写一点 React 代码：

```tsx
import React from 'react';

export default function HomePage () {
  return (
    <div>
      <h1>Welcome</h1>
      <p>Hello sugar-server.</p>
    </div>
  );
}
```

---

### 第三步，注册 Controller
我们可以添加一个新的 Controller。先了解 [Controller 的基本使用方法](./controller.md)，再看一下以下代码。
```ts
import {
  Controller,
  router,
  parameter
} from 'sugar-server';
import {
  render
} from 'sugar-server-utils';

import HomePageView from '../../browser/home';


export class HomeController extends Controller {
  @router.GetRoute('/')
  @parameter.getter
  @render.register(HomePageView)
  home () {
    return {
      title: 'welcome',
    };
  }
}
```
可以看到里面有 2 段代码和之前不一样：`import HomePageView from '../../browser/home';` 和 `@render.register(HomePageView)`。

- `../../browser/home` 是一个普通的模块导入，指向我们刚才写的浏览器组件；
- `@render.register(HomePageView)` 表示：这个路由的返回会使用该组件对应的浏览器构建产物来渲染页面。

结合下一步在 `sugar.config.ts` 中的配置（`browser.includes`），sugar-scripts 会自动把 `browser` 目录下的入口当作前端构建入口来处理，无需再使用老的 `sugar?browser-entry/` 前缀。

> 旧版可以通过 `import View from 'sugar?browser-entry/...';` 来显式标记 entry，
> 现在推荐的方案是：**通过 `browser.includes` 指定浏览器代码目录 + 正常 `import`**，更直观也更易维护。

---

### 第四步，HTML 模板
我们使用 webpack 的时候是不是还有 html 模版？
那我们这里通过 `render.ts` 实现。

新建一个`/server/render.ts`
```ts
import {
  render
} from 'sugar-server-utils'

const htmlRender: render.CustomRender = function (
  data,
  custom
) {
  return `<!DOCTYPE html>
  <head>
    <title>${custom.title}</title>
  </head>
  <body>
    <div id="application"></div>
    ${data.scriptHTML.main}
  </body>
  </html>`;
}

export default htmlRender;
```

这里：

- `data.scriptHTML.main` 是 `@render.register` 注册的产物（通常是一段 `<script>` 标签 HTML）；
- `${custom.title}` 即路由中返回的数据：

```ts
return {
  title: 'welcome',
};
```
也就是 `'welcome'`。

---

### 第五步，增加 sugar.config
配置如下（推荐做法，参考 `templates/base`）：
```ts
import {
  SugarScriptsProject
} from 'sugar-scripts';


export const packageConfig: SugarScriptsProject.PackageConfig = {
  browser: {
    output: './build/dist',
    includes: [
      './browser'
    ]
  },
  server: {
    output: './build/server',
    entry: './server/index.ts',
    render: './server/render.ts',
  }
}
```
这里主要做了两件事：

- 指定 `browser` 和 `server` 的目录与入口文件；
- 通过 `browser.includes` 告诉 sugar-scripts：`./browser` 目录中的代码是需要在浏览器里运行的前端代码。

- `browser.output`：浏览器端打包产物输出目录；
- `browser.includes`：需要被识别为浏览器入口的源码目录列表（推荐总是包含 `./browser`）；
- `server.output`：服务端打包产物输出目录；
- `server.entry`：服务端入口文件（通常是创建并启动 Application 的位置）；
- `server.render`：刚才定义的 `render.ts`。

---

### 第六步，启动服务
```bash
sugar-scripts dev
```
使用以上命令，即可启动本地开发服务。
一般情况下，会同时完成：

- 监听源码变更并重新构建 browser/server；
- 启动 Node 服务并提供静态资源与 HTML 渲染。

打开终端输出中的地址，即可看到我们完成的页面。
