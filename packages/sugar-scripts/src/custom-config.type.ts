import type {
  Controller
} from 'sugar-server';
import type WebpackChainConfig from 'webpack-chain';

import {
  SugarScriptsContext
} from './core/running-context'

type ControllerContext = Controller["context"];

export namespace SugarScriptsProject {
  export type BrowserWebpackConfig = CustomWebpackConfig;

  export type ServerWebpackConfig = CustomWebpackConfig;

  export interface PackageConfig {
    /**
     * 用于存放打包过程中的一些缓存和过渡产物
     * 相对于当前sugar.config的路径
     * 默认使用 './sugar-cache'
     */
    cacheDir?: string;
    /**
     * 浏览器端js输出目录，不配置就不会进行相关打包
     */
    browser?: {
      /**
       * 输出目录，必填
       */
      output: string;
      /**
       * 额外入口配置，可以不用
       */
      entry?: BuildEntry
    };

    /**
     * node server端输出目录，不配置就不会进行相关打包
     */
    server?: {
      /**
       * 输出目录，必填
       */
      output: string;
      /**
       * node的启动文件
       */
      entry: string;
      /**
       * 自动注入的render文件
       * 为sugar-server-utils 提供的自动render
       */
      render?: string;
    };
  }

  export type SugarPackageConfigs = {
    packageConfig: PackageConfig;
    browserWebpackConfig?: BrowserWebpackConfig;
    serverWebpackConfig?: ServerWebpackConfig;
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
  context: SugarScriptsContext
) => void;

export type CustomRender<C = any> = (
  ctx: ControllerContext,
  entries: string[] | {[key: string]: string[]},
  custom: C
) => string;

