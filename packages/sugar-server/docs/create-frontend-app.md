## 如何使用sugar-script和sugar-server-utils搭建前端应用
之前我们已经了解了如何使用sugar-server启动一个node服务。

这里是介绍如何使用sugar-script和sugar-server-utils搭建一个包含完整前端功能的应用。

- sugar-script 对代码进行构建的工具
- sugar-server-utils 提供运行时的额外工具函数

搭建完成例子可以参考examples下的例子

### 第一步，创建静态资源服务
关键点：使用sugar-server-utils里的StaticController。代码如下
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
其中让人比较好奇的是 `process.env.SUGAR_SERVER_DIR` 和 `process.env.SUGAR_BROWSER_DIR` 两个环境变量是怎么来的。他们是sugar-scripts提供的。

### 第二步，写一点浏览器代码
比如我们可以在 browser/home/index.tsx 里写一点react代码～

### 第三步，注册Controller
我们可以添加一个新的Controller。先了解[Controller的基本使用方法](./controller.md)。再看一下以下代码。
```ts
import {
  Controller,
  router,
  parameter
} from 'sugar-server';
import {
  render
} from 'sugar-server-utils';

import HomePageView from 'sugar?browser-entry/../../browser/home';


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
可以看到里面有2段代码和之前不一样：`import HomePageView from 'sugar?browser-entry/../../browser/home';` 和 `@render.register(HomePageView)`;

这2个都是自动构建的勾子，类似于为webpack写entry.
`sugar?browser-entry/`的前缀，即该文件即将被用于webpack的entry。

`@render.register` 这个路由的返回会使用这个entry对应的产物。

### 第四步，HTML!
我们使用webpack的时候是不是还有html模版？
那我们这里通过render.ts实现。

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

`data.scriptHTML.main` 是 `@render.register`注册的产物。
`${custom.title}` 即路由中返回的数据
```ts
return {
  title: 'welcome',
};
```
也就是'welcome'。

### 第五步，增加sugar.config
配置如下
```ts
import {
  SugarScriptsProject
} from 'sugar-scripts';


export const packageConfig: SugarScriptsProject.PackageConfig = {
  browser: {
    output: './build/dist'
  },
  server: {
    output: './build/server',
    entry: './server/index.ts',
    render: './server/render.ts',
  }
}
```

主要也就是指定`browser`和`server`的目录

### 第六步，启动服务
```bash
sugar-scripts dev
```
使用以上命令，即可启动本地开发服务。看到我们完成的页面了。
