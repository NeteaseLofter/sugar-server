/// <reference path="../typings.d.ts" />
import path from 'path';
import webpack from 'webpack';

import { BuildConfigForServer } from '../custom-config.type';
import {
  loadBaseManifest
} from './load-manifest';
import {
  getCacheDirPath
} from '../core/cache';
import {
  loadCustomConfig,
  createCommonChainConfig
} from './webpack.common';
import {
  SUGAR_BUILD_EXPORT_SERVER
} from '../constants'

export async function createServerConfig (
  config: BuildConfigForServer
): Promise<webpack.Configuration> {
  const manifest = await loadBaseManifest(
    getCacheDirPath(),
    config.rootHash
  );
  console.log('load manifest', manifest)
  const webpackConfig = {
    root: config.root,
    entry: {
      main: [,
        config.server.render || '',
        config.server.entry,
        path.resolve(__dirname, 'auto-entries.ts')
      ].filter((path) => !!path) as string[]
    },
    output: config.server.output,
    rootHash: config.rootHash
  };

  const chainConfig = await createCommonChainConfig(webpackConfig);

  console.log(
    'createServerConfig manifest',
    manifest
  )

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
    externals: config.server.dll ? function ({ context, request }: any, callback: any) {
      console.log(request, context);
      if (/^[^./]{1}/.test(request)) {
        console.log('commonjs', request)
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
            path.resolve(config.root, config.server.entry)
          ),
          'process.env.SUGAR_PROJECT_RUN': JSON.stringify(true),
          'process.env.SUGAR_PROJECT_CONTEXT': JSON.stringify(manifest.context),
          'process.env.SUGAR_PROJECT_RENDER': JSON.stringify(
            config.server.render
            && path.resolve(config.root, config.server.render)
          ),
          'process.env.SUGAR_PROJECT_ENTRIES': JSON.stringify(manifest.entries),
        }]
      }
    }
  })

  await loadCustomConfig(
    chainConfig,
    config,
    SUGAR_BUILD_EXPORT_SERVER
  );

  return chainConfig.toConfig();
}
