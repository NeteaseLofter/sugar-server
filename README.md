# sugar-server
[![](https://img.shields.io/travis/huey-LS/sugar-server.svg)](https://travis-ci.org/huey-LS/sugar-server)
[![npm version](https://img.shields.io/npm/v/sugar-server.svg?maxAge=3600)](https://www.npmjs.org/package/sugar-server)
[![npm download](https://img.shields.io/npm/dm/sugar-server.svg?maxAge=3600)](https://www.npmjs.org/package/sugar-server)

sugar-server以`koa`为基础，实现的基于装饰器风格的服务端框架。
现在通过sugar-scripts脚手架的配置，整合了浏览器JS的构建流程，更适合全栈开发使用。

> 由于sugar-server基于TypeScript开发，所以装饰器目前还是较早版本，后续会持续关注TypeScript5的进度。[TypeScript5](https://devblogs.microsoft.com/typescript/announcing-typescript-5-0-beta/)支持最新的ES标准下的[装饰器](https://github.com/tc39/proposal-decorators)。我们会在TypeScript5 release后尽快进行升级，到时候可能不再向下兼容。

## 快速搭建项目
```bash
npx create-sugar-app my-app
cd my-app
npm run dev
```


## 使用例子
- [基础模版](../templates/base);
- [使用react模版](../templates/react);
- [使用react和less模版](../templates/react-less);

以上例子都可以运行，安装到本地
```bash
npx create-sugar-app my-app
```

## 更多详细使用文档
- [sugar-server使用文档](./packages/sugar-server/)
- [sugar-server-utils使用文档](./packages/sugar-server-utils/)
- [sugar-scripts使用文档](./packages/sugar-scripts/)
