## 应用config配置
扁平化配置工具，会自动配置在 **application** 上

#### 基本用法
```typescript
config.add({
  a: 1,
  b: {
    c: 2
  }
})

config.get('a') // 输出 1
config.get('b.c') // 输出 2
```

#### 通过参数装饰器获取 app上的config
``` typescript
import {
    Controller,
    Config,
    router
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

#### 进阶 - 根据环境变量变化
1. 书写 **configs/config.dev.ts**
  ```typescript
  export const test = 'dev';
  ```

2. 书写 **configs/config.pro.ts**
  ```typescript
  export const test = 'pro';
  ```

3. 启动服务时根据环境变量配置
  ```typescript
  import {
    createApplication
  } from 'sugar-server';
  import * as devConfig from './configs/config.dev.ts';
  import * as proConfig from './configs/config.pro.ts';

  import { HelloWorldController } from './hello-world-controller';

  const myApplication = createApplication(
    [],
    {
      HelloWorldController
    },
    process.env.SERVER_ENV === 'production' ? proConfig : devConfig
  );

  myApplication.listen(9527)
  ```
