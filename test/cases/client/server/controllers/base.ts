import {
  Controller,
  router,
  ControllerContext,
  SugarServerError
} from '../../../../../src';



export class BaseController extends Controller {

  @router.GetRoute('/server-error')
  testControllerMiddleware (ctx: ControllerContext) {
    throw new SugarServerError(
      500,
      'Server Error',
      {
        statusCode: 500
      }
    );
  }

  @router.GetRoute('/custom-controller-middleware')
  testCustomControllerMiddleware (ctx: ControllerContext) {
    return {
      custom: 'from custom message'
    }
  }
}