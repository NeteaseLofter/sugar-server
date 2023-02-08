import {
  Application
} from '../../../../src';

import * as Controllers from './controllers';

class TestApp extends Application {
  static defaultConfig: {
    a: 1,
    b: {
      c: 2
    }
  }
}

class Server extends Application {
  static Applications = [
    TestApp
  ];
}

const server = new Server();
server.listen(9527);

class ServerWithPath extends Application {
  static Applications = [
    TestApp
  ];
}

const serverWithPath = new ServerWithPath();
serverWithPath.listen(9528)

const stop = () => {
  server.close();
  serverWithPath.close();
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
