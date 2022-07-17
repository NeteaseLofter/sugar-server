import path from 'path';
import {
  rm
} from '../shared/file-helpers';


export let cacheDirPath = path.resolve(__dirname, '../../.cache');

export const getCacheDirPath = () => {
  return cacheDirPath;
}

export const setCacheDirPath = (newCacheDirPath: string) => {
  cacheDirPath = newCacheDirPath
}

export const clean = () => {
  return rm(cacheDirPath);
}
