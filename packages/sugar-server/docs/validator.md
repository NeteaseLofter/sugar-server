## 自带参数校验工具

在获取参数之后，**sugar-server** 还提供了一套基于装饰器的参数校验工具。

通过在方法和参数上叠加校验装饰器，可以在进入业务逻辑之前完成各种校验，若校验失败则直接抛出 `SugarServerError`。

> 对比传统 Koa：  
> 往往你需要在方法里手动写 if/else 做各种类型/必填判断；  
> 在 sugar-server 中，可以用装饰器声明式地把这些规则「绑在参数上」。

### 使用方法

#### 加上校验装饰

使用有 2 步（**注意装饰器顺序**）：

1. 在 Controller 中已经绑定路由装饰的函数下面增加 `@validator.validate` 的装饰，开始自动校验功能；  
   **注意：和 `parameter` 同时使用的话，需要放到 `@parameter.getter` 后面，先获取后校验。**
2. 在函数参数前加 `@validator.required` 等装饰，会在运行函数前，对该参数进行校验；  
   **如果校验不通过，会 `throw SugarServerError`，不会继续执行业务函数。**

##### 代码示例

```typescript
import {
  router,
  parameter,
  validator
} from 'sugar-server';

class MyController extends Controller {
  @router.GetRoute('/')
  @parameter.getter
  @validator.validate
  home (
    @parameter.query('name')
    @validator.required
    @validator.string
    name: string
  ) {
    return `hello ${name}!`;
  }
}
```

### 已经支持的校验工具

1. **`required`**：必填校验，值为 `null` / `undefined` / 空字符串等 falsy 时会抛出错误。
2. **`string`**：类型校验，要求值为 `string`。
3. **`number`**：类型校验，要求值为 `number`。
4. **`array(itemExtraCheck?)`**：数组校验，要求值为数组；  
   - 若传入 `itemExtraCheck`（可以是 `required` / `string` / `number` 等或自定义的 `ParameterValidate`），  
     则会对数组的每一项依次执行额外的校验。

这些校验都会在失败时抛出 `SugarServerError`，其 `code` 默认为 `400`，并带有 `statusCode: 400`，可以在自定义的 `onError` 中统一处理。

---

### 典型错误返回示例

假设你有这样一个接口：

```typescript
class MyController extends Controller {
  @router.GetRoute('/')
  @parameter.getter
  @validator.validate
  home (
    @parameter.query('name')
    @validator.required
    @validator.string
    name: string
  ) {
    return `hello ${name}!`;
  }
}
```

- 当请求为 `/?name=小明` 时，返回正常字符串；
- 当 `name` 缺失或为空字符串时，会抛出 `SugarServerError`，最终（结合 Application 文档中的 `onError` 实现）响应大致如下：

```json
{
  "code": 400,
  "message": "name is required"
}
```

前端可以在一个统一的 HTTP 拦截器里，对 `code !== 0` 或 `code >= 400` 的情况统一弹 Toast/Modal。