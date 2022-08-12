import type {
  Application
} from './application';
import type {
  Controller
} from './controller';

import {
  createThunkClassDecorator
 } from '../shared/create-thunk-descriptor';

export const Module = createThunkClassDecorator<{
  Controllers?: (typeof Controller)[];
  Applications?: (typeof Application)[];
  config?: any
}>(
  (
    options,
    target: typeof Application
  ) => {
    if (options.Controllers) {
      target.Controllers = [
        ...target.Controllers,
        ...options.Controllers
      ];
    }
    if (options.Applications) {
      target.Applications = [
        ...target.Applications,
        ...options.Applications
      ];
    }
    if (options.config) {
      target.defaultConfig = options.config;
    }
  }
)