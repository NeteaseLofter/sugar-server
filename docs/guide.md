# 快速开始

本文是为了帮助你一步步快速的搭建一个 **sugar-server** 应用

## 环境准备
- 运行环境: nodejs
- **typescript**: 需要在**tsconfig.json**中设置 [`experimentalDecorators: true`](https://www.typescriptlang.org/docs/handbook/decorators.html)开启装饰器
- **babel**: 需要添加 [`@babel/plugin-proposal-decorators`](https://babeljs.io/docs/en/babel-plugin-proposal-decorators)插件， 开启支持装饰器
  **babel**还额外需要 [`babel-plugin-parameter-decorator`](https://www.npmjs.com/package/babel-plugin-parameter-decorator)插件，来支持参数装饰器

#### 关于参数装饰器
https://github.com/tc39/proposal-decorators#could-we-support-decorating-objects-parameters-blocks-functions-etc

tc39其实还并有没正式提出，但是typescript已经提前实现了。可以持续关注下。

## 逐步搭建

#### 安装 sugar-server
```shell
npm i --save sugar-server
```


#### 创建服务
1. 写一个**Controllers**
```typescript
import {
  Controller,
  router
} from 'sugar-server';

export class HelloWorldController extends Controller {
  @router.GetRoute('/')
  home () {
    return 'hello World!';
  }
```

2. 写一个启动服务
```typescript
import {
  createApplication
} from 'sugar-server';

import { HelloWorldController } from './hello-world-controller';

const myApplication = createApplication(
  [],
  {
    HelloWorldController
  },
  {}
);

myApplication.listen(9527)
```

3. 访问 `http://127.0.0.1:9527`
就可以看到一个 hello world!了
