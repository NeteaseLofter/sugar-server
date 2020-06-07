## 参数获取指南

**SugarServer**中参数都是通过**参数装饰**的方式自动获取的

### 使用方法
#### 首先得配置controller
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
我们用之前 [Controller](./controller.md) 篇的例子

#### 加上参数装饰
使用有2步。

1. 在 controller 中已经绑定 router装饰的函数下面增加 `@parameter.getter` 的装饰，开始自动获取功能；
2. 在函数参数 前加 `@parameter.query('name')` 等装饰，将会自动给参数赋值，而且顺序不限；

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

我们访问 `/?name=小明`，就可以看到页面上出现 `hello 小明!` 了


### 已经支持的参数获取装饰
1. `query(key)` 获取url上的 query 参数，**?key=value**
2. `header(key)` 获取请求header里的内容，注意：http头是不区分大小写，请用小写来获取
3. `params(key)` 获取url路径上的参数，需要配合路由使用
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
4. `body()`/`bodyJSON()`/`bodyFormData()`/`bodyText()` 获取请求体中的数据 `body()` 会根据 **content-type** 自动识别，`bodyJSON()`/`bodyFormData()`/`bodyText()`则是直接转化成指定的格式