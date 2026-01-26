import {
  Application,
  ControllerContext
} from '../../../../src';

import * as Controllers from './controllers';


class Server extends Application {
  static defaultConfig = {
    a: 1,
    b: {
      c: 2
    }
  }

  static Controllers = [
    ...Object.keys(Controllers).map((controllerKey) => (Controllers as any)[controllerKey])
  ];

  onError (err: any, ctx: ControllerContext) {
    if (
      !ctx.res.writableEnded &&
      !ctx.res.writableFinished
    ) {
      let statusCode = 500;
      if (typeof err.statusCode === 'number') {
        statusCode = err.statusCode;
      }

      this.emit('appError', err, ctx);
      ctx.status = statusCode;
      ctx.body = {
        code: err.code || 0,
        message: err.message
      }
    }
  }
}

const server = new Server();
const serverListen = server.listen(9527);


class ChildServerWithPath extends Server {
  static path = '/path';
}

class ChildServerWithRegPath extends Server {
  static path = /^\/reg-path/;
}

class ServerWithPath extends Application {
  static Applications = [
    ChildServerWithPath,
    ChildServerWithRegPath
  ];
}

const serverWithPath = new ServerWithPath();
const serverWithPathListen = serverWithPath.listen(9528)

const stop = () => {
  serverListen.close();
  serverWithPathListen.close();
}

export { stop, server, serverWithPath };


