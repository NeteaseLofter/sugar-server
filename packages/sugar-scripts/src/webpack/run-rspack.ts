import { rspack } from '@rspack/core';
import type { RspackOptions } from '@rspack/core';

import * as logger from '../shared/logger';

export const runRspack = (
  config: RspackOptions
) => {
  const compiler = rspack(config);

  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err || stats && stats.hasErrors()) {
        reject(err || stats?.toString());
        logger.error(stats?.toString() || '');
        return;
      }
      logger.log(stats?.toString() || '');
      resolve(stats);
    });
  });
};

export const runWatchRspack = (
  config: RspackOptions
) => {
  const compiler = rspack(config);

  return new Promise((resolve, reject) => {
    compiler.watch({}, (err, stats) => {
      if (err || stats && stats.hasErrors()) {
        reject(err || stats?.toString());
        logger.error(stats?.toString() || '');
        return;
      }
      logger.log(stats?.toString() || '');
      resolve(stats);
    });
  });
};
