import http, { IncomingMessage, ServerResponse, Server } from 'http';

import {
  createApplyApplicationMiddleware,
  ApplicationMiddlewareConfig
} from './application';

import * as baseConfigs from '../configs';

import Config from './config';


class SugarServer {
  config = new Config();
  server: Server;

  onHttpClose?: (
    req: IncomingMessage,
    res: ServerResponse
  ) => void;

  _applyApplicationMiddleware?: (
    req: IncomingMessage,
    res: ServerResponse
  ) => void;
  useApplicationMiddleware (
    applyApplicationMiddleware: (
      req: IncomingMessage,
      res: ServerResponse
    ) => void
  ) {
    this._applyApplicationMiddleware = applyApplicationMiddleware;
  }

  callback () {
    return (
      req: IncomingMessage,
      res: ServerResponse
    ) => {
      if (this._applyApplicationMiddleware) {
        this._applyApplicationMiddleware(req, res);
      }
      res.on('close', () => {
        if (this.onHttpClose) {
          this.onHttpClose(
            req,
            res
          );
        }
      })
    }
  }
}

export default function createServer (
  customConfigs: any,
  applicationRoutes: ApplicationMiddlewareConfig[]
) {
  const sugarServer = new SugarServer();
  const config = sugarServer.config;

  sugarServer.config.add(baseConfigs);
  sugarServer.config.add(customConfigs);

  sugarServer.useApplicationMiddleware(
    createApplyApplicationMiddleware(applicationRoutes)
  )

  const serverName = config.get('server.name');
  const httpPort = config.get('server.port');
  // app.listen(httpPort);
  let server = http.createServer(sugarServer.callback());
  server.listen(httpPort);
  sugarServer.server = server;
  console.info(`new ${serverName} server start listen at ${httpPort}`);

  return sugarServer;
}
