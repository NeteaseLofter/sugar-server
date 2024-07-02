# sugar-scripts

## 1.0.1-beta.0

### Patch Changes

- d230dc55fe4e1b473346db5daf3c1edcf4a2ca76: 支持 windows 下 entryKey 的生成规则

## 1.0.0

### Major Changes

- 3acbd3b: 重构 sugar-server 的 application 和 controller，sugar-scripts 项目脚手架，sugar-server-utils 提供额外的工具

### Minor Changes

- 17469dc: sugar-scripts 添加统一 running-context，命令都基于此运行

### Patch Changes

- c1f47fc: 支持生成 css 文件到 html
- dce3422: 整合 sugar-scripts 配置，整理为单一 sugar.config 文件。修改自动注册用函数名字。修改相关文档
- 410b540: 更新少量 logger 及更新 browser import 标记内容
- ff46c94: 修复 sugar.package 找不到的问题
- 905a391: 更新 sugar-scripts 依赖项
- 5ab761a: 整合 sugar.project 和 sugar.package 为同一个配置文件,即 sugar.config
- 997c524: 默认使用 ts-loader 作为代码编译工具
- 5101c4b: 添加 sugar-scripts，改造为基于 pnpm 的 monorepo
  sugar-server 移除 server，整合为 application
- 2ea1c37: 新增 sugar-scripts dev 本地开发命令，通过 nodemon 实现自动重启
- 0665b6d: create-sugar-app 脚手架初步完成，提交 2 个基础的模版
- Updated dependencies [dce3422]
- Updated dependencies [410b540]
- Updated dependencies [5ab761a]
- Updated dependencies [997c524]
- Updated dependencies [17469dc]
- Updated dependencies [5101c4b]
- Updated dependencies [3acbd3b]
- Updated dependencies [0665b6d]
  - sugar-server@1.0.0

## 1.0.0-beta.9

### Patch Changes

- c1f47fc: 支持生成 css 文件到 html

## 1.0.0-beta.8

### Patch Changes

- 0665b6d: create-sugar-app 脚手架初步完成，提交 2 个基础的模版
- Updated dependencies [0665b6d]
  - sugar-server@1.0.0-beta.5

## 1.0.0-beta.7

### Patch Changes

- dce3422: 整合 sugar-scripts 配置，整理为单一 sugar.config 文件。修改自动注册用函数名字。修改相关文档
- 5ab761a: 整合 sugar.project 和 sugar.package 为同一个配置文件,即 sugar.config
- Updated dependencies [dce3422]
- Updated dependencies [5ab761a]
  - sugar-server@1.0.0-beta.4

## 1.0.0-beta.6

### Patch Changes

- 2ea1c37: 新增 sugar-scripts dev 本地开发命令，通过 nodemon 实现自动重启

## 1.0.0-beta.5

### Patch Changes

- 更新少量 logger 及更新 browser import 标记内容
- Updated dependencies
  - sugar-server@1.0.0-beta.3

## 1.0.0-beta.4

### Patch Changes

- ff46c94: 修复 sugar.package 找不到的问题

## 1.0.0-beta.3

### Patch Changes

- 905a391: 更新 sugar-scripts 依赖项

## 1.0.0-beta.2

### Patch Changes

- 默认使用 ts-loader 作为代码编译工具
- Updated dependencies
  - sugar-server@1.0.0-beta.2

## 1.0.0-beta.1

### Major Changes

- 3acbd3b: 重构 sugar-server 的 application 和 controller，sugar-scripts 项目脚手架，sugar-server-utils 提供额外的工具

### Patch Changes

- Updated dependencies [3acbd3b]
  - sugar-server@1.0.0-beta.1

## 0.2.0-beta.0

### Minor Changes

- sugar-scripts 添加统一 running-context，命令都基于此运行

### Patch Changes

- 5101c4b: 添加 sugar-scripts，改造为基于 pnpm 的 monorepo
  sugar-server 移除 server，整合为 application
- Updated dependencies
- Updated dependencies [5101c4b]
  - sugar-scripts@0.2.0-beta.0
  - sugar-server@0.2.0-beta.0

## 1.0.1

### Patch Changes

- 5101c4b: 添加 sugar-scripts，改造为基于 pnpm 的 monorepo
  sugar-server 移除 server，整合为 application
- Updated dependencies [5101c4b]
  - sugar-scripts@1.0.1
  - sugar-server@0.1.16
