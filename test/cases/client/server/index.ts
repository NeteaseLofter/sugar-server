import {
  createServer,
  createApplication
} from '../../../../src';

import * as Controllers from './controllers';

const server = createServer(
  { server: { port: 9527 } },
  [
    {
      application: createLofterAdminApplication()
    }
  ]
);

const serverWithPath = createServer(
  { server: { port: 9528 } },
  [
    {
      application: createLofterAdminApplication(),
      path: '/path'
    },
    {
      application: createLofterAdminApplication(),
      path: /^\/reg-path/
    },
    {
      application: createLofterAdminApplication(),
      path: /^(?!:\/router-test)/
    }
  ]
);

const stop = () => {
  server.server.close();
  serverWithPath.server.close();
}

export { stop };


function createLofterAdminApplication () {
  const lofterAdminApplication = createApplication(
    [],
    Controllers,
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
