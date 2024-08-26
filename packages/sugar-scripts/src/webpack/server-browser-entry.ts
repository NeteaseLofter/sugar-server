import path from 'path';
import crypto from 'crypto';

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
  browserEntryKey?: string | ((
    originEntryKey: string
  ) => string);
  browserIncludes?: string[];
}

const PLUGIN_NAME = 'SugarServerEntryPlugin';
const CACHE_FILE_NAME = 'server-browser-entries.json';
const WEBPACK_IMPORT_SYNTAX = 'sugar?browser-entry/';

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
            let entryFilePath;
            if (result.request.startsWith(WEBPACK_IMPORT_SYNTAX)) {
              const filePath = result.request.slice(
                WEBPACK_IMPORT_SYNTAX.length
              );
              const absoluteFilePath = path.resolve(
                result.context,
                filePath
              )

              entryFilePath = absoluteFilePath;
            }

            if (
              this.options.browserIncludes
              && this.options.browserIncludes.length > 0
            ) {
              const absoluteFilePath = path.resolve(
                result.context,
                result.request
              );

              if (
                this.options.browserIncludes.some((
                  includePath
                ) => {
                  return !path.relative(
                    path.resolve(
                      this.options.root,
                      includePath
                    ),
                    absoluteFilePath
                  ).startsWith('..');
                })
              ) {
                entryFilePath = absoluteFilePath;
              }
            }

            if (entryFilePath) {
              let entryKey = path.relative(
                this.options.root,
                entryFilePath
              ).replace(/\\/g, '/');
              if (
                this.options.browserEntryKey
              ) {
                if (
                  typeof this.options.browserEntryKey === 'string'
                ) {
                  const browserEntryKey = this.options.browserEntryKey;
                  const hash = crypto.createHash('sha256');
                  hash.update(entryKey);
                  const hashText = hash.digest('hex');
                  const replaceMap = {
                    hash: hashText,
                    basename: path.basename(entryKey)
                  };
                  entryKey = browserEntryKey.replace(/{(hash|basename)(\:([0-9]+))?}/g, (
                    match,
                    p1,
                    p2,
                    p3
                  ) => {
                    const text = (replaceMap as any)[p1] || '';
                    if (p3) {
                      const len = +p3;
                      return text.slice(0, len);
                    }
                    return text;
                  });
                } else if (
                  typeof this.options.browserEntryKey === 'function'
                ) {
                  entryKey = this.options.browserEntryKey(entryKey);
                }
              }

              data[entryKey] = entryFilePath;
              logger.log(`find sugar browser import in [${result.context}] use [${entryFilePath}]`);
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
