# sugar-server
[![](https://img.shields.io/travis/huey-LS/sugar-server.svg)](https://travis-ci.org/huey-LS/sugar-server)
[![npm version](https://img.shields.io/npm/v/sugar-server.svg?maxAge=3600)](https://www.npmjs.org/package/sugar-server)
[![npm download](https://img.shields.io/npm/dm/sugar-server.svg?maxAge=3600)](https://www.npmjs.org/package/sugar-server)

**用sugar吧，给你的代码加点甜度**

node服务端框架，基于`koa`但是略有不同。

**sugar-server** 特点
1. 基于装饰器的路由设置、请求参数获取、格式校验工具，不再入侵的你代码，配置和阅读代码更加容易；
2. 简单易用的config配置，支持多环境分离配置内容；
3. 支持 **async/await**；
4. 允许无**ctx**创建**Controller**，函数处理更纯粹；
5. **createServer** 下支持的多应用分离模式，monorepo的好伙伴；

## 更多文档
* [SugarServer介绍](README.md)
* [快速开始](./docs/guide.md)
* [~~路由~~Controller配置指南](./docs/controller.md)
* [参数获取指南](./docs/parameter.md)
* [自带参数校验](./docs/validator.md)
* [应用创建指南](./docs/application.md)
* [config配置指南](./docs/config.md)


