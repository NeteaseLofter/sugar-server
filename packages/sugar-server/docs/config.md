## 应用config配置
扁平化配置工具，会自动配置在 **application** 上

config，需要考虑使用方式，是注册到application上还是使用全局的单例管理

### 初始化application时，注入配置
```typescript
import {
  Application
} from 'sugar-server';

class App extends Application {
  static Controller = [
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

### 通过参数装饰器获取 app上的config
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

### 进阶 - 根据环境变量变化
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
    Application
  } from 'sugar-server';
  import * as devConfig from './configs/config.dev.ts';
  import * as proConfig from './configs/config.pro.ts';

  class App extends Application {
    static defaultConfig = process.env.SERVER_ENV === 'production' ? proConfig : devConfig
  );
  ```
