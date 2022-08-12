import path from 'path';

import type {
  SugarScriptsProject
} from '../custom-config.type';
import {
  getHashFromRoot,
  asyncGetDirHash
} from '../shared/file-helpers';

export class SugarScriptsContext {
  root: string;
  rootHash: string;
  packageName: string;
  projectRoot: string;
  packageConfigs: SugarScriptsProject.SugarPackageConfigs;
  projectConfigs: SugarScriptsProject.SugarProjectConfigs;

  constructor (
    {
      root,
      packageName,
      packageConfigs,
      projectRoot,
      projectConfigs
    }: {
      root: string;
      packageName: string;
      packageConfigs: SugarScriptsProject.SugarPackageConfigs;
      projectRoot: string;
      projectConfigs: SugarScriptsProject.SugarProjectConfigs;
    }
  ) {
    this.root = root;
    this.packageName = packageName;
    this.projectRoot = projectRoot;
    this.packageConfigs = packageConfigs;
    this.projectConfigs = projectConfigs;
    this.rootHash = getHashFromRoot(root);
  }

  serverEntryName = 'main';

  get packageConfig () {
    return this.packageConfigs.packageConfig;
  }

  get projectConfig () {
    return this.projectConfigs.projectConfig;
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
      this.projectRoot,
      this.projectConfig.cacheDir
    )
  }

  async getDirHash () {
    return await asyncGetDirHash(this.root);
  }
}