import {
  createServer,
  createApplication
} from '../../src';

import * as controllers from './controllers';

const server = createServer(
  { server: { port: 9527 } },
  [
    {
      application: createLofterAdminApplication()
    }
  ]
);

const stop = () => {
  server.server.close();
}

export { stop };


function createLofterAdminApplication () {
  const lofterAdminApplication = createApplication(
    [],
    controllers,
    {
      a: 1,
      b: {
        c: 2
      }
    }
  );

  lofterAdminApplication.createApply();

  return lofterAdminApplication;
}

