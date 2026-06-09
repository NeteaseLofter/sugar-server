---
"sugar-scripts": patch
---

fix(sugar-scripts): 修复 Rspack 模式下 externalHelpers 和 DefinePlugin 兼容性问题

- `webpack.server.ts` 中根据 `context.packageConfig.bundler` 动态选择 `webpack.DefinePlugin` 或 `rspack.DefinePlugin`，避免在 rspack 模式下使用 webpack DefinePlugin 报错
- `rspack.common.ts` 中 `externalHelpers` 设为 false，避免需要额外安装 `@swc/helpers` 包
