import type {
  ControllerContext
} from 'sugar-server';
import type WebpackChainConfig from 'webpack-chain';

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
    output: string;
    entry: string;
    render?: string;
  };

  webpackConfig?: string;
  projectConfig?: string;
}


export interface BuildOptions extends PackageConfig {
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
