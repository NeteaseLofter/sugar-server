## sugar-server 规格说明（反推版）

本文是根据 `packages/sugar-server/src` 实现代码与现有文档反推得到的规格说明，用于补充设计理解和后续演进时的参考。
如实现发生变更，请优先以「代码 + 测试」为准，再同步更新本规格。

---

## 1. 框架整体设计

- **定位**
  - 基于 `koa` + `koa-router` 的 HTTP 应用框架。
  - 提供装饰器风格的：
    - 路由定义（`router.*Route`）
    - 请求参数获取（`parameter.*`）
    - 参数校验（`validator.*`）
    - 扁平化配置管理（`Config`）
    - 模块化组合（`@Module`）

- **运行模型**
  - 一个 `Application` 即一个 `Koa<ControllerContext>` 实例。
  - 每次路由命中时：
    1. 根据命中的 `ControllerClass` 实例化一个新的 Controller（**每请求一个实例**）。
    2. 通过参数装饰器获取输入参数。
    3. 通过校验装饰器在进入业务逻辑前完成参数校验。
    4. 执行 Controller 方法（业务逻辑）。
    5. 若返回值非 `undefined` 且响应未结束，则写入 `ctx.body`。
    6. 如过程中抛出 `SugarServerError`，交由 `Application.onError` 处理。

---

## 2. 对外导出 API（`src/index.ts`）

框架主入口导出如下实体：

- `Application`: 应用基类。
- `Module`: 类装饰器，用于拼装 Controllers / 子 Applications / 默认配置。
- `router`: 路由装饰器集合：
  - `GetRoute(path)`
  - `PostRoute(path)`
  - `PutRoute(path)`
  - `DelRoute(path)`
  - `AllRoute(path)`
- `parameter`: 请求参数装饰器集合（query/header/body/...）。
- `validator`: 参数校验装饰器集合（required/string/number/array/...）。
- `Controller`: 控制器基类。
- `ControllerContext`: 扩展后的运行时上下文类型。
- `Config`: 配置类（扁平化存储）。
- `SugarServerError`: 业务错误类型。
- `logger`: 日志工具。

**约定**：对外用法尽量通过 `import { Application, Controller, router, parameter, validator } from 'sugar-server';` 完成，内部实现细节（如 `core/*`）视为非公开接口。

---

## 3. Application 规格（`core/application.ts`）

### 3.1 静态属性

`Application` 继承自 `Koa<ControllerContext>`，并扩展一组静态属性控制行为：

- 标识相关
  - `static __sugar_Application = true`
  - `static isApplication(obj: any): obj is Application`
  - `static isApplicationClass(objClass: any): objClass is typeof Application`

- 路由匹配 & 子应用挂载
  - `static host?: string | { includes?: string[]; excludes?: string[] }`
    - 当作为子应用挂载时，限制仅在满足 host 条件的请求下生效。
  - `static path?: string | RegExp`
    - 当作为子应用挂载时，指定子应用挂载前缀或正则匹配路径。
  - `static rewrite?: (reqUrl: url.UrlWithStringQuery, req: IncomingMessage) => string`
    - 当作为子应用挂载时，用于自定义重写内部可见的 `routerPath`。

- 组合配置
  - `static Controllers: (typeof Controller)[] = []`
    - 当前 Application 启动时要挂载的 `Controller` 列表。
  - `static Applications: (typeof Application)[] = []`
    - 当前 Application 中要挂载的**子 Application** 列表。
  - `static defaultConfig?: any`
    - 默认配置对象，会在构造函数中通过 `Config` 扁平化后注入 `this.config`。

### 3.2 实例属性

- `config: Config`
  - 由构造函数初始化。
  - 如存在 `defaultConfig`，会执行 `this.config.add(defaultConfig)`。
- `Controllers: (typeof Controller)[] = []`
  - 运行期间已挂载到当前 Application 的 Controllers 列表。
- `_applyRequest: any`
  - 通过 `createApply()` 缓存的 Koa callback。

### 3.3 构造函数行为

构造函数逻辑（简化抽象）：

1. 调用 `super()` 初始化 Koa。
2. 从 `this.constructor as typeof Application` 读出：
   - `Controllers`：对每个执行 `this.useController(ControllerClass)`。
   - `Applications`：对每个执行 `this.useApplication(ApplicationClass)`。
3. 创建新的 `Config` 实例并挂到 `this.config`。
4. 如存在 `defaultConfig`，调用 `this.config.add(defaultConfig)`。

### 3.4 方法语义

- `onError(err: SugarServerError, ctx: ControllerContext)`
  - 默认实现：`throw err`（不处理，只是抛出）。
  - 在 `router.appendControllerToRouter` 的路由处理函数中：
    - 捕获到错误后：
      - 若 `ctx.app.onError` 存在，调用 `ctx.app.onError(error as SugarServerError, ctx)`。
      - 否则重新抛出原始错误。
  - **推荐覆写**：
    - 根据 `err.statusCode` 设置 `ctx.status`。
    - 将结构化错误信息写入 `ctx.body`。

- `useApplication(ApplicationClass: typeof Application)`
  - 调用 `appendApplication(ApplicationClass)`：
    - 内部会 `new ApplicationClass()`，并执行 `application.createApply()`。
    - 构造一个 `routerMiddleware`：
      - 自动按 `ApplicationClass.path` / `host` / `rewrite` 决定是否接管该请求；
      - 设置 `req.routerPath`；
      - 调用 `application.applyRequest(req, res)`。
  - 将 `routerMiddleware` 通过 `this.use(routerMiddleware)` 挂载到当前 Application。

- `useController(ControllerClass: typeof Controller)`
  - 调用 `appendControllerToRouter(ControllerClass)`：
    - 若返回的 `router` 定义了路由：
      - 将 `router.routes()` 挂载到当前 Application。
      - 将 `ControllerClass` 记录到实例 `Controllers` 数组中。

- `createContext(req: IncomingMessage, res: ServerResponse)`
  - 调用 `super.createContext(req, res)` 创建 Koa 上下文。
  - 将 `(req as any).routerPath` 挂载到 `ctx.routerPath`。

- `createApply()`
  - 将 `this.callback()`（Koa 的 HTTP 处理函数）缓存到 `this._applyRequest`。

- `applyRequest(req, res)`
  - 简单代理：`return this._applyRequest(req, res);`

- 辅助函数：`applyApplication(application: Application, req, res)`
  - 只是调用 `application.applyRequest(req, res)`，便于直接复用 Application 的处理逻辑。

---

## 4. Controller & 路由规格（`core/controller.ts` & `core/router.ts`）

### 4.1 Controller 基类

- 静态属性与方法
  - `static __sugar_Controller = true`
  - `static isController(obj: any): obj is Controller`
  - `static isControllerClass(objClass: any): objClass is typeof Controller`
  - `static prefix?: string`
    - Controller 级路径前缀，最终通过 `router.prefix(prefix)` 实现。

- 实例属性
  - `context: ControllerContext`
    - 传入构造函数，用来访问当前请求上下文。
  - 私有路由元数据：`[ROUTES_KEY]: RouteConfig[]`
    - 仅通过路由装饰器写入和读取。

- `ControllerContext` 类型
  - 由以下交叉类型组成：
    - `Koa.Context`
    - `Router.RouterContext`
    - `{ app: Application }`
    - 以及额外的 `routerPath?: string` 等字段。

### 4.2 路由装饰器

- `create({ method, path })`
  - 仅当 `Controller.isController(target)` 为真时生效：
    - 确保 `target[ROUTES_KEY]` 存在并为数组。
    - 向其中推入 `{ key, method, path }`：
      - `key`: 函数名。
      - `method`: `'get' | 'post' | 'put' | 'del' | 'all'`。
      - `path`: `string | RegExp`。
  - **支持同一方法多次调用**：可为一个方法注册多条路由。

- 导出函数
  - `GetRoute(path)`
  - `PostRoute(path)`
  - `PutRoute(path)`
  - `DelRoute(path)`
  - `AllRoute(path)`
  - 均为 `create({ method: 'xxx', path })` 的语法糖。

- `appendControllerToRouter(ControllerClass: typeof Controller)`
  - 创建一个新的 `Router` 实例。
  - 从 `ControllerClass.prototype[ROUTES_KEY]` 读取路由列表：
    - 如存在：
      - 如有 `prefix`，调用 `router.prefix(prefix)`。
      - 遍历 `routes`，对每条记录：
        - 调用对应的 `router[method](path, async (ctx, next) => { ... })`：
          1. `const controller = new ControllerClass(ctx)`；
          2. 检查 `controller[key]` 是否为函数；
          3. `await controller[key].call(controller, next)`；
          4. 若返回值 `controllerReturn` 非 `undefined`，且 `ctx.res` 尚未结束：
             - 设置 `ctx.body = controllerReturn`；
          5. 捕获异常：
             - 若 `ctx.app.onError` 存在，调用之；
             - 否则重新抛出。
          6. `await next()`。
      - 通过 `logger.success` 打印路由注册信息。
  - 返回 `{ router }`。

### 4.3 子应用挂载（`appendApplication`）

- 签名：
  - `appendApplication(ApplicationClass: typeof Application)`

- 行为概要：
  1. `const application = new ApplicationClass();`
  2. `application.createApply();`
  3. 读取类级静态属性：`path`, `host`, `rewrite`。
  4. 构造一个 Koa 中间件 `routerMiddleware(ctx, next)`：
     - 解析 `req.url` 得到 `reqUrl`。
     - 按如下规则决定当前 Application 是否处理该请求：
       - 若 `path` 未配置，则 `current = false`；
       - 若 `path` 为字符串：`reqUrl.pathname` 必须以之为前缀；
       - 若 `path` 为 RegExp：`path.test(reqUrl.pathname)` 必须为真；
       - 若配置了 `host`：
         - 若 `host` 为字符串：要求 `req.headers.host === host`；
         - 若为对象：
           - 若有 `includes`：host 必须在 `includes` 列表内；
           - 若有 `excludes`：host 不得在 `excludes` 列表内。
     - 若 `current` 为 true：
       - 计算内部使用的 `routerPath`：
         - 若提供了 `rewrite`：调用 `rewrite(reqUrl, req)`；
         - 否则按 `path` 对原路径做前缀截取/替换；
         - 若结果为空字符串，将其规范化为 `'/'`。
       - 将 `routerPath` 写入 `(req as any).routerPath`，否则使用 `reqUrl.pathname`。
       - 调用 `await application.applyRequest(req, res)`。
     - finally：`await next()`。
  5. 返回 `{ application, routerMiddleware }`。

---

## 5. 参数获取装饰器规格（`core/parameter.ts`）

### 5.1 总体机制

- 依赖 `reflect-metadata`。
- 元数据键：`parameterGetterMetadataKey`。
- 一个方法上可以有多个参数装饰器，每个装饰器在元数据中注册一个 `ParameterGetter`：
  - `{ index: number; getter: (ctx: ControllerContext) => any | Promise<any> }`。
- `@parameter.getter` 是方法级装饰器：
  - 包装原方法，在实际调用前：
    1. 读取元数据中的 `ParameterGetter[]`；
    2. 逐个执行 `getter(ctx)`，按索引填充 `gotValues`；
    3. 调用原方法：`method.call(this, ...gotValues, ctx, ...args)`。
  - 约定：**经由 getter 包裹后，参数列表结构为：**
    - `[参数装饰器注入的值..., ctx, ...原始调用的剩余参数]`。

### 5.2 已实现的参数装饰器

所有参数装饰器均通过 `createParameterGetter(getterCallback)` 创建。核心装饰器包括：

- `config(configKey: string)`
  - 注入值：`ctx.app.config.get(configKey)`。
- `config`（无字符串参数版本）
  - 注入值：`ctx.app.config` 实例本身。
- `Response`
  - 注入值：`ctx.response`（Koa Response）。
- `NodeResponse`
  - 注入值：`ctx.res`（原生 Node `http.ServerResponse`）。
- `Request`
  - 注入值：`ctx.request`（Koa Request）。
- `NodeRequest`
  - 注入值：`ctx.req`（原生 Node `http.IncomingMessage`）。
- `Context`
  - 注入值：`ctx`（`ControllerContext`）。

- `query(key: string)`
  - 注入值：`ctx.query[key]`。
- `header(key: string)`
  - 注入值：`ctx.headers[key]`（不区分大小写，这里统一小写访问）。
- `params(key: string)`
  - 注入值：`ctx.params[key]`（依赖 `koa-router` 的路径参数）。

- `body(path?: string)`
  - 使用 `co-body` 自动识别内容类型解析 body。
  - 结果通过 `findDataByPath(parsedBodyJSON, path)` 提取子路径。
- `bodyJSON(path?: string)`
  - 使用 `parse.json(ctx.req)` 解析 JSON body，再用相同路径规则提取。
- `bodyFormData(path?: string)`
  - 使用 `parse.form(ctx.req)` 解析 formData，再用相同路径规则提取。
- `bodyText()`
  - 使用 `parse.text(ctx.req)` 解析纯文本 body。

- `cookie(...args: Parameters<ControllerContext['cookies']['get']>)`
  - 注入值：`ctx.cookies.get(...args)`。

### 5.3 解析缓存（性能考虑）

- 函数 `getParsedBody(ctx, parseFn)`：
  - 如 `ctx._parsedBodyJSON` 已存在，直接使用缓存；
  - 否则执行 `parseFn()`，将结果写入 `ctx._parsedBodyJSON` 并返回。

---

## 6. 参数校验装饰器规格（`core/validator.ts`）

### 6.1 总体机制

- 同样依赖 `reflect-metadata`。
- 元数据键：`parameterValidateMetadataKey`。
- 每个参数校验装饰器注册一个 `ParameterValidator`：
  - `{ index: number; validator: (value: any, parameterIndex: number | string, ctx: ControllerContext) => any | Promise<any> }`。
- 方法装饰器 `@validator.validate`：
  - 包裹原方法，执行顺序：
    1. 认为参数列表的**倒数第二个**是 `ctx`（由 `parameter.getter` 注入）。
    2. 读取元数据中的 `ParameterValidator[]`。
    3. 对每个 validator 调用 `validator(arguments[parameterIndex], parameterIndex, ctx)`。
    4. 全部校验通过后再调用原方法。
  - **与 parameter 协作约定**：
    - 同一方法上使用这两个装饰器时，顺序必须是：
      - `@parameter.getter` 在前，
      - `@validator.validate` 在后（确保「先获取再校验」）。

### 6.2 已实现的校验装饰器

- `required`
  - 校验逻辑：`if (!value) throw new SugarServerError(400, \`param [index] is required\`, { statusCode: 400 })`。
- `string`
  - 要求：`typeof value === 'string'`。
  - 否则抛出 `SugarServerError(400, \`param [index] ${value} not string\`, { statusCode: 400 })`。
- `number`
  - 要求：`typeof value === 'number'`。
  - 否则抛出 `SugarServerError(400, \`param [index] ${value} not number\`, { statusCode: 400 })`。
- `array(itemExtraCheck?: ValidateCallback | ParameterValidate)`
  - 要求：`Array.isArray(value)`。
  - 否则抛出 `SugarServerError(400, \`param [index] ${value} not array\`, { statusCode: 400 })`。
  - 若提供 `itemExtraCheck`：
    - 如果其本身是 `ParameterValidate`，则读取其 `.validateCallback`；
    - 否则视为普通 `ValidateCallback`；
    - 遍历数组每一项，调用 `itemValidateCallback(itemValue, \`\${parameterIndex}-\${i}\`, ctx)`。

- `validated(validators: ParameterValidate[])`
  - 允许在一个方法上对多个参数批量应用多种校验装饰器。
  - 本质上是对 `createParameterValidate` + `validate` 的语法糖组合。

---

## 7. Config 规格（`core/config.ts`）

### 7.1 目标

提供一个简单的「扁平化配置」容器，以 `a.b.c = value` 的方式访问原始嵌套配置结构。

### 7.2 行为

- `constructor()`
  - 初始化内部存储：`this._configs = {}`。

- `add(json: any)`
  - 空值直接返回。
  - 否则执行：`Object.assign(this._configs, this.flat(json));`

- `get(path: string): any`
  - 直接从 `this._configs[path]` 取值。
  - 注释中有一段未启用的「向下展开子路径」逻辑，目前不生效。

- `flat(json: any, path?: string)`
  - 深度优先扁平化对象：
    - 对于 value 是「非数组对象」时，递归展开并用 `parent.child` 拼接路径。
    - 对于其它值（基本类型或数组），直接赋值到结果对象对应的路径。

---

## 8. Module 装饰器规格（`core/module.ts`）

### 8.1 用途

通过类装饰器的方式，为某个 `Application` 类集中注册 Controllers / 子 Applications / 默认配置。

### 8.2 签名与行为

- `Module(options: { Controllers?: (typeof Controller)[]; Applications?: (typeof Application)[]; config?: any })`
  - 仅用于装饰继承自 `Application` 的类。
  - 行为：
    - 如有 `options.Controllers`：
      - `target.Controllers = [...target.Controllers, ...options.Controllers]`。
    - 如有 `options.Applications`：
      - `target.Applications = [...target.Applications, ...options.Applications]`。
    - 如有 `options.config`：
      - `target.defaultConfig = options.config`。

---

## 9. SugarServerError 规格（`core/error.ts`）

### 9.1 结构

- 继承自 `Error`。
- 字段：
  - `name = 'SugarServerError'`
  - `code: number` 业务错误码。
  - `statusCode?: number` 建议的 HTTP 状态码。

### 9.2 构造函数

- `constructor(code: number, message: string, { statusCode }: { statusCode?: number } = {})`
  - 调用 `super(message)`。
  - 设置 `this.code`、`this.statusCode`。

### 9.3 使用约定

- Controller 内可以直接：

```ts
throw new SugarServerError(401, '禁止访问', { statusCode: 401 });
```

- 该错误会在路由处理函数中被捕获，并传递给 `ctx.app.onError`：
  - 框架不直接决定 HTTP 响应格式；
  - 推荐在 `onError` 中统一设置：
    - `ctx.status = e.statusCode || 500;`
    - `ctx.body = { code: e.code, message: e.message }` 等。

---

## 10. 约定与扩展建议

1. **装饰器顺序约定**
   - 在 Controller 方法上使用参数/校验装饰器时：
     - 推荐顺序：`@router.*Route` → `@parameter.getter` → `@validator.validate` → 其它方法装饰器。
2. **Controller 无状态约定**
   - 同一个 Controller 实例只服务单个请求，不在实例字段上存放跨请求共享状态；
   - 共享状态建议放到：
     - `Application` 实例（通过 `ctx.app` 访问），或
     - 显式的单例模块。
3. **错误处理约定**
   - 业务层建议只抛 `SugarServerError` 或其子类；
   - `onError` 中负责把错误转换为统一的 HTTP 响应。
4. **配置约定**
   - 强烈建议所有可配置项集中放到 `defaultConfig` / `Module.config`；
   - 业务代码通过 `@parameter.config` 读取，避免直接依赖全局环境变量。

本规格文件主要用于对现有实现进行「行为描述」，不限制未来改动，但在进行破坏性改动时，建议对照本文件逐项确认并同步更新。

