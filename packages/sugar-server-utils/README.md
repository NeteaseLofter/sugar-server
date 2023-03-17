
# sugar-server-utils
为sugar-server提供一些辅助工具

## 辅助Controllers
### StaticController 静态资源
快速搭建静态资源服务的配件

使用方法
```ts
import path from 'path';
import {
  StaticController
} from 'sugar-server-utils';
import {
  Application
} from 'sugar-server';


class App extends Application {
  static Controllers = [
    StaticController.createStaticController({
        staticResourcesPath: path.resolve(
          __dirname,
          './resources'
        ),
        prefix: '/static'
      })
  ]
}
const app = new App();
app.listen(9000, () => {
  console.log('start server on 9000')
})
```

## 自定义render
### render 渲染
配合sugar-scripts使用，自动关联浏览器js的装饰器

使用方法
```ts
import {
  Controller,
  router,
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
    return {};
  }
}
```