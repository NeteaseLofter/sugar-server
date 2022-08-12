import path from 'path';
import webpack from 'webpack';
import WebpackChainConfig from 'webpack-chain';

import {
  loadBaseManifest
} from './load-manifest';
import {
  SugarScriptsContext
} from '../core/running-context';

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
        serverConfig.entry,
        path.resolve(__dirname, 'auto-entries.ts')
      ].filter((path) => !!path) as string[]
    );
  chainConfig.entry('main-auto')
    .merge(
      [
        serverConfig.render || '',
        serverConfig.entry,
        path.resolve(__dirname, 'auto-run.ts')
      ].filter((path) => !!path) as string[]
    );

    const manifest = await loadBaseManifest(
      context.getCacheDir(),
      context.rootHash
    );

  chainConfig.merge({
      target: 'node',
      output: {
        filename: '[name].js',
        library: {
          // name: 'main',
          type: 'commonjs',
          // export: 'default',
        }
      },
      resolve: {
        mainFields: [
          'sugar-scripts-main',
          'main'
        ]
      },
      externalsPresets: { node: true },
      externals: serverConfig.dll ? function ({ context, request }: any, callback: any) {
        if (/^[^./]{1}/.test(request)) {
          // Externalize to a commonjs module using the request path
          return callback(null, request, 'commonjs');
        }
        callback();
      }: undefined,
      plugin: {
        'DefinePlugin': {
          plugin: webpack.DefinePlugin,
          args: [{
            'process.env.SUGAR_PROJECT_REAL_ENTRY': JSON.stringify(
              path.resolve(
                context.root,
                serverConfig.entry
              )
            ),
            'process.env.SUGAR_PROJECT_RUN': JSON.stringify(true),
            'process.env.SUGAR_PROJECT_CONTEXT': JSON.stringify(manifest.context),
            'process.env.SUGAR_PROJECT_RENDER': JSON.stringify(
              serverConfig.render
              && path.resolve(
                context.root,
                serverConfig.render
              )
            ),
            'process.env.SUGAR_PROJECT_ENTRIES': JSON.stringify(manifest.entries),
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
