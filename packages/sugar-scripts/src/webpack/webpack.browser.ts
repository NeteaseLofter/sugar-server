import path from 'path';
import webpack from 'webpack';
import WebpackChainConfig from 'webpack-chain';

import {
  SugarScriptsContext
} from '../core/running-context';
import {
  getEntriesFromApplicationClass
} from '../core/entry';

import {
  loadCustomConfig
} from './webpack.common';
import {
  SUGAR_BUILD_EXPORT_BROWSER
} from '../constants'


export async function mergeBrowserEntryFromServer(
  context: SugarScriptsContext,
  chainConfig: WebpackChainConfig
) {
  if (!context.packageConfig.browser) return;
  const browserConfig = context.packageConfig.browser;

  if (browserConfig.input) {
    const App = require(
      path.resolve(
        context.root,
        browserConfig.input
      )
    ).default;

    const configEntry = getEntriesFromApplicationClass(
      App,
      context.root
    );

    const normalizeEntry = (entryPath: string) => {
      return path.resolve(context.root, entryPath);
    }
    Object.keys(configEntry)
      .forEach((entryKey) => {
        const entryPath = configEntry[entryKey];
        if (typeof entryPath === 'string') {
          chainConfig.entry(entryKey)
            .add(normalizeEntry(entryPath))
        }
      });
  }
  if (browserConfig.entry) {
    const entry = browserConfig.entry;
    Object.keys(entry)
      .forEach((entryKey) => {
        const entryPath = entry[entryKey];
        if (Array.isArray(entryPath)) {
          chainConfig.entry(entryKey)
            .merge(entryPath)
        } else {
          chainConfig.entry(entryKey)
            .add(entryPath)
        }
      });
  }
}


export async function mergeBuildDllConfig (
  context: SugarScriptsContext,
  chainConfig: WebpackChainConfig
) {
  if (!context.packageConfig.browser) return;
  const browserConfig = context.packageConfig.browser;

  if (browserConfig.dll) {
    chainConfig.output
      .library(`${context.rootHash}_sn_[name]`)
      .libraryTarget('umd');

    chainConfig.plugin('DllPlugin')
      .use(
        webpack.DllPlugin,
        [{
          context: context.root,
          name: `${context.rootHash}_sn_[name]`,
          path: path.resolve(
            context.getCacheDir(),
            context.rootHash,
            './[name]/dll.modules.manifest.json'
          ),
          format: true
        }]
      );
  }
}

export async function mergeBrowserCustomConfig  (
  context: SugarScriptsContext,
  chainConfig: WebpackChainConfig
) {
  await loadCustomConfig(
    context,
    chainConfig,
    SUGAR_BUILD_EXPORT_BROWSER
  )
}
