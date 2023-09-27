## Controller配置指南
sugar-server中的Controller比较特殊。每次请求，都会实例化一个新的Controller对象。即，method中访问的this每次请求都不一样。

这种设计方式，有利于用每次新的Controller实例对象来追踪请求的完整链路。

如果需要维护共享数据，可以通过 `this.app` 在application实例上管理，或者通过全局的单例子管理。

### 属性
1. `app` - **Controller** 实例化时挂载的 **application**
2. `context` - 对应当前请求的koa context

### 添加路由
**SugarServer**中路由都是通过装饰的方式配置的。

### 例子

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


```typescript
@router.GetRoute('/')
```
这行装饰器就完成路由配置，后面只要使用该**controller**就好了


### 支持的请求 method
1. `GetRoute` 响应**method=GET**的请求
2. `PostRoute` 响应**method=POST**的请求
3. `PutRoute` 响应**method=PUT**的请求
4. `DelRoute` 响应**method=DELETE**的请求
5. `AllRoute` 响应**所有method类型**的请求


### 高阶使用
#### 同时使用多个装饰
装饰器的良好特性，可以支持一个函数上同时使用多个装饰
```typescript
@router.GetRoute('/hello-word')
@router.GetRoute('/hello-word-2')
home () {
  return 'hello World!';
}
```
这样不管你访问 `/hello-word` 还是 `/hello-word-2`都能看到 `hello World!`

#### 使用 SugarServerError 抛出错误，自动处理
```typescript
import {
  ...
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
你可以直接抛出错误，阻止继续执行代码，错误也会被自动捕获，然后返回一个自定义的错误信息[**参考Application**](./application.md)

#### 通过this.context 访问当前请求的上下文
```typescript
import {
  ...
  SugarServerError
} from 'sugar-server'

@router.GetRoute('/hello-word')
home () {
  this.context.res;
  this.context.req;

  return 'hello World!';
}
```
this.context是koa ctx的扩展，拥有koa ctx同样的属性和能力
