import { IncomingMessage, ServerResponse } from 'http';
import url from 'url';
import Router from 'koa-router';

import { Application, ControllerContext } from './application';
import Controller from './controller';

import createThunkAttributeDescriptor from '../shared/create-thunk-attribute-descriptor';

export const ROUTES_KEY = Symbol('_sugar_routes');

/**
 * create routes
 * @param {Object} options
 * @param {'get'|'post'|'put'|'del'|'all'} options.method
 * @param {string} options.path
 * @returns {Function} descriptor
 */
export const create = createThunkAttributeDescriptor<{
  method: 'get'|'post'|'put'|'del'|'all',
  path: string
}>((
  options,
  target,
  key,
  descriptor
) => {
  if (Controller.isController(target)) {
    if (!Object.getOwnPropertyDescriptor(target, ROUTES_KEY)) {
      Object.defineProperty(target, ROUTES_KEY, {
        configurable: true,
        enumerable: false,
        writable: true,
        value: []
      })
    }

    (target as any)[ROUTES_KEY].push({
      key: key,
      method: options.method,
      path: options.path
    })
  }
});

export function GetRoute (path: string) {
  return create({ method: 'get', path })
}

export function PostRoute (path: string) {
  return create({ method: 'post', path })
}

export function PutRoute (path: string) {
  return create({ method: 'put', path })
}

export function DelRoute (path: string) {
  return create({ method: 'del', path })
}

export function AllRoute (path: string) {
  return create({ method: 'all', path })
}

export function getRoutesFromController (
  controller: Controller
) {
  return controller[ROUTES_KEY];
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


export function appendApplication (
  application: Application
) {
  return async (
    ctx: ControllerContext,
    next: () => void
  ) => {
    const {
      req,
      res
    } = ctx;
    let reqUrl = url.parse(req.url || '');
    let reqHost = req.headers.host;

    let current = true;
    const applicationClass = application.constructor as typeof Application;
    const {
      path,
      host,
      rewrite
    } = applicationClass;

    if (!reqUrl.pathname) {
      current = false;
    } else if (
      typeof path === 'string'
      ? (reqUrl.pathname.indexOf(path) !== 0)
      : !path.test(reqUrl.pathname)
    ) {
      current = false;
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

    if (current) {
      let routerPath: string|undefined;

      if (rewrite) {
        routerPath = rewrite(reqUrl, req);
      } else if (path) {
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

      await application.applyRequest(
        req,
        res
      );
    }
    await next();
  }
}

export function appendControllerToRouter (
  controller: Controller
) {
  if (Controller.isController(controller)) {
    let ControllerClass = controller.constructor as typeof Controller;

    let prefix = ControllerClass.prefix;

    if ((controller as any)[ROUTES_KEY]) {
      let router = new Router();
      if (prefix) {
        router.prefix(prefix);
      }
      (controller as any)[ROUTES_KEY].forEach(({
        key,
        method,
        path
      }: {
        key: string,
        method: 'get'|'post'|'put'|'del'|'all',
        path: string
      }) => {
        if (typeof (controller as any)[key] === 'function') {
          router[method] && router[method](path, async (ctx: any, next) => {
            const controllerReturn = await (controller as any)[key].call(controller, ctx, next);
            if (
              typeof controllerReturn !== 'undefined' &&
              !ctx.res.writableEnded &&
              !ctx.res.writableFinished
            ) {
              ctx.body = controllerReturn;
            }
            await next();
          });
        }
      });
      return router;
    }
  }
}

export function appendControllers (
  Controllers: {
    [propName: string]: typeof Controller
  },
  app: Application
) {
  const routers = [];
  for (let key in Controllers) {
    let ControllerClass = Controllers[key];

    if (Controller.isControllerClass(ControllerClass)) {
      let controller = new ControllerClass({ app });
      app.controllers.push(controller);

      let prefix = ControllerClass.prefix;

      if ((controller as any)[ROUTES_KEY]) {
        let router = new Router();
        if (prefix) {
          router.prefix(prefix);
        }
        (controller as any)[ROUTES_KEY].forEach(({
          key,
          method,
          path
        }: {
          key: string,
          method: 'get'|'post'|'put'|'del'|'all',
          path: string
        }) => {
          if (typeof (controller as any)[key] === 'function') {
            router[method] && router[method](path, async (ctx: any, next) => {
              const controllerReturn = await (controller as any)[key].call(controller, ctx, next);

              if (
                typeof controllerReturn !== 'undefined' &&
                !ctx.res.writableEnded &&
                !ctx.res.writableFinished
              ) {
                ctx.body = controllerReturn;
              }
              await next();
            });
          }
        });
        routers.push(router);
      }
    }
  }

  return routers;
}
