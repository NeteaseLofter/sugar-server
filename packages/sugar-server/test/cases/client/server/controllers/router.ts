import {
  Controller,
  router,
  ControllerContext
} from '../../../../../src';



export class RouterTestController extends Controller {
  static prefix = '/router-test';

  @router.GetRoute('/get')
  testGetRoute () {
    return 'get';
  }

  @router.PostRoute('/post')
  testPostRoute () {
    return 'post';
  }

  @router.PutRoute('/put')
  testPutRoute () {
    return 'put';
  }

  @router.DelRoute('/del')
  testDelRoute () {
    return 'del';
  }

  @router.AllRoute('/all')
  testAllRoute () {
    return 'all:' + this.context.method;
  }
}