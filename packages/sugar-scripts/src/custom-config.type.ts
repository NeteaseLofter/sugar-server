import type {
  ControllerContext
} from 'sugar-server';
import type WebpackChainConfig from 'webpack-chain';

import {
  SugarScriptsContext
} from './core/running-context'

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
  context: SugarScriptsContext
) => void;

export type CustomRender<C = any> = (
  ctx: ControllerContext,
  entries: string[] | {[key: string]: string[]},
  custom: C
) => string;
