import {
  Controller,
  router,
  parameter
} from 'sugar-server';
import {
  entry
} from 'sugar-scripts';

export class HomeController extends Controller {
  @router.GetRoute('/')
  @entry.register('/browser/home.ts')
  @parameter.getter
  home () {
    console.log('render home')
    return {};
  }

  @router.GetRoute('/login')
  @entry.register('/browser/login.ts')
  login () {
    console.log('render login')
    return {};
  }
}
