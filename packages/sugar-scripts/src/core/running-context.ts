import path from 'path';

import type {
  SugarScriptsProject
} from '../custom-config.type';
import {
  getHashFromRoot,
  asyncGetDirHash
} from '../shared/file-helpers';
import {
  DEFAULT_CACHED_DIR
} from '../constants'

export class SugarScriptsContext {
  root: string;
  rootHash: string;
  packageName: string;
  packageConfigs: SugarScriptsProject.SugarPackageConfigs;
  watch: boolean;

  constructor (
    {
      root,
      packageName,
      packageConfigs,
      watch
    }: {
      root: string;
      packageName: string;
      packageConfigs: SugarScriptsProject.SugarPackageConfigs;
      watch: boolean;
    }
  ) {
    this.root = root;
    this.packageName = packageName;
    this.packageConfigs = packageConfigs;
    this.rootHash = getHashFromRoot(root);
    this.watch = watch;
  }

  serverEntryName = 'main';

  get packageConfig () {
    return this.packageConfigs.packageConfig;
  }

  getStartFilePath () {
    if (this.packageConfig.server) {
      return path.resolve(
        this.root,
        this.packageConfig.server.output,
        this.serverEntryName
      )
    }
  }

  getCacheDir () {
    return path.resolve(
      this.root,
      this.packageConfig.cacheDir || DEFAULT_CACHED_DIR
    )
  }

  async getDirHash () {
    return await asyncGetDirHash(this.root);
  }
}