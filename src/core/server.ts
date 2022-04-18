import http, { IncomingMessage, ServerResponse, Server } from 'http';
import Emitter from 'events';

import {
  createApplyApplicationMiddleware,
  ApplicationMiddlewareConfig,
  Application,
  ControllerContext
} from './application';
import { SugarServerError } from './error';

import * as baseConfigs from '../configs';

import Config from './config';


class SugarServer extends Emitter {
  config = new Config();
  server?: Server;

  onHttpClose?: (
    req: IncomingMessage,
    res: ServerResponse
  ) => void;

  private _applyApplicationMiddleware?: (
    req: IncomingMessage,
    res: ServerResponse
  ) => void;

  applicationRoutes: ApplicationMiddlewareConfig[] = [];

  useApplicationMiddleware (
    applicationRoutes: ApplicationMiddlewareConfig[]
  ) {
    this._applyApplicationMiddleware = createApplyApplicationMiddleware(
      applicationRoutes
    );

    this.applicationRoutes = applicationRoutes;
    applicationRoutes.forEach((applicationRoute) => {
      const { application } = applicationRoute;
      application.config.add(
        { sugarServer: this.config._configs }
      )
      application.on(
        'appError',
        (err: SugarServerError, ctx: ControllerContext) => {
          this.onError(
            err,
            ctx,
            application
          )
        }
      )
    })
  }

  onError (err: SugarServerError, ctx: ControllerContext, app: Application) {
    this.emit('appError', err, ctx, app);
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
    applicationRoutes
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
