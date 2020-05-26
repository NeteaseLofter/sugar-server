import {
  Controller,
  router,
  parameter,
  validator,
  ControllerContext
} from '../../../src';



export class TestController extends Controller {
  static prefix = '/test';

  @router.PostRoute('/post-parameter/:id')
  @parameter.getter
  testPostParameterRoute (
    @parameter.params('id') id: string,
    @parameter.query('q') q: string,
    @parameter.header('x-custom') x: string,
    ctx: ControllerContext
  ) {
    // console.log(ctx.request.body);
    ctx.body = `id:${id};q:${q};x:${x}`;
  }

  @router.PostRoute('/post-parameter-body')
  @parameter.getter
  testPostParameterJSONBodyRoute (
    @parameter.body() body: any,
    ctx: ControllerContext
  ) {
    ctx.body = JSON.stringify(body.a);
  }

  @router.PostRoute('/post-parameter-form')
  @parameter.getter
  testPostParameterFormBodyRoute (
    @parameter.body() body: any,
    ctx: ControllerContext
  ) {
    ctx.body = `${body.f1};${body.f2}`;
  }


  @router.GetRoute('/post-validate')
  @parameter.getter
  @validator.validate
  testPostValidateRoute (
    @parameter.query('id') @validator.required id: string,
    ctx: ControllerContext
  ) {
    ctx.body = id;
  }
}