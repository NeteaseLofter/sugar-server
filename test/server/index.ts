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
    {}
  );

  lofterAdminApplication.createApply();

  return lofterAdminApplication;
}

