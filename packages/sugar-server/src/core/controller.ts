import { Application } from './application';

export const ROUTES_KEY = Symbol('_sugar_routes');


export type RouteMethod = 'get'|'post'|'put'|'del'|'all';

export interface RouteConfig {
  key: string,
  method: RouteMethod,
  path: string
}


export class Controller {
  static isController (obj: any): obj is Controller {
    return obj instanceof Controller;
  }

  static isControllerClass (objClass: any): objClass is typeof Controller {
    return objClass.__sugar_Controller;
  }

  static __sugar_Controller = true;

  static prefix?: string;

  private [ROUTES_KEY]!: RouteConfig[];
}
