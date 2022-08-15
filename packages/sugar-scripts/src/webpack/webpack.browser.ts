import path from 'path';
import webpack, {
  container
} from 'webpack';
import WebpackChainConfig from 'webpack-chain';
import { glob } from 'glob';

import {
  SugarScriptsContext
} from '../core/running-context';
import {
  getEntriesFromApplicationClass
} from '../core/entry';

const {
  ModuleFederationPlugin
} = container;

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

    Object.keys(configEntry)
      .forEach((entryKey) => {
        const entryPath = configEntry[entryKey];
        if (typeof entryPath === 'string') {
          chainConfig.entry(entryKey)
            .add(
              path.join(context.root, entryPath)
            )
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


export async function mergeBuildDllConfig (
  context: SugarScriptsContext,
  chainConfig: WebpackChainConfig
) {
  if (!context.packageConfig.browser) return;
  const browserConfig = context.packageConfig.browser;

  let exposes: {
    [index: string]: string
  } = {};
  if (Array.isArray(browserConfig.exposes)) {
    browserConfig.exposes.forEach((newExpose) => {
      const files =  normalEntryPath(
        newExpose,
        context.root,
      )

      files.forEach((filePath) => {
        const relativePath = path.relative(context.root, filePath);
        // exposes[relativePath] = relativePath.startsWith('.') ? relativePath : `./${relativePath}`;
        exposes[relativePath] = filePath;
      })
    })
  }

  chainConfig.plugin('ModuleFederation')
    .use(
      ModuleFederationPlugin,
      [{
        name: context.packageName,
        library: { type: 'umd', name: context.packageName },
        exposes,
        // remotes: {}, // build module
        shared: ['react'] // node_modules
      }]
    )
  // if (browserConfig.dll) {
  //   chainConfig.output
  //     .library(`${context.rootHash}_sn_[name]`)
  //     .libraryTarget('umd');

  //   chainConfig.plugin('DllPlugin')
  //     .use(
  //       webpack.DllPlugin,
  //       [{
  //         context: context.root,
  //         name: `${context.rootHash}_sn_[name]`,
  //         path: path.resolve(
  //           context.getCacheDir(),
  //           context.rootHash,
  //           './[name]/dll.modules.manifest.json'
  //         ),
  //         format: true
  //       }]
  //     );
  //   // chainConfig.externals(
  //   //   function ({ context, request }: any, callback: any) {
  //   //     if (/^[^./]{1}/.test(request)) {
  //   //       // Externalize to a commonjs module using the request path
  //   //       return callback(null, request, 'commonjs');
  //   //     }
  //   //     callback();
  //   //   }
  //   // )
  // }
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
