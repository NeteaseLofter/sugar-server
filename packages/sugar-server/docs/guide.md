## 快速开始

本文是为了帮助你一步步快速地搭建一个 **sugar-server** 应用。
如果你只有 1 年左右前端经验，也可以按照这里的步骤快速跑通。

---

### 推荐的最快开始方式：使用 `create-sugar-app`

对于新项目，推荐使用官方脚手架 **`create-sugar-app`** 一键初始化工程，它会帮你：

- 创建基础目录结构（包含 `server` / `browser` 等）
- 配好 `tsconfig.json` / 构建配置
- 安装依赖

#### 1. 全局安装（或使用 npx）

```bash
npm install -g create-sugar-app
# 或者不全局安装，使用 npx
npx create-sugar-app my-sugar-app
```

执行完成后，会提示你选择：

- **template**：`base` 或 `react`（推荐前端同学选 `react`）
- **packageManager**：`pnpm` 或 `npm`

根据提示选择后，会在当前目录下生成 `my-sugar-app` 项目，并自动执行依赖安装。

#### 2. 查看项目结构

生成后的项目会大致包含：

- `server/`：基于 `sugar-server` 的服务端代码
- `browser/`：浏览器端代码（如果选择了 `react` 模板）
- `sugar.config.ts`：`sugar-scripts` 的项目配置
- 以及已经配置好的 `tsconfig.json` 等

你可以直接进入项目目录，按照 README 或下面文档继续开发。

> 如果你更希望从「完全空白」开始自己搭，也可以参考下面的手动配置步骤。

---

### 环境准备（手动搭建时需要关注）

- **运行环境**: Node.js（推荐较新的 LTS 版本）
- **TypeScript**:
  需要在 `tsconfig.json` 中设置 [`experimentalDecorators: true`](https://www.typescriptlang.org/docs/handbook/decorators.html) 开启装饰器支持。
- **Babel**（如果使用 Babel 编译）：
  - 需要添加 [`@babel/plugin-proposal-decorators`](https://babeljs.io/docs/en/babel-plugin-proposal-decorators) 插件开启装饰器；
  - 还需要 [`babel-plugin-parameter-decorator`](https://www.npmjs.com/package/babel-plugin-parameter-decorator) 插件来支持**参数装饰器**。

#### 关于参数装饰器

参考：https://github.com/tc39/proposal-decorators#could-we-support-decorating-objects-parameters-blocks-functions-etc

TC39 目前尚未正式标准化参数装饰器，但 TypeScript 已经提前实现，sugar-server 也基于这一实现来提供参数装饰能力。

---

## 逐步搭建（手动最小示例）

### 1. 安装 sugar-server

```bash
npm i --save sugar-server
```

或者使用 `pnpm` / `yarn`：

```bash
pnpm add sugar-server
# 或
yarn add sugar-server
```

### 2. 编写一个 Controller

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

### 3. 创建并启动 Application

```typescript
import {
  Application
} from 'sugar-server';

import { HelloWorldController } from './hello-world-controller';

class App extends Application {
  static Controllers = [
    HelloWorldController
  ];
}

const app = new App();

app.listen(9000);
```

### 4. 启动与访问服务

如果你使用 TypeScript，推荐最简单的方式是直接用 `ts-node`（或 `tsx`）运行：

```bash
npx ts-node src/app.ts
# 或
npx tsx src/app.ts
```

然后在浏览器中访问 `http://127.0.0.1:9000`，就可以看到一个 `hello World!` 了。

> 如果你更熟悉传统流程，也可以先用 `tsc` 编译到 `dist/` 再用 `node dist/app.js` 启动。

---

接下来可以继续阅读：

- [Controller 配置指南](./controller.md)
- [参数获取指南](./parameter.md)
- [自带参数校验](./validator.md)
- [应用创建指南](./application.md)
- [config 配置指南](./config.md)
