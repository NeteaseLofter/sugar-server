import Koa, { Middleware } from 'koa';
import http, { IncomingMessage, ServerResponse, Server } from 'http';

import {
  createApplyApplicationMiddleware,
  ApplicationMiddlewareConfig
} from './application';

import * as baseConfigs from '../configs';

import Config from './config';


class SugarApplication {
  config = new Config();
  server?: Server;
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
    }
  }
}

export default function createServer (
  customConfigs: any,
  applicationRoutes: ApplicationMiddlewareConfig[]
) {
  const app = new SugarApplication();
  const config = app.config;

  app.config.add(baseConfigs);
  app.config.add(customConfigs);

  // app.use(bodyParser());

  app.useApplicationMiddleware(
    createApplyApplicationMiddleware(applicationRoutes)
  )

  const serverName = config.get('server.name');
  const httpPort = config.get('server.port');
  // app.listen(httpPort);
  let server = http.createServer(app.callback());
  server.listen(httpPort);
  app.server = server;
  console.info(`new ${serverName} server start listen at ${httpPort}`);

  return app;
}
