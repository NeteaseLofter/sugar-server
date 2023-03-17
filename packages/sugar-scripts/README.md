# sugar-scripts


## 自动配置
```ts
import HomePageView from 'sugar?browser-entry/../../browser/home';
```

## 配置文件
`sugar.config.ts` 项目说明文件，放于项目根目录，一般和package.json同级


#### sugar.config.ts 配置文件详细说明

sugar.config.ts按需导出3个配置内容
1. `packageConfig`
2. `browserWebpackConfig`
3. `serverWebpackConfig`


##### packageConfig
```ts
import {
  SugarScriptsProject
} from 'sugar-scripts';

export const projectConfig: SugarScriptsProject.PackageConfig = {
    /**
     * 用于存放打包过程中的一些缓存和过渡产物
     * 相对于当前sugar.config的路径
     * 默认使用 './sugar-cache'
     */
    cacheDir: './sugar-cache',
    browser?: {
      /**
       * 输出目录
       */
      output: string;
      // exposes?: string[] | {[index: string]: string},
      entry?: BuildEntry
    };

    server?: {
      // dll?: boolean;
      output: string;
      entry: string;
      render?: string;
    };
}
```
