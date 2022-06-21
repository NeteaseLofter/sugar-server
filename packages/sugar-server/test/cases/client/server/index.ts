import {
  createServer,
  createApplication
} from '../../../../src';

import * as Controllers from './controllers';

const server: any = createServer(
  { server: { port: 9527 } },
  [
    {
      application: createTestApplication()
    }
  ]
);

const serverWithPath: any = createServer(
  { server: { port: 9528 } },
  [
    {
      application: createTestApplication(),
      path: '/path'
    },
    {
      application: createTestApplication(),
      path: /^\/reg-path/
    },
    {
      application: createTestApplication(),
      path: /^(?!:\/router-test)/
    }
  ]
);

const stop = () => {
  server.server.close();
  serverWithPath.server.close();
}

export { stop, server, serverWithPath };


function createTestApplication () {
  const testApplication = createApplication(
    [],
    Controllers,
    {
      a: 1,
      b: {
        c: 2
      }
    }
  );

  testApplication.createApply();

  testApplication.controllerMiddleware = async (ctx, next) => {
    const controllerResult = await next();
    if (
      controllerResult
      && controllerResult.custom
    ) {
      return controllerResult.custom
    } else {
      return controllerResult;
    }
  }

  return testApplication;
}
