import { IncomingMessage, ServerResponse } from 'http';
import url from 'url';
import Koa from 'koa';
import type Router from 'koa-router';

import Controller from './controller';
import appendControllers from './router';
import Config from './config';
import { SugarServerError } from './error';

export function createApplication (
  middleware: Koa.Middleware[],
  Controllers: { [propName: string]: typeof Controller },
  customConfigs?: any
) {
  return new Application(
    middleware,
    Controllers,
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
  path?: string|RegExp,
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
          typeof path === 'string'
          ? (reqUrl.pathname.indexOf(path) !== 0)
          : !path.test(reqUrl.pathname)
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
        const path = foundApplicationConfig.path;
        if (typeof path === 'string') {
          routerPath = reqUrl.pathname.slice(path.length);
        } else {
          routerPath = reqUrl.pathname.replace(path, '');
        }
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

export type ControllerContext = ExControllerContext
  & Koa.Context
  & Router.RouterContext
  & {
    app: Application
  }

export class Application extends Koa<ControllerContext> {
  _applyRequest: any;
  config = new Config();
  controllers: Controller[] = [];

  onError (err: SugarServerError, ctx: ControllerContext) {
    if (
      !ctx.res.writableEnded &&
      !ctx.res.writableFinished
    ) {
      let statusCode = 500;
      if (typeof err.statusCode === 'number') {
        statusCode = err.statusCode;
      }

      this.emit('appError', err, ctx)
      ctx.status = statusCode;
      ctx.body = {
        code: err.code || 0,
        message: err.message
      }
    }
  }

  async controllerMiddleware (ctx: ControllerContext, next: () => Promise<any>) {
    return await next();
  }

  constructor (
    middlewareArray: Koa.Middleware[],
    Controllers: { [propName: string]: typeof Controller },
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

    const routers = appendControllers(
      Controllers,
      this
    );

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
