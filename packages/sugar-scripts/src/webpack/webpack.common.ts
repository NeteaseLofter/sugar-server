import path from 'path';
import webpack from 'webpack';
import WebpackChainConfig from 'webpack-chain';

import {
  SugarScriptsContext
} from '../core/running-context';

const mode = process.env.WEBPACK_MODE === 'development' ? 'development' : 'production';
// const mode = 'development';

/**
 * common 是创建基础的webpack配置项，基于webpack-chain
 * 用于被 webpack.dll 、webpack.frontend、webpack.server扩展
 */

export async function createCommonChainConfig (
  context: SugarScriptsContext,
  output: string
): Promise<WebpackChainConfig> {
  let chainConfig = new WebpackChainConfig();

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
    devtool: process.env.NODE_ENV === 'development' ? 'cheap-module-eval-source-map' : false,
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
            'ts-loader': {
              loader: 'ts-loader',
              options: {
                transpileOnly: true
              }
            }
          }
        }
      },
    },
    plugin: {
      'ProgressPlugin': {
        plugin: webpack.ProgressPlugin,
        args: []
      }
    }
  })

  return chainConfig;
}
