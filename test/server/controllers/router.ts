import {
  Controller,
  router,
  ControllerContext
} from '../../../src';



export class RouterTextController extends Controller {
  static prefix = '/router-test';

  @router.GetRoute('/get')
  testGetRoute (ctx: ControllerContext) {
    return 'get';
  }

  @router.PostRoute('/post')
  testPostRoute (ctx: ControllerContext) {
    return 'post';
  }

  @router.PutRoute('/put')
  testPutRoute (ctx: ControllerContext) {
    return 'put';
  }

  @router.DelRoute('/del')
  testDelRoute (ctx: ControllerContext) {
    return 'del';
  }

  @router.AllRoute('/all')
  testAllRoute (ctx: ControllerContext) {
    return 'all:' + ctx.method;
  }
}