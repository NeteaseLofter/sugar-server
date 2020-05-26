import routerCase from './router';
import parameterCase from './parameter';
import validatorCase from './validator';
import baseCase from './base';

export function run (stop: () => void) {
  describe('sugar-server', function () {
    after(function () {
      stop();
    });

    baseCase();
    routerCase();
    parameterCase();
    validatorCase();
  })
}
