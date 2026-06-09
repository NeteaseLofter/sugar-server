import path from 'path';
import * as tsNode from 'ts-node';

import * as logger from '../shared/logger';
import {
  SugarScriptsContext
} from './running-context';
import {
  mergeBrowserEntry,
  mergeBrowserCustomConfig
} from '../webpack/webpack.browser';
import {
  mergeServerEntry,
  mergeServerCustomConfig
} from '../webpack/webpack.server';
import {
  createCommonChainConfig
} from '../webpack/webpack.common';
import {
  runWebpack,
  runWatchWebpack
} from '../webpack/run-webpack';


export const build = async (
  context: SugarScriptsContext
) => {
  tsNode.register({
    cwd: context.root,
    projectSearchDir: context.root,
    project: path.resolve(context.root, './tsconfig.json'),
    transpileOnly: true
  })

  await buildServer(
    context
  )

  await buildBrowser(
    context
  )
}

const buildBrowser = async (context: SugarScriptsContext) => {
  if (!context.packageConfig.browser) return;
  const browserConfig = context.packageConfig.browser;
  const bundler = context.packageConfig.bundler || 'webpack';

  logger.info(`build browser [${bundler}]`);
  logger.log(JSON.stringify(browserConfig));

  let chainConfig: any;

  if (bundler === 'rspack') {
    const { createCommonRspackChainConfig } = await import('../webpack/rspack.common');
    chainConfig = await createCommonRspackChainConfig(context, browserConfig.output);
  } else {
    chainConfig = await createCommonChainConfig(context, browserConfig.output);
  }

  await mergeBrowserEntry(
    context,
    chainConfig
  )

  await mergeBrowserCustomConfig(
    context,
    chainConfig
  )

  if (bundler === 'rspack') {
    const { runRspack, runWatchRspack } = await import('../webpack/run-rspack');
    if (context.watch) {
      await runWatchRspack(chainConfig.toConfig());
    } else {
      await runRspack(chainConfig.toConfig());
    }
  } else {
    if (context.watch) {
      await runWatchWebpack(chainConfig);
    } else {
      await runWebpack(chainConfig);
    }
  }

  logger.success('build browser finish');
}


const buildServer = async (context: SugarScriptsContext) => {
  if (!context.packageConfig.server) return;
  const serverConfig = context.packageConfig.server;
  const bundler = context.packageConfig.bundler || 'webpack';

  logger.info(`build server [${bundler}]`);
  logger.log(JSON.stringify(serverConfig));

  let chainConfig: any;

  if (bundler === 'rspack') {
    const { createCommonRspackChainConfig } = await import('../webpack/rspack.common');
    chainConfig = await createCommonRspackChainConfig(context, serverConfig.output);
  } else {
    chainConfig = await createCommonChainConfig(context, serverConfig.output);
  }

  await mergeServerEntry(
    context,
    chainConfig
  );
  await mergeServerCustomConfig(
    context,
    chainConfig
  );

  if (bundler === 'rspack') {
    const { runRspack, runWatchRspack } = await import('../webpack/run-rspack');
    if (context.watch) {
      await runWatchRspack(chainConfig.toConfig());
    } else {
      await runRspack(chainConfig.toConfig());
    }
  } else {
    if (context.watch) {
      await runWatchWebpack(chainConfig);
    } else {
      await runWebpack(chainConfig);
    }
  }

  logger.success('build server finish');
}
