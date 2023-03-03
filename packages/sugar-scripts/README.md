# sugar-scripts


## 配置文件
`sugar.config.ts` 项目说明文件，放于项目根目录和一般和package.json同级




#### sugar.project.ts 配置文件
```ts
export const projectConfig = {
  /**
   * 当前项目的缓存目录，建议添加到.gitignore中
  */
  cacheDir: './.sugar-cache'
}
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


