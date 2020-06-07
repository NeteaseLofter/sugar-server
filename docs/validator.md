## 自带参数校验工具

再一次的装饰

### 使用方法

#### 加上校验装饰
使用有2步。

1. 在 controller 中已经绑定 router装饰的函数下面增加 `@validator.validate` 的装饰，开始自动校验功能；**注意：和parameter同时使用的话，需要放到parameter后面，先获取后校验**；
2. 在函数参数 前加 `@validator.required` 等装饰，将会在运行函数前，对参数进行校验；**如果校验不通过，会 `throw error`, 不会继续执行业务函数**；

##### 代码如下
```typescript
import {
  parameter
} from 'sugar-server';
...

@router.GetRoute('/')
@parameter.getter
@validator.validate
home (
  @parameter.query('name')
  @validator.required
  name: string
) {
  return `hello ${name}!`;
}

...
```

### 已经支持的校验工具
1. `required` 必填校验