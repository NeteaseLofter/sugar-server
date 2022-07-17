import path from 'path';
import webpack from 'webpack';
import WebpackChainConfig from 'webpack-chain';

import { BuildConfig } from '../custom-config.type';
import {
  loadAllDllModulesManifest
} from './load-manifest';
import {
  getCacheDirPath
} from '../core/cache';
import {
  DllDependenciesManifestPlugin
} from './dll-dependencies-manifest-plugin'
import type {
  WebpackConfig,
  CustomWebpackConfig
} from '../custom-config.type';
import {
  SUGAR_PACKAGE_CONFIG_FILENAME
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
  let chainConfig = new WebpackChainConfig();

  const configEntry = config.entry;

  const normalizeEntry = (entryPath: string) => {
    return path.resolve(config.root, entryPath);
    // if (!entryPath.startsWith('.')) {
    //   return entryPath;
    // }
    // return glob.sync(entryPath, { root: config.root });
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
    stats: true,
    module: {
      rule: {
        script: {
          test: /\.(ts|tsx|js|jsx)$/,
          use: {
            'ts-loader': {
              loader: 'ts-loader',
              options: {
                transpileOnly: true
              }
              // options: babelConfig
            }
          }
        }
      },
    },
    plugin: {
      'ProgressPlugin': {
        plugin: webpack.ProgressPlugin,
        args: []
      }
    }
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
        SUGAR_PACKAGE_CONFIG_FILENAME
      )
    )[customFnName];
  } catch(e) {}
  if (custom) {
    await custom(chainConfig, config);
  }
}


export async function mergeDllReferences (
  chainConfig: WebpackChainConfig,
  config: WebpackConfig
) {
  const dllModules = await loadAllDllModulesManifest(
    getCacheDirPath(),
    config.rootHash
  );

  const dllAssets = dllModules.reduce((dllAssets, dllModule) => {
    dllAssets[dllModule.moduleName] = dllModule.assets;
    return dllAssets;
  }, {} as {
    [dllName: string]: string[];
  })

  dllModules.forEach((
    module
  ) => {
    chainConfig.plugin(module.moduleName)
      .use(
        webpack.DllReferencePlugin,
        [{
          context: module.context,
          manifest: module.manifest
        }]
      );
  })

  chainConfig.plugin('DllDependenciesManifestPlugin')
    .use(
      DllDependenciesManifestPlugin,
      [{
        dllAssets,
        fileName: path.resolve(
          getCacheDirPath(),
          config.rootHash,
          './manifest.json'
        ),
        generate: (entries: any) => {
          return {
            context: config.root,
            entries
          };
        }
      }]
    );
}
