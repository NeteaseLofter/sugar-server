## 应用 config 配置

`sugar-server` 内置了一个扁平化配置工具，会自动配置在 **Application** 实例上，方便在 Controller 中通过参数装饰器直接获取。

在使用时，可以根据项目需要选择：

- 注册到 `Application.defaultConfig` / `Module` 上，由框架自动托管；
- 或者在外部自行维护全局单例（不推荐和框架内置方式混用）。

> 对于通过 `create-sugar-app` 创建的项目，通常会在 `server` 入口文件中为 `Application` 配置好默认 config，  
> 你可以在此基础上继续扩展字段。

### 初始化 Application 时，注入配置
```typescript
import {
  Application
} from 'sugar-server';

class App extends Application {
  static Controllers = [
    MyController
  ]
  static defaultConfig = {
    a: 1,
    b: {
      c: 2
    }
  }
}

const app = new App();
app.listen(9000);
```

### 通过参数装饰器获取 app 上的 config

```typescript
import {
  Controller,
  Config,
  router,
  parameter
} from 'sugar-server';

class MyController extends Controller {
  @router.GetRoute('/')
  @parameter.getter
  home (
    @parameter.config
    config: Config,
    @parameter.config('b.c')
    bc: number
  ) {
    return config.get('a') + ';' + bc; // 输出 1;2
  }
}
```

### 进阶 - 根据环境变量切换配置

> 下面以 `configs/` 目录作为示例，你也可以使用其它目录和文件名，  
> 只要最终把导出的对象/模块赋给 `Application.defaultConfig` 即可。

1. 书写 **`configs/config.dev.ts`**

```typescript
export const test = 'dev';
```

2. 书写 **`configs/config.pro.ts`**

```typescript
export const test = 'pro';
```

3. 启动服务时根据环境变量选择对应配置

```typescript
import {
  Application
} from 'sugar-server';
import * as devConfig from './configs/config.dev';
import * as proConfig from './configs/config.pro';

class App extends Application {
  static defaultConfig = process.env.SERVER_ENV === 'production'
    ? proConfig
    : devConfig;
}
```
