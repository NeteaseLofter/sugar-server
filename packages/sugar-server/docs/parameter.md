## 参数获取指南

在 **sugar-server** 中，请求参数都是通过**参数装饰器**的方式自动注入的，无需在方法内部手动解析 `ctx`。

> 简单理解：原本你可能会在 Koa 里写 `ctx.query.name`、`ctx.request.body`，  
> 在 sugar-server 里可以通过函数参数 + 装饰器的方式直接拿到，类型也更清晰。

---

### 使用方法

#### 首先得配置 Controller
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
我们用之前 [Controller](./controller.md) 篇的例子。

#### 加上参数装饰

使用有 2 步（**注意装饰器顺序**）：

1. 在 Controller 中已经绑定路由装饰的函数**下面**增加 `@parameter.getter` 的装饰，开启请求数据获取功能；
2. 在函数参数前加 `@parameter.query('name')` 等参数装饰，将会自动给参数赋值；

> 为什么要先写 `@router.*` 再写 `@parameter.getter`？  
> 因为 getter 需要在路由生效后才能正确获取当前请求的信息。

##### 代码如下
```typescript
import {
  parameter
} from 'sugar-server';
...

@router.GetRoute('/')
@parameter.getter
home (
  @parameter.query('name')
  name: string
) {
  return `hello ${name}!`;
}

...
```

我们访问 `/?name=小明`，就可以看到页面上出现 `hello 小明!` 了。


### 已经支持的参数获取装饰

1. **`query(key)`**  
   获取 URL 上的 query 参数，例如 `?key=value`。
2. **`header(key)`**  
   获取请求 header 里的内容。**注意：HTTP 头大小写不敏感，这里统一用小写访问。**
3. **`params(key)`**  
   获取 URL 路径上的参数，需要配合路由使用：
    ```typescript
    @router.GetRoute('/:name')
    @parameter.getter
    home (
      @parameter.params('name')
      name: string
    ) {
      console.log(name)
      // 这样就能输出 小明 了
    }
    ```
4. **`body(path?)`**  
   获取请求体中的数据，`body()` 会根据 **content-type** 自动识别；`path` 为可选参数，使用方法如下：
   1. 比如请求 body 为 `{ "id": 123 }` 的 JSON；
   2. 不使用 `path` 参数，则返回 `{ "id": 123 }`，即完整的数据；
   3. 传入参数 `body('id')`，则返回 `123`，即 `id` 属性的内容；
5. **`bodyJSON(path?)`**  
   获取 JSON 格式请求体的内容，`path` 使用方式同上。
6. **`bodyFormData(path?)`**  
   获取 `formData` 格式请求体的内容，`path` 使用方式同上。
7. **`bodyText()`**  
   获取字符串格式的请求体内容。
8. **`config` / `config(configKey)`**  
   获取应用上的配置：不带参数时注入 `Config` 实例，带参数时通过 `configKey` 获取对应配置值，详见 [config 配置指南](./config.md)。
9. **`Response` / `NodeResponse` / `Request` / `NodeRequest`**  
   分别获取 Koa 的 `response`、Node 的 `response`、Koa 的 `request`、Node 的 `request`。
10. **`Context`**  
    获取 Koa 的 `context`（即 `ControllerContext`），一般只有在需要直接操作底层能力时才用到。

---

### 常见组合示例

下面是一个实际接口，综合使用了 `query` + `header` + `bodyJSON`：

```typescript
import {
  Controller,
  router,
  parameter
} from 'sugar-server';

export class UserController extends Controller {
  @router.PostRoute('/user/:id')
  @parameter.getter
  updateUser (
    @parameter.params('id')
    id: string,
    @parameter.header('authorization')
    token: string,
    @parameter.bodyJSON('profile')
    profile: any
  ) {
    // id: 路径参数 e.g. /user/123
    // token: 请求头里的 authorization
    // profile: body 里的 profile 字段
    return {
      id,
      ok: true
    };
  }
}
```