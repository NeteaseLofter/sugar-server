/// <reference path="../typings.d.ts" />
import path from 'path';
import webpack from 'webpack';

import { BuildConfigForServer } from '../custom-config.type';
import {
  loadBaseManifest
} from './load-manifest';
import {
  baseManifestDirPath
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
    baseManifestDirPath,
    config.rootHash
  );
  const chainConfig = await createCommonChainConfig({
    root: config.root,
    entry: {
      app: [
        config.server.entry,
        config.server.render || ''
      ]
    },
    output: config.server.output,
    rootHash: config.rootHash
  });

  chainConfig.merge({
    target: 'node',
    output: {
      filename: '[name].js',
    },
    plugin: {
      'DefinePlugin': {
        plugin: webpack.DefinePlugin,
        args: [{
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
