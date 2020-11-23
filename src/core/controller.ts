import { Application } from './application';

export default class Controller {
  static isController (obj: any): obj is Controller {
    return obj instanceof Controller;
  }

  static isControllerClass (objClass: any): objClass is typeof Controller {
    return objClass.__sugar_Controller;
  }

  static __sugar_Controller = true;

  static prefix?: string;

  app: Application;

  constructor (app: Application) {
    this.app = app;
  }

  // static _routes = [];

  // __sugar_controller = true;

  // _routes!: { key: string, method: 'get'|'post'|'put'|'del'|'all', path: string }[];
}
