import path from 'path';
import {
  SugarScriptsContext
} from './running-context';
import {
  rm
} from '../shared/file-helpers';

export const clean = (
  context: SugarScriptsContext
) => {
  return rm(
    context.getCacheDir()
  );
}
