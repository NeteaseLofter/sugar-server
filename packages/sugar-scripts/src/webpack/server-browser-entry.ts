import path from 'path';

import webpack from 'webpack';

import {
  SugarScriptsContext
} from '../core/running-context';
import {
  writeFileSync
} from '../shared/file-helpers';


export interface SugarServerBrowserEntryPluginOptions {
  root: string;
  output: string;
}

const PLUGIN_NAME = 'SugarServerEntryPlugin';
const CACHE_FILE_NAME = 'server-browser-entries.json';

export function getCacheFilePath (context: SugarScriptsContext) {
  return path.resolve(
    context.getCacheDir(),
    CACHE_FILE_NAME
  )
}

export class SugarServerBrowserEntryPlugin {
  options: SugarServerBrowserEntryPluginOptions;
  constructor (options: SugarServerBrowserEntryPluginOptions) {
    this.options = options;
  }

  apply (compiler: webpack.Compiler) {
    const logger = compiler.getInfrastructureLogger(PLUGIN_NAME);
    const data = {} as {
      [filePath: string]: string;
    };

    compiler.hooks.normalModuleFactory.tap(
      PLUGIN_NAME,
      (factory) => {
        factory.hooks.beforeResolve
          .tap(PLUGIN_NAME, (result) => {
            if (result.request.startsWith('sugar-browser-entry/')) {
              const filePath = result.request.slice(
                'sugar-browser-entry/'.length
              );
              const absoluteFilePath = path.resolve(
                result.context,
                filePath
              )

              const entryKey = path.relative(
                this.options.root,
                absoluteFilePath
              );

              data[entryKey] = absoluteFilePath;
              const base64 = Buffer.from(
                `export default "${entryKey}"`
              ).toString('base64');
              result.request = `data:text/javascript;charset=utf-8;base64,${base64}`;
            }
          });
      }
    );

    compiler.hooks.done.tap(
      PLUGIN_NAME,
      () => {
        writeFileSync(
          this.options.output,
          JSON.stringify(data, null , 2)
        )
      }
    )
  }
}
