import {
  Controller,
  router,
  parameter,
  validator,
  Config,
  ControllerContext
} from '../../../src';



export class TestController extends Controller {
  static prefix = '/test';

  @router.PostRoute('/post-parameter/:id')
  @parameter.getter
  testPostParameterRoute (
    @parameter.params('id') id: string,
    @parameter.query('q') q: string,
    @parameter.header('x-custom') x: string
  ) {
    // console.log(ctx.request.body);
    return `id:${id};q:${q};x:${x}`;
  }

  @router.PostRoute('/post-parameter-body')
  @parameter.getter
  testPostParameterJSONBodyRoute (
    @parameter.body() body: any
  ) {
    return JSON.stringify(body.a);
  }

  @router.PostRoute('/post-parameter-form')
  @parameter.getter
  testPostParameterFormBodyRoute (
    @parameter.body() body: any
  ) {
    return `${body.f1};${body.f2}`;
  }

  @router.GetRoute('/get-parameter-config')
  @parameter.getter
  testGetParameterConfigRoute (
    @parameter.config
    config: Config,
    @parameter.config('b.c')
    bc: number
  ) {
    return `${config.get('a')};${bc}`;
  }


  @router.GetRoute('/post-validate')
  @parameter.getter
  @validator.validate
  testPostValidateRoute (
    @parameter.query('id')
    @validator.required
    id: string
  ) {
    return id;
  }
}