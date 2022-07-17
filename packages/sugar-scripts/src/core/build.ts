import path from 'path';
import webpack from 'webpack';
import * as tsNode from 'ts-node';

import {
  BuildOptions,
  BuildConfig,
  BuildConfigForBrowser,
  BuildConfigForServer,
  BuildConfigForBrowserEntry
} from '../custom-config.type';
import {
  createBrowserConfig
} from '../webpack/webpack.browser';
import {
  createServerConfig
} from '../webpack/webpack.server';
import {
  createBuildConfig,
} from '../webpack/helpers';
import {
  getEntriesFromApplicationClass
} from './entry';


export const build = async (options: BuildOptions) => {
  const config = createBuildConfig(options);
  tsNode.register({
    cwd: config.root,
    projectSearchDir: config.root,
    project: path.resolve(config.root, './tsconfig.json'),
    transpileOnly: true
  })

  if (config.browser) {
    await buildBrowser(config as BuildConfigForBrowser)
  }

  if (config.server) {
    await buildServer(config as BuildConfigForServer)
  }
}


export const buildServer = async (config: BuildConfigForServer) => {
  const webpackConfig = await createServerConfig(config);

  const compiler = webpack(
    webpackConfig
  );

  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err || stats && stats.hasErrors()) {
        reject(err || stats?.toString())
        return;
      }
      console.log(stats?.toString(webpackConfig.stats))
      resolve(stats)
    })
  })
}

export const buildBrowser = async (config: BuildConfigForBrowser) => {
  if (config.browser.input) {
    const App = require(
      path.resolve(
        config.root,
        config.browser.input
      )
    ).default;

    const entry = getEntriesFromApplicationClass(
      App,
      config.root
    );

    config.browser.entry = entry;
  }

  if (!config.browser.entry) {
    throw new Error('not found browser entry');
  }

  const webpackConfig = await createBrowserConfig(
    config as BuildConfigForBrowserEntry
  );

  const compiler = webpack(
    webpackConfig
  );

  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err || stats && stats.hasErrors()) {
        reject(err || stats?.toString())
        return;
      }
      console.log(stats?.toString())
      resolve(stats)
    })
  })
}
