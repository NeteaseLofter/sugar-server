import path from 'path';
import * as tsNode from 'ts-node';

import {
  SugarScriptsContext
} from './running-context';

import {
  mergeBrowserEntryFromServer,
  mergeBuildDllConfig,
  mergeBrowserCustomConfig
} from '../webpack/webpack.browser';
import {
  mergeServerEntry,
  mergeServerCustomConfig
} from '../webpack/webpack.server';
import {
  createCommonChainConfig,
  mergeDllReferences
} from '../webpack/webpack.common';
import {
  runWebpack
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

  await buildBrowser(
    context
  )

  await buildServer(
    context
  )
}

const buildBrowser = async (context: SugarScriptsContext) => {
  if (!context.packageConfig.browser) return;
  const browserConfig = context.packageConfig.browser;

  const chainConfig = await createCommonChainConfig(
    context,
    browserConfig.output
  );

  await mergeBrowserEntryFromServer(
    context,
    chainConfig
  )

  // 合并其他已经构建好的dll
  await mergeDllReferences(
    context,
    chainConfig,
  )

  // 如果是dll
  await mergeBuildDllConfig(
    context,
    chainConfig
  )

  await mergeBrowserCustomConfig(
    context,
    chainConfig
  )

  await runWebpack(chainConfig);
}


const buildServer = async (context: SugarScriptsContext) => {
  if (!context.packageConfig.server) return;
  const serverConfig = context.packageConfig.server;

  const chainConfig = await createCommonChainConfig(
    context,
    serverConfig.output
  );

  await mergeServerEntry(
    context,
    chainConfig
  );
  await mergeServerCustomConfig(
    context,
    chainConfig
  );
  await runWebpack(chainConfig);
}