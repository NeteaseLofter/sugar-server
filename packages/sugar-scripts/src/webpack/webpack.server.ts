import path from 'path';
import webpack from 'webpack';
import WebpackChainConfig from 'webpack-chain';

import {
  SugarScriptsContext
} from '../core/running-context';

import {
  SugarServerBrowserEntryPlugin,
  getCacheFilePath
} from './server-browser-entry';

export async function mergeServerEntry (
  context: SugarScriptsContext,
  chainConfig: WebpackChainConfig
) {
  if (!context.packageConfig.server) return;
  const serverConfig = context.packageConfig.server;

  chainConfig.entry('main')
    .merge(
      [
        serverConfig.render || '',
        serverConfig.entry
      ].filter((path) => !!path) as string[]
    );

  chainConfig.merge({
      target: 'node',
      output: {
        filename: '[name].js',
        library: {
          type: 'commonjs',
        }
      },
      externalsPresets: { node: true },
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
        'SugarServerBrowserEntryPlugin': {
          plugin: SugarServerBrowserEntryPlugin,
          args: [{
            root: context.root,
            output: getCacheFilePath(context)
          }]
        },
        'DefinePlugin': {
          plugin: webpack.DefinePlugin,
          args: [{
            'process.env.SUGAR_PROJECT_RUN': JSON.stringify(true),
            'process.env.SUGAR_PROJECT_RENDER': JSON.stringify(
              serverConfig.render
              && path.resolve(
                context.root,
                serverConfig.render
              )
            ),
            'process.env.SUGAR_PROJECT_ENTRIES': `require('./browser-manifest.json')`
          }]
        }
      }
    })
}

export async function mergeServerCustomConfig (
  context: SugarScriptsContext,
  chainConfig: WebpackChainConfig
) {
  if (context.projectConfigs.serverWebpackConfig) {
    await context.projectConfigs.serverWebpackConfig(
      chainConfig,
      context
    )
  }

  if (context.packageConfigs.serverWebpackConfig) {
    await context.packageConfigs.serverWebpackConfig(
      chainConfig,
      context
    )
  }
}
