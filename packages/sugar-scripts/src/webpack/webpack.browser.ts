import path from 'path';
import WebpackChainConfig from 'webpack-chain';
import { glob } from 'glob';
import { WebpackManifestPlugin } from 'webpack-manifest-plugin';

import {
  SugarScriptsContext
} from '../core/running-context';
import {
  getCacheFilePath
} from './server-browser-entry';


function normalEntryPath (
  entryPath: string,
  root: string
) {
  if (entryPath.startsWith('.')) {
    return glob.sync(
      path.join(root, entryPath)
    )
  }
  return [entryPath];
}


export async function mergeBrowserEntry(
  context: SugarScriptsContext,
  chainConfig: WebpackChainConfig
) {
  if (!context.packageConfig.browser) return;
  const browserConfig = context.packageConfig.browser;

  const autoBrowserEntryFilePath = getCacheFilePath(context);

  if (context.packageConfig.server) {
    chainConfig.plugin('manifest')
      .use(
        WebpackManifestPlugin,
        [{
          fileName: path.resolve(
            context.packageConfig.server.output,
            './browser-manifest.json'
          ),
          useEntryKeys: true,
          writeToFileEmit: true
        }]
      )
  }

  try {
    const configEntry = require(autoBrowserEntryFilePath);

    Object.keys(configEntry)
      .forEach((entryKey) => {
        const entryPath = configEntry[entryKey];
        if (typeof entryPath === 'string') {
          chainConfig.entry(entryKey)
            .add(
              entryPath
            )
        }
      });
  } catch (e) {
    console.log(e);
  }

  if (browserConfig.entry) {
    const entry = browserConfig.entry;
    Object.keys(entry)
      .forEach((entryKey) => {
        const entryPath = entry[entryKey];
        if (Array.isArray(entryPath)) {
          chainConfig.entry(entryKey)
            .merge(
              entryPath.reduce((entryPaths, globPath) => {
                return [
                  ...entryPaths,
                  ...normalEntryPath(
                    globPath,
                    context.root,
                  )
                ]
              }, [] as string[])
            )
        } else {
          chainConfig.entry(entryKey)
            .merge(normalEntryPath(
              entryPath,
              context.root,
            ))
        }
      });
  }
}

export async function mergeBrowserCustomConfig  (
  context: SugarScriptsContext,
  chainConfig: WebpackChainConfig
) {
  if (context.projectConfigs.browserWebpackConfig) {
    await context.projectConfigs.browserWebpackConfig(
      chainConfig,
      context
    )
  }

  if (context.packageConfigs.browserWebpackConfig) {
    await context.packageConfigs.browserWebpackConfig(
      chainConfig,
      context
    )
  }
}
