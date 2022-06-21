import path from 'path';
import webpack from 'webpack';
import WebpackChainConfig from 'webpack-chain';
import glob from 'glob';

import { BuildConfig } from '../custom-config.type';
import { babelConfig } from '../configs/babel.static.config';
import {
  loadAllDllModulesManifest
} from './load-manifest';
import {
  dllManifestDirPath,
  baseManifestDirPath
} from '../core/cache';
import {
  DllDependenciesManifestPlugin
} from './dll-dependencies-manifest-plugin'
import type {
  WebpackConfig,
  CustomWebpackConfig
} from '../custom-config.type';
import {
  SUGAR_BUILD_CONFIG_FILENAME
} from '../constants'

// const mode = process.env.NODE_ENV === 'development' ? 'development' : 'production';
const mode = 'development';

export {
  WebpackConfig
}

/**
 * common 是创建基础的webpack配置项，基于webpack-chain
 * 用于被 webpack.dll 、webpack.frontend、webpack.server扩展
 */

export async function createCommonChainConfig (
  config: WebpackConfig
): Promise<WebpackChainConfig> {
  const chainConfig = new WebpackChainConfig();

  const configEntry = config.entry;

  const normalizeEntry = (entryPath: string) => {
    if (!entryPath.startsWith('.')) {
      return entryPath;
    }
    return glob.sync(entryPath, { root: config.root });
  }
  const entry = Object.keys(configEntry)
    .reduce((currentEntry, entryKey) => {
      const entryPath = configEntry[entryKey];
      if (typeof entryPath === 'string') {
        currentEntry[entryKey] = normalizeEntry(entryPath)
      } else {
        currentEntry[entryKey] = ([] as string[]).concat(...entryPath.map(normalizeEntry))
      }
      return currentEntry;
    }, {} as typeof configEntry);

  chainConfig.merge({
    context: config.root,
    entry: entry,
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.css', '.svg', '.png', '.jpg', '.gif'],
    },
    output: {
      path: path.resolve(
        config.root,
        config.output || 'dist'
      ),
      filename:
        mode === 'development'
          ? '[name].js'
          : '[name].[contenthash].js'
    },
    mode,
    optimization: {
      moduleIds: 'named',
      chunkIds: 'named'
    },
    stats: {
      errorDetails: true
    },
    module: {
      rule: {
        script: {
          test: /\.(ts|tsx|js|jsx)$/,
          use: {
            'babel': {
              loader: 'babel-loader',
              options: babelConfig
            }
          }
        }
      },
    },
    plugin: []
  })

  return chainConfig;
}

export async function loadCustomConfig (
  chainConfig: WebpackChainConfig,
  config: BuildConfig,
  customFnName: string
) {
  let custom: CustomWebpackConfig | undefined;
  try {
    custom = require(
      path.resolve(
        config.root,
        config.webpackConfig || SUGAR_BUILD_CONFIG_FILENAME
      )
    )[customFnName];
  } catch(e) {}
  if (custom) {
    await custom(chainConfig, config);
  }
}


export async function createDllReferences (
  config: WebpackConfig
) {
  const dllModules = await loadAllDllModulesManifest(
    dllManifestDirPath,
    config.rootHash
  );

  const dllAssets = dllModules.reduce((dllAssets, dllModule) => {
    dllAssets[dllModule.moduleName] = dllModule.assets;
    return dllAssets;
  }, {} as {
    [dllName: string]: string[];
  })

  return {
    ...(
      dllModules.reduce((
        dllPlugins,
        module
      ) => {
        dllPlugins[module.moduleName] = {
          plugin: webpack.DllReferencePlugin,
          args: [{
            context: module.context,
            manifest: module.manifest
          }]
        };
        return dllPlugins;
      }, {} as any)
    ),
    'DllDependenciesManifestPlugin': {
      plugin: DllDependenciesManifestPlugin,
      args: [
        {
          dllAssets,
          fileName: path.resolve(
            baseManifestDirPath,
            config.rootHash,
            './manifest.json'
          ),
          generate: (entries: any) => {
            return {
              context: config.root,
              entries
            };
          }
        }
      ]
    }
  }
}
