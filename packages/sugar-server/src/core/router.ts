import { IncomingMessage, ServerResponse } from 'http';
import url from 'url';
import Router from 'koa-router';

import type { Application } from './application';
import type { ControllerContext} from './controller';
import {
  Controller,
  ROUTES_KEY,
  RouteMethod
} from './controller';

import {
  createThunkAttributeDecorator
} from '../shared/create-thunk-descriptor';

/**
 * create routes
 */
export const create = createThunkAttributeDecorator<{
  method: RouteMethod,
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

    target[ROUTES_KEY].push({
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
  ApplicationClass: typeof Application
) {
  const application = new ApplicationClass();
  application.createApply();
  const {
    path,
    host,
    rewrite
  } = ApplicationClass;

  const routerMiddleware =  async (
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

    if (!reqUrl.pathname) {
      current = false;
    } else if (!path) {
      current = false;
    } else if (
      typeof path === 'string'
        ? (reqUrl.pathname.indexOf(path) !== 0)
        : !path.test(reqUrl.pathname)
    ) {
      current = false;
    }

    if (current && host) {
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
          routerPath = reqUrl.pathname!.slice(path.length);
        } else {
          routerPath = reqUrl.pathname!.replace(path, '');
        }
        if (routerPath.length === 0) {
          routerPath = '/';
        }
      }

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

  return {
    application,
    routerMiddleware
  }
}

export function appendControllerToRouter (
  ControllerClass: typeof Controller
) {
  let router = new Router();
  let prefix = ControllerClass.prefix;

  const routes = ControllerClass.prototype[ROUTES_KEY];
  if (routes) {
    if (prefix) {
      router.prefix(prefix);
    }
    routes.forEach(({
      key,
      method,
      path
    }) => {
      const methodRegister = router[method] && router[method];
      if (methodRegister) {
        (methodRegister as any).call(
          router,
          path,
          async (
            ctx: ControllerContext,
            next: any
          ) => {
            const controller = new ControllerClass();
            if (typeof (controller as any)[key] === 'function') {
              controller.context = ctx;
              const controllerReturn = await (controller as any)[key].call(controller, ctx, next);
              if (
                typeof controllerReturn !== 'undefined' &&
                !ctx.res.writableEnded &&
                !ctx.res.writableFinished
              ) {
                ctx.body = controllerReturn;
              }
            }
            await next();
          }
        )
      }
    });
  }

  return {
    router
  }
}
