import { IncomingMessage, ServerResponse } from 'http';
import url from 'url';
import Koa from 'koa';
import type Router from 'koa-router';

import {
  Controller
 } from './controller';
import {
  appendControllerToRouter,
  appendApplication
} from './router';
import Config from './config';
import { SugarServerError } from './error';

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
  static isApplication (obj: any): obj is Controller {
    return obj instanceof Application;
  }

  static __sugar_Application = true;

  static isApplicationClass (objClass: any): objClass is typeof Application {
    return objClass.__sugar_Application;
  }

  // 配置项改为静态属性，是否更合理？更直观？
  static host?: string | {
    includes?: string[],
    excludes?: string[]
  };

  static path?: string | RegExp;
  static rewrite?: (reqUrl: url.UrlWithStringQuery, req: IncomingMessage) => string;

  constructor (
    {
      app
    }: {
      app?: Application
    } = {}
  ) {
    super();
    if (app) {
      this.parentApp = app;
    }
  }

  _applyRequest: any;
  config = new Config();
  controllers: Controller[] = [];
  parentApp?: Application;

  onError (err: SugarServerError, ctx: ControllerContext) {
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

  useApplication (
    ApplicationClass: typeof Application
  ) {
    console.log(ApplicationClass);
    const {
      application,
      routerMiddleware
    } = appendApplication(
      ApplicationClass
    )
    this.use(routerMiddleware);
  }

  useController (
    ControllerClass: typeof Controller
  ) {
    const {
      controller,
      router
     } = appendControllerToRouter(
      ControllerClass
    );
    if (router) {
      this.use(router.routes());
    }
    this.controllers.push(controller);
  }

  createContext (
    req: IncomingMessage,
    res: ServerResponse
  ): any {
    const ctx = super.createContext.call(this, req, res)
    ctx.routerPath = (req as any).routerPath;
    return ctx;
  }

  createApply () {
    this._applyRequest = this.callback();
  }

  applyRequest (
    req: IncomingMessage,
    res: ServerResponse
  ) {
    return this._applyRequest(req, res);
  }
}
