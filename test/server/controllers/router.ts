import {
  Controller,
  router,
  ControllerContext
} from '../../../src';



export class RouterTextController extends Controller {
  static prefix = '/router-test';

  @router.GetRoute('/get')
  testGetRoute (ctx: ControllerContext) {
    ctx.body = 'get';
  }

  @router.PostRoute('/post')
  testPostRoute (ctx: ControllerContext) {
    ctx.body = 'post';
  }

  @router.PutRoute('/put')
  testPutRoute (ctx: ControllerContext) {
    ctx.body = 'put';
  }

  @router.DelRoute('/del')
  testDelRoute (ctx: ControllerContext) {
    ctx.body = 'del';
  }

  @router.AllRoute('/all')
  testAllRoute (ctx: ControllerContext) {
    ctx.body = 'all:' + ctx.method;
  }
}