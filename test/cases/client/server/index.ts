import {
  createServer,
  createApplication
} from '../../../../src';

import * as Controllers from './controllers';

const server = createServer(
  { server: { port: 9527 } },
  [
    {
      application: createTestApplication()
    }
  ]
);

const serverWithPath = createServer(
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

export { stop };


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
