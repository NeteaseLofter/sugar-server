## 配置文件
1. `sugar.project.ts`
2. `sugar.package.ts`
3. `sugar.build.ts`


#### sugar.project.ts 配置文件
```ts
import type {
  types
} from 'sugar-scripts';

// 待定
```


#### sugar.package.js 配置文件
```ts
import type {
  types
} from 'sugar-scripts';

export const packageConfig: types.PackageConfig;
```




#### sugar.build.js 配置文件
```ts
import type {
  types
} from 'sugar-scripts';

export const browserWebpackConfig: types.CustomWebpackConfig;

export const serverWebpackConfig: types.CustomWebpackConfig;
```


## sugar-scripts cli

### start
```bash
sugar-scripts start xxx.ts --port 9000
```

### info
```bash
sugar-scripts info
```

### build
```bash
sugar-scripts build
```


### cache
```bash
sugar-scripts cache
```


