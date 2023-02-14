import {
  findProject,
  findPackage
} from '../shared/file-helpers';

import {
  SugarScriptsContext
} from './running-context';

export const initRunningContext = async (
  dir: string,
  {
    watch
  }: {
    watch?: boolean;
  } = {}
) => {
  const {
    root,
    packageJson,
    packageConfigs
  } = await findPackage(dir);
  const {
    projectRoot,
    projectConfigs
  } = await findProject(root);
  if (!packageConfigs || !projectConfigs) {
    throw new Error('')
  }
  return new SugarScriptsContext({
    root,
    packageName: packageJson.name,
    packageConfigs,
    projectRoot,
    projectConfigs,
    watch: !!watch
  })
}