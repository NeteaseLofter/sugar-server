import webpack from 'webpack';
import WebpackChainConfig from 'webpack-chain';

import * as logger from '../shared/logger';


export const runWebpack = (
  chainConfig: WebpackChainConfig
) => {
  const compiler = webpack(
    chainConfig.toConfig()
  );

  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err || stats && stats.hasErrors()) {
        reject(err || stats?.toString());
        logger.error(stats?.toString() || '');
        return;
      }
      logger.log(stats?.toString() || '')
      resolve(stats)
    })
  })
}

export const runWatchWebpack = (
  chainConfig: WebpackChainConfig
) => {
  const compiler = webpack(
    chainConfig.toConfig()
  );

  return new Promise((resolve, reject) => {
    compiler.watch({}, (err, stats) => {
      if (err || stats && stats.hasErrors()) {
        reject(err || stats?.toString());
        logger.error(stats?.toString() || '');
        return;
      }
      logger.log(stats?.toString() || '')
      resolve(stats)
    })
  })
}