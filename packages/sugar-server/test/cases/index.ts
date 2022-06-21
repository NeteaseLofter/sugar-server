import { runClientCases } from './client';
import { runServerCases } from './server';

export function run () {
  describe('sugar-server', function () {
    let stop;
    after(function () {
      if (stop) {
        stop();
      }
    });

    stop = runServerCases();
    runClientCases();
  })
}