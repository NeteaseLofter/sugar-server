import { createHash } from 'crypto';
import { BuildOptions, BuildConfig } from '../custom-config.type';

export function getHashFromRoot (
  root: string
) {
  const hash = createHash('md5');
  hash.update(root);
  return hash.digest('hex')
}


export function createBuildConfig (
  options: BuildOptions
): BuildConfig {
  return {
    ...options,
    rootHash: getHashFromRoot(options.root)
  }
}
