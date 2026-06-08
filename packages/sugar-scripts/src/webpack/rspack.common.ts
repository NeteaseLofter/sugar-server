import path from 'path';
import { rspack } from '@rspack/core';
import RspackChain from 'rspack-chain';

import {
  SugarScriptsContext
} from '../core/running-context';

export async function createCommonRspackChainConfig(
  context: SugarScriptsContext,
  output: string
): Promise<RspackChain> {
  const mode = process.env.WEBPACK_MODE === 'development' ? 'development' : 'production';

  let chainConfig = new RspackChain();

  chainConfig.merge({
    context: context.root,
    resolve: {
      extensions: [
        '.ts',
        '.tsx',
        '.js',
        '.jsx'
      ],
    },
    output: {
      path: path.resolve(
        context.root,
        output || 'dist'
      ),
      filename:
        mode === 'development'
          ? '[name].js'
          : '[name].[contenthash].js'
    },
    mode,
    devtool: mode === 'development' ? 'source-map' : false,
    optimization: {
      moduleIds: 'named',
      chunkIds: 'named'
    },
    stats: {
      all: true,
      errorDetails: true
    },
    module: {
      rule: {
        script: {
          test: /\.(ts|tsx|js|jsx)$/,
          use: {
            'swc-loader': {
              loader: 'builtin:swc-loader',
              options: {
                jsc: {
                  parser: {
                    syntax: 'typescript',
                    tsx: true,
                    decorators: true,
                  },
                  transform: {
                    react: {
                      runtime: 'classic',
                    },
                  },
                  externalHelpers: false,
                },
              }
            }
          }
        }
      },
    },
    plugin: {
      'ProgressPlugin': {
        plugin: rspack.ProgressPlugin,
        args: []
      }
    }
  });

  return chainConfig;
}
