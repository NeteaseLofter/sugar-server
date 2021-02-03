import {
  Controller,
  router,
  parameter,
  validator,
  Config
} from '../../../../../src';



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

  @router.PostRoute('/post-parameter-body-path')
  @parameter.getter
  @validator.validate
  testPostParameterBodyPathRoute (
    @parameter.body('id')
    id: number,
    @parameter.body('name')
    name: string
  ) {
    return `${typeof id} ${id} ${typeof name} ${name}`;
  }

  @router.PostRoute('/post-parameter-json-path')
  @parameter.getter
  @validator.validate
  testPostParameterJSONPathRoute (
    @parameter.bodyJSON('id')
    id: number,
    @parameter.bodyJSON('name')
    name: string
  ) {
    return `${typeof id} ${id} ${typeof name} ${name}`;
  }

  @router.PostRoute('/post-parameter-form-path')
  @parameter.getter
  @validator.validate
  testPostParameterFormPathRoute (
    @parameter.bodyFormData('id')
    id: string,
    @parameter.bodyFormData('name')
    name: string
  ) {
    return `${typeof id} ${id} ${typeof name} ${name}`;
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
