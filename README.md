# sugar-server
node服务框架，基于`koa`但是略有不通


## 使用方法

### 创建服务
```typescript
import {
  createServer,
  createApplication
} from 'sugar-server';

import * as controllers from './controllers';

const server = createServer(
  { server: { port: 9527 } },
  [
    {
      application: createLofterAdminApplication()
    }
  ]
);


function createLofterAdminApplication () {
  const lofterAdminApplication = createApplication(
    [],
    controllers,
    {}
  );

  lofterAdminApplication.createApply();

  return lofterAdminApplication;
}
```

### Controllers
```typescript
import {
  Controller,
  router,
  ControllerContext
} from 'sugar-server';

export class RouterTestController extends Controller {
  static prefix = '/router-test';

  @router.GetRoute('/get')
  testGetRoute (ctx: ControllerContext) {
    ctx.body = 'get';
  }

  @router.PostRoute('/post')
  testPostRoute (ctx: ControllerContext) {
    ctx.body = 'post';
  }

  @router.PutRoute('/put')
  testPutRoute (ctx: ControllerContext) {
    ctx.body = 'put';
  }

  @router.DelRoute('/del')
  testDelRoute (ctx: ControllerContext) {
    ctx.body = 'del';
  }

  @router.AllRoute('/all')
  testAllRoute (ctx: ControllerContext) {
    ctx.body = 'all:' + ctx.method;
  }
}
```

### 获取请求中的参数和校验
```typescript
import {
  Controller,
  router,
  parameter,
  validator,
  ControllerContext
} from 'sugar-server';

export class TestController extends Controller {
  static prefix = '/test';

  @router.PostRoute('/post-parameter/:id')
  @parameter.getter
  testPostParameterRoute (
    @parameter.params('id') id: string,
    @parameter.query('q') q: string,
    @parameter.header('x-custom') x: string,
    ctx: ControllerContext
  ) {
    // console.log(ctx.request.body);
    ctx.body = `id:${id};q:${q};x:${x}`;
  }

  @router.PostRoute('/post-parameter-body')
  @parameter.getter
  testPostParameterJSONBodyRoute (
    @parameter.body() body: any,
    ctx: ControllerContext
  ) {
    ctx.body = JSON.stringify(body.a);
  }

  @router.PostRoute('/post-parameter-form')
  @parameter.getter
  testPostParameterFormBodyRoute (
    @parameter.body() body: any,
    ctx: ControllerContext
  ) {
    ctx.body = `${body.f1};${body.f2}`;
  }


  @router.GetRoute('/post-validate')
  @parameter.getter
  @validator.validate
  testPostValidateRoute (
    @parameter.query('id') @validator.required id: string,
    ctx: ControllerContext
  ) {
    ctx.body = id;
  }
}
```