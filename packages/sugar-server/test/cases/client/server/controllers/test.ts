import {
  Controller,
  router,
  parameter,
  validator,
  Config,
  SugarServerError
} from '../../../../../src';

const asyncValidator = validator.createParameterValidate((value, index, ctx) => {
  return new Promise((resolve, reject) => {
    if (value !== 'success') {
      throw new SugarServerError(
        400,
        `name must be success`,
        {
          statusCode: 400
        }
      );
    };
    ctx.name = value;
    return resolve(true);
  })
})

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

  @router.GetRoute('/get-parameter-cookie')
  @parameter.getter
  testGetParameterCookieRoute (
    @parameter.cookie('cookie1')
    cookie1?: string,

    @parameter.cookie('cookie2')
    cookie2?: string,

    @parameter.cookie('cookie3')
    cookie3?: string
  ) {
    return `cookie2 ${cookie2}; cookie1 ${cookie1}; cookie3 ${cookie3};`;
  }


  @router.GetRoute('/query-validate')
  @parameter.getter
  @validator.validate
  testQueryValidateRoute (
    @parameter.query('id')
    @validator.required
    id: string
  ) {
    return id;
  }

  @router.PostRoute('/post-validate')
  @parameter.getter
  @validator.validate
  testPostValidateRoute (
    @parameter.body('id')
    @validator.required
    @validator.number
    id: number,

    @parameter.body('name')
    @validator.string
    name: string,

    @parameter.body('tags')
    @validator.array(
      validator.string
    )
    tags: string[]
  ) {
    return `${id} ${name} ${tags.join(',')}`;
  }

  @router.PostRoute('/async-validate')
  @parameter.getter
  @validator.validate
  testAsyncValidateRoute (
    @parameter.body('name')
    @asyncValidator
    name: string,

    @parameter.Context
    ctx: any
  ) {
    return `${name} ${ctx.name === name}`;
  }
}
