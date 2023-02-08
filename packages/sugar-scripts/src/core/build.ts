import path from 'path';
import * as tsNode from 'ts-node';

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

  const chainConfig = await createCommonChainConfig(
    context,
    browserConfig.output
  );

  await mergeBrowserEntry(
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
