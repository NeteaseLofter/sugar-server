import createServer from './core/server';
import * as router from './core/router';
import * as parameter from './core/parameter';

import * as validator from './core/validator';
import { SugarServerError } from './core/error';

import Controller from './core/controller';
import {
  createApplication,
  Application,
  ControllerContext
} from './core/application'

import Config from './core/config';

export {
  createServer,
  createApplication,
  Application,
  router,
  parameter,
  validator,
  Controller,
  Config,
  ControllerContext,
  SugarServerError
}


// server();

// function server () {
//   var router = new Router();
//   appendRoutes(router);
//   app.use(router.routes());
// }