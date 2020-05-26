import Router from 'koa-router';

import createThunkAttributeDescriptor from '../shared/create-thunk-attribute-descriptor';

import Controller from './controller';

const ROUTES_KEY = '_routes';

/**
 * @enum {RouteMethod}
 */
const RouteMethod = {
  get: 'get',
  post: 'post',
  put: 'put',
  del: 'del',
  all: 'all'
}

/**
 * create routes
 * @param {Object} options
 * @param {RouteMethod} options.method
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

export default function appendControllers (
  controllers: any
) {
  const routers = [];
  for (let controllerKey in controllers) {
    let ControllerClass = controllers[controllerKey];
    if (Controller.isControllerClass(ControllerClass)) {
      let controller = new ControllerClass();

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
        }: { key: string, method: 'get'|'post'|'put'|'del'|'all', path: string }) => {
          if (typeof (controller as any)[key] === 'function') {
            router[method] && router[method](path, async (ctx, next) => {
              await (controller as any)[key].call(controller, ctx, next)
              // console.log('finish controller router', key);
              // console.log(ctx.res.finished);
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
