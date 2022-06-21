/// <reference path="../typings.d.ts" />
import path from 'path';
import webpack from 'webpack';

import { BuildConfigForBrowserEntry } from '../custom-config.type';
import {
  dllManifestDirPath
} from '../core/cache';
import {
  loadCustomConfig,
  createCommonChainConfig,
  createDllReferences
} from './webpack.common';
import {
  SUGAR_BUILD_EXPORT_BROWSER
} from '../constants'


export async function createBrowserConfig (
  config: BuildConfigForBrowserEntry
): Promise<webpack.Configuration> {
  const chainConfig = await createCommonChainConfig({
    root: config.root,
    entry: config.browser.entry,
    output: config.browser.output,
    rootHash: config.rootHash
  });

  chainConfig.merge({
    plugin: [
      ...(await createDllReferences({
        root: config.root,
        entry: config.browser.entry,
        output: config.browser.output,
        rootHash: config.rootHash
      })),
    ]
  });

  if (config.browser.dll) {
    chainConfig.output
      .library(`${config.rootHash}_[name]`)
      .libraryTarget('umd');

    chainConfig.plugin('DllPlugin')
      .use(
        webpack.DllPlugin,
        [{
          context: config.root,
          name: `${config.rootHash}_[name]`,
          path: path.resolve(dllManifestDirPath, config.rootHash, './[name]/dll.modules.manifest.json'),
          format: true
        }]
      );
  }

  await loadCustomConfig(
    chainConfig,
    config,
    SUGAR_BUILD_EXPORT_BROWSER
  );

  return chainConfig.toConfig();
}
