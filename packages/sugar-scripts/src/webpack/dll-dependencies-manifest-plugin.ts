import webpack from 'webpack';

import {
  writeFileSync
} from '../shared/file-helpers';

export interface DllDependenciesManifestPluginOptions {
  dllAssets: {
    [dllName: string]: string[];
  }
  fileName: string,
  generate: (entries: {
    [entry: string]: string[]
  }) => any
}

const PLUGIN_NAME = 'DllDependenciesManifestPlugin';

export class DllDependenciesManifestPlugin {
  options: DllDependenciesManifestPluginOptions;
  constructor (options: DllDependenciesManifestPluginOptions) {
    this.options = options;
  }

  apply (compiler: webpack.Compiler) {
    const logger = compiler.getInfrastructureLogger(PLUGIN_NAME);

    compiler.hooks.done.tap(
      PLUGIN_NAME,
      (stats) => {
        var data = stats.toJson({
          all: false,
          entrypoints: true,
          chunks: true,
          chunkModules: true,
          // nestedModules: true,
          dependentModules: true,
          moduleAssets: true,
          assets: true,
          modules: true,
          // moduleTrace: true,
          // reasons: true,
          chunkRelations: true,
          ids: true,
          publicPath: true
        })

        const publicPath = data.publicPath;
        const entries: {
          [entry: string]: string[]
        } = data.entrypoints
          ? Object.keys(data.entrypoints).reduce((entries, entryKey) => {
            entries[entryKey] = [];
            const entryAssets = data.entrypoints![entryKey].assets;
            if (entryAssets) {
              const normalizePath = (path: string): string => {
                if (!path.endsWith('/')) {
                  return `${path}/`;
                }

                return path;
              };

              entries[entryKey] = entries[entryKey].concat(
                entryAssets.map(({ name }) => (
                  publicPath ? normalizePath(publicPath) + name : name
                ))
              )
            };
            return entries;
          }, {} as {
            [entry: string]: string[]
          })
          : {};

        data.chunks?.forEach((chunk) => {
          if (chunk.entry) {
            let depDllAssets: string[] = [];
            chunk.modules?.forEach((module) => {
              if (
                module.type !== 'module'
                || !module.identifier
              ) {
                return;
              }
              const dllNameResult = /dll-reference (.+)$/.exec(module.identifier)
              if (!dllNameResult) {
                return;
              }
              const dllName = dllNameResult[1];
              depDllAssets = depDllAssets.concat(
                this.options.dllAssets[dllName]
              )
            })
            if (entries[chunk.id as any]) {
              entries[chunk.id as any] = depDllAssets.concat(entries[chunk.id as any])
            }
          }
        })

        // 去重复
        Object.keys(entries).forEach((key) => {
          entries[key] = Array.from(new Set(entries[key]))
        })

        const manifest = this.options.generate(entries);

        writeFileSync(
          this.options.fileName,
          JSON.stringify(manifest, null, 2)
        )
      }
    )
  }
}
