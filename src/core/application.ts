import Koa from 'koa';
import { IncomingMessage, ServerResponse } from 'http';
import url from 'url';

import Controller from './controller';
import appendControllers from './router';
import Config from './config';
import { SugarServerError } from './error';

export function createApplication (
  middleware: Koa.Middleware[],
  controllers: { [propName: string]: Controller },
  customConfigs?: any
) {
  return new Application(
    middleware,
    controllers,
    customConfigs
  )
}

export function applyApplication (
  application: Application,
  req: IncomingMessage,
  res: ServerResponse
) {
  application.applyRequest(
    req,
    res
  );
}

export interface ApplicationMiddlewareConfig {
  application: Application,
  host?: string|{
    includes?: string[],
    excludes?: string[]
  },
  path?: string,
  rewrite?: (reqUrl: url.UrlWithStringQuery, req: IncomingMessage) => string;
}

export function createApplyApplicationMiddleware (
  applicationRoutes: ApplicationMiddlewareConfig[]
) {
  return function (
    req: IncomingMessage,
    res: ServerResponse
  ) {
    let reqUrl = url.parse(req.url || '');
    let reqHost = req.headers.host;
    let foundApplicationConfig = applicationRoutes.find(({
      path,
      host
    }) => {
      let current = true;
      if (path) {
        if (!reqUrl.pathname) {
          current = false;
        } else if (
          reqUrl.pathname.indexOf(path) !== 0
        ) {
          current = false;
        }
      }

      if (host) {
        if (!reqHost) {
          current = false;
        } else {
          if (typeof host === 'string') {
            if (reqHost !== host) {
              current = false;
            }
          } else {
            if (host.includes) {
              if (host.includes.indexOf(reqHost) === -1) {
                current = false;
              }
            }

            if (host.excludes) {
              if (host.excludes.indexOf(reqHost) !== -1) {
                current = false;
              }
            }
          }
        }
      }

      return current;
    })

    if (foundApplicationConfig) {
      let {
        application
      } = foundApplicationConfig;
      let routerPath: string|undefined;

      if (foundApplicationConfig.rewrite) {
        routerPath = foundApplicationConfig.rewrite(reqUrl, req);
      } else if (foundApplicationConfig.path && reqUrl.pathname) {
        routerPath = reqUrl.pathname.slice(foundApplicationConfig.path.length);
        if (routerPath.length === 0) {
          routerPath = '/';
        }
      }

      // console.log(routerPath);
      if (routerPath) {
        (req as any).routerPath = routerPath;
      } else {
        (req as any).routerPath = reqUrl.pathname;
      }

      application.applyRequest(
        req,
        res
      );
    } else {
      res.statusCode = 404;
      res.end('Not Found');
    }
  }
}

export interface ExControllerContext {
  routerPath?: string
}

export type ControllerContext =  ExControllerContext & Koa.Context & {
  app: Application
}

export class Application extends Koa<ControllerContext> {
  _applyRequest: any;
  config = new Config();

  onError (e: SugarServerError, ctx: ControllerContext) {
    if (
      !ctx.res.writableEnded &&
      !ctx.res.writableFinished
    ) {
      ctx.body = {
        code: e.code || 0,
        message: e.message
      }
    }
  }

  constructor (
    middlewareArray: Koa.Middleware[],
    Controllers: { [propName: string]: Controller },
    customConfigs?: any
  ) {
    super();

    this.config.add(customConfigs);

    this.use(async (ctx: ControllerContext, next) => {
      try {
        await next();
      } catch (e) {
        this.onError(e, ctx);
      }
    })

    this.use(async function routePath (ctx, next) {
      let req = ctx.req;
      if ((req as any).routerPath) {
        ctx.routerPath = (req as any).routerPath;
      }
      return await next();
    })

    middlewareArray.forEach((middleware) => {
      this.use(middleware)
    })

    const routers = appendControllers(Controllers);

    routers.forEach((router) => {
      this.use(router.routes());
    })
  }

  createApply () {
    this._applyRequest = this.callback();
  }

  applyRequest (
    req: IncomingMessage,
    res: ServerResponse
  ) {
    this._applyRequest(req, res);
  }
}
