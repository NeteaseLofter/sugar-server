import {
  findConfig
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
  } = await findConfig(dir);
  if (!packageConfigs) {
    throw new Error('not found packageConfigs')
  }
  return new SugarScriptsContext({
    root,
    packageName: packageJson.name,
    packageConfigs,
    watch: !!watch
  })
}