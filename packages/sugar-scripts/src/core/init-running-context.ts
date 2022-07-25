import {
  findProject,
  findPackage
} from '../shared/file-helpers';

import {
  SugarScriptsContext
} from './running-context';

export const initRunningContext = async (dir: string) => {
  const {
    root,
    packageJson,
    packageConfig
  } = await findPackage(dir);
  const { projectRoot, projectConfig } = await findProject(root);
  if (!packageConfig || !projectConfig) {
    throw new Error('')
  }
  return new SugarScriptsContext({
    root,
    packageName: packageJson.name,
    packageConfig,
    projectRoot,
    projectConfig
  })
}