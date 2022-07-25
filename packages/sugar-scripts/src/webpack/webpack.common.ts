import path from 'path';
import webpack from 'webpack';
import WebpackChainConfig from 'webpack-chain';

import {
  loadAllDllModulesManifest
} from './load-manifest';
import {
  SugarScriptsContext
} from '../core/running-context';
import {
  DllDependenciesManifestPlugin
} from './dll-dependencies-manifest-plugin'
import {
  SUGAR_PACKAGE_CONFIG_FILENAME
} from '../constants'

// const mode = process.env.NODE_ENV === 'development' ? 'development' : 'production';
const mode = 'development';

/**
 * common 是创建基础的webpack配置项，基于webpack-chain
 * 用于被 webpack.dll 、webpack.frontend、webpack.server扩展
 */

export async function createCommonChainConfig (
  context: SugarScriptsContext,
  output: string
): Promise<WebpackChainConfig> {
  let chainConfig = new WebpackChainConfig();

  chainConfig.merge({
    context: context.root,
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.css', '.svg', '.png', '.jpg', '.gif'],
    },
    output: {
      path: path.resolve(
        context.root,
        output || 'dist'
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
  context: SugarScriptsContext,
  chainConfig: WebpackChainConfig,
  customFnName: string
) {
  let custom: any;
  try {
    custom = require(
      path.resolve(
        context.root,
        SUGAR_PACKAGE_CONFIG_FILENAME
      )
    )[customFnName];
  } catch(e) {}
  if (custom) {
    await custom(chainConfig, context);
  }
}


export async function mergeDllReferences (
  context: SugarScriptsContext,
  chainConfig: WebpackChainConfig,
) {
  const dllModules = await loadAllDllModulesManifest(
    context.getCacheDir(),
    context.rootHash
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
          context.getCacheDir(),
          context.rootHash,
          './manifest.json'
        ),
        generate: (entries: any) => {
          return {
            context: context.root,
            entries
          };
        }
      }]
    );
}
