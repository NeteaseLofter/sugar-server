import path from 'path';
import {
  rm
} from '../shared/file-helpers';


export const cacheDirPath = path.resolve(__dirname, '../../.cache');

export const dllManifestDirPath = path.resolve(cacheDirPath, './');
export const baseManifestDirPath = path.resolve(cacheDirPath, './');


export const clean = () => {
  return rm(cacheDirPath);
}
