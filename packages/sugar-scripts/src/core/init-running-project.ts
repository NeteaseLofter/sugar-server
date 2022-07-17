import path from 'path';

import {
  findProject,
  findPackage
} from '../shared/file-helpers';

import {
  setCacheDirPath
} from './cache';

export const initRunningProject = async (dir: string) => {
  const {
    root,
    packageJson,
    packageConfig
  } = await findPackage(dir);
  const { projectRoot, projectConfig } = await findProject(root);
  setCacheDirPath(
    path.resolve(
      projectRoot,
      projectConfig.cacheDir
    )
  );
  console.log(
    'projectConfig', projectConfig
  )
  return {
    root,
    packageJson,
    packageConfig,
    projectConfig
  }
}