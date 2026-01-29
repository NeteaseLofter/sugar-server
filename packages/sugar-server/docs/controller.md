## Controller 配置指南

`sugar-server` 中的 `Controller` 比较特殊：**每次请求都会实例化一个新的 Controller 对象**。  
也就是说，同一个方法中访问到的 `this`，在每个请求里都是不同的实例。

这种设计方式，有利于通过每次新的 Controller 实例来追踪请求的完整链路，也避免了「跨请求共享可变状态」带来的问题。

> **不要在 Controller 实例上存跨请求共享的可变状态**  
> 例如：`this.cache = {}` 这类字段，每次请求都会重新创建。  
> 如果需要维护共享数据，可以通过 `this.context.app`（即 `Application` 实例）来管理，或者通过全局单例来管理。

### 属性

1. **context**: `ControllerContext`  
   当前请求的上下文，基于 `koa` 的 `Context` + `koa-router` 的 `RouterContext` 扩展而来，包含：
   - `request` / `response` / `req` / `res`
   - `params` / `query` / `body`
   - `app`: 当前的 `Application` 实例

### 添加路由

**sugar-server** 中的路由都是通过**装饰器**的方式配置的，不需要手写显式的 `router.get(...)`。

### 例子（最小 Controller）

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
}
```


`@router.GetRoute('/')` 这行装饰器就完成路由配置，后面只要把该 `Controller` 注册到 `Application.Controllers` 中即可。


### 支持的请求 method

1. **GetRoute(path)**: 响应 **method = GET** 的请求
2. **PostRoute(path)**: 响应 **method = POST** 的请求
3. **PutRoute(path)**: 响应 **method = PUT** 的请求
4. **DelRoute(path)**: 响应 **method = DELETE** 的请求
5. **AllRoute(path)**: 响应 **所有 HTTP method 类型** 的请求


### 高阶使用

#### 同时使用多个装饰

装饰器的良好特性，可以支持在一个函数上同时使用多个路由装饰：
```typescript
@router.GetRoute('/hello-word')
@router.GetRoute('/hello-word-2')
home () {
  return 'hello World!';
}
```
这样不管你访问 `/hello-word` 还是 `/hello-word-2` 都能看到 `hello World!`。

#### 使用 SugarServerError 抛出错误，自动处理

```typescript
import {
  Controller,
  router,
  SugarServerError
} from 'sugar-server'

@router.GetRoute('/hello-word')
home () {
  throw new SugarServerError(
    401,
    '禁止访问',
    {
      statusCode: 401
    }
  )
  return 'hello World!';
}
```
你可以直接抛出错误，阻止继续执行代码。错误会被自动捕获，并交给应用的 `onError` 方法处理，最终返回一个自定义的错误信息（参见 [Application](./application.md)）。

一个典型的错误响应 JSON（假设你按 Application 文档中的 `onError` 处理）类似：

```json
{
  "code": 401,
  "message": "禁止访问"
}
```

前端可以直接根据 `code` / `message` 做统一处理。

#### 通过 this.context 访问当前请求的上下文
```typescript
import {
  Controller,
  router,
  SugarServerError
} from 'sugar-server'

@router.GetRoute('/hello-word')
home () {
  this.context.res;
  this.context.req;

  return 'hello World!';
}
```
`this.context` 是对 Koa `ctx` 的扩展，拥有 Koa `ctx` 同样的属性和能力，并额外挂载了 `routerPath` 等字段。
