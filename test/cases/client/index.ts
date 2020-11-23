import routerCase from './router';
import parameterCase from './parameter';
import validatorCase from './validator';
import baseCase from './base';

import { stop } from './server';

export function runClientCases () {
  describe('sugar-server-client', function () {
    after(function () {
      stop();
    });

    baseCase();
    routerCase();
    parameterCase();
    validatorCase();
  })
}
