import { IncomingMessage, Server, ServerResponse } from 'http';
import url from 'url';
import Koa from 'koa';

import type {
  Controller,
  ControllerContext
 } from './controller';
import {
  appendControllerToRouter,
  appendApplication
} from './router';
import { Config } from './config';
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

export class Application extends Koa<ControllerContext> {
  static isApplication (obj: any): obj is Application {
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

  static Controllers: (typeof Controller)[] = [];
  static Applications: (typeof Application)[] = [];
  static defaultConfig?: any;


  _applyRequest: any;
  config: Config;
  Controllers: (typeof Controller)[] = [];

  constructor () {
    super();

    const thisConstructor = this.constructor as typeof Application;

    thisConstructor.Controllers.forEach((
      Controller
    ) => {
      this.useController(Controller);
    })

    thisConstructor.Applications.forEach((
      Application
    ) => {
      this.useApplication(Application);
    })

    this.config = new Config();
    if (thisConstructor.defaultConfig) {
      this.config.add(
        thisConstructor.defaultConfig
      )
    }
  }

  onError (err: SugarServerError, ctx: ControllerContext) {
    throw err;
  }

  useApplication (
    ApplicationClass: typeof Application
  ) {
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
      router
     } = appendControllerToRouter(
      ControllerClass
    );
    if (router) {
      this.use(router.routes());
    }
    this.Controllers.push(ControllerClass);
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
