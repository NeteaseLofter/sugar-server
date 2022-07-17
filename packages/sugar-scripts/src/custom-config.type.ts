import type {
  ControllerContext
} from 'sugar-server';
import type WebpackChainConfig from 'webpack-chain';

export namespace SugarScriptsProject {
  export type BrowserWebpackConfig = CustomWebpackConfig;

  export type ServerWebpackConfig = CustomWebpackConfig;

  export interface PackageConfig {
    browser?: {
      /**
       * 是否构建dll用的输出
       */
      dll?: boolean;
      /**
       * 输出目录
       */
      output: string;
      /**
       * controller/index
       */
      input?: string;
      entry?: BuildEntry
    };

    server?: {
      dll?: boolean;
      output: string;
      entry: string;
      render?: string;
    };
  }

  export interface ProjectConfig {
    cacheDir: string;
  }


  export interface CustomRender<C = any> {
    (
      ctx: ControllerContext,
      entries: string[] | {[key: string]: string[]},
      custom: C
    ): string
  };
}

type BuildEntry = { [key: string]: string|string[] };

export type CustomWebpackConfig = (
  webpackChainConfig: WebpackChainConfig,
  projectConfig: BuildConfig
) => void;

export interface WebpackConfig {
  root: string;
  entry: BuildEntry;
  output: string;
  rootHash: string;
}

export type CustomRender<C = any> = (
  ctx: ControllerContext,
  entries: string[] | {[key: string]: string[]},
  custom: C
) => string;



export interface BuildOptions extends SugarScriptsProject.PackageConfig {
  packageName: string;
  root: string;
}

export interface BuildConfig extends BuildOptions {
  rootHash: string;
}

export type BuildConfigForBrowser = BuildConfig & Required<Pick<BuildConfig, 'browser'>>;

export type BuildConfigForBrowserEntry = BuildConfigForBrowser & {
  browser: BuildConfigForBrowser['browser'] & Required<Pick<BuildConfigForBrowser['browser'], 'entry'>>
};

export type BuildConfigForServer = BuildConfig & Required<Pick<BuildConfig, 'server'>>;
