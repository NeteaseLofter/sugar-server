## 多应用模式

改变的原因
最初的版本
```typescript
import {
  createServer
} from 'sugar-server';

createServer(
  {
    //...config
  },
  [
    {
      path: /^(\/ndp)?\/health/,
      application: healthApplication
    },
  ]
)
```
真的需要多这个概念吗？
使用 controller的聚合 可以吗？

controller的聚合 缺少的内容
```ts
{
  host: 'xxx.com'
  path: /^(\/ndp)?\/health/,
  application: healthApplication
},
```
根据 host 和 path 提前一步分配的能力
使用 ControllerGroup ? 还是直接使用 Application ?

新模式假象：
```ts

new Application({
  [], // middleware 忽略
  {
    c1: class MyController extends Controller {},
    a1: class MyApplication extends Application {
      host: 'xxx.com',
      path: /^(\/ndp)?\/health/,
      c
    }
  }
})
```
