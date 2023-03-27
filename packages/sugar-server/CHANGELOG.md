# sugar-server

## 1.0.0-beta.5

### Patch Changes

- 0665b6d: create-sugar-app 脚手架初步完成，提交 2 个基础的模版

## 1.0.0-beta.4

### Patch Changes

- dce3422: 整合 sugar-scripts 配置，整理为单一 sugar.config 文件。修改自动注册用函数名字。修改相关文档
- 5ab761a: 整合 sugar.project 和 sugar.package 为同一个配置文件,即 sugar.config

## 1.0.0-beta.3

### Patch Changes

- 更新少量 logger 及更新 browser import 标记内容

## 1.0.0-beta.2

### Patch Changes

- 默认使用 ts-loader 作为代码编译工具

## 1.0.0-beta.1

### Major Changes

- 3acbd3b: 重构 sugar-server 的 application 和 controller，sugar-scripts 项目脚手架，sugar-server-utils 提供额外的工具

## 0.2.0-beta.0

### Minor Changes

- sugar-scripts 添加统一 running-context，命令都基于此运行

### Patch Changes

- 5101c4b: 添加 sugar-scripts，改造为基于 pnpm 的 monorepo
  sugar-server 移除 server，整合为 application

## 0.1.15

### Patch Changes

- 5b876ff: server 上的配置自动同步到 app 上，并添加前缀 sugarServer
