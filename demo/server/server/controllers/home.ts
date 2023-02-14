import {
  Controller,
  router,
  parameter
} from 'sugar-server';
import {
  EntryDecorator
} from 'sugar-server-utils';

import HomePageView from 'sugar?browser-entry/../../browser/home';
import LoginPageView from 'sugar?browser-entry/../../browser/login';


export class HomeController extends Controller {
  @router.GetRoute('/')
  @parameter.getter
  @EntryDecorator.register(HomePageView)
  home () {
    console.log('render home333')
    return {};
  }

  @router.GetRoute('/login')
  @EntryDecorator.register(LoginPageView)
  login () {
    console.log('render login')
    return {};
  }
}
