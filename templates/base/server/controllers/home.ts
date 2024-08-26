import {
  Controller,
  router,
  parameter
} from 'sugar-server';
import {
  render
} from 'sugar-server-utils';

import HomePageView from '../../browser/home';


export class HomeController extends Controller {
  @router.GetRoute('/')
  @parameter.getter
  @render.register(HomePageView)
  home () {
    return {
      title: 'welcome',
      name: '张三'
    };
  }

  @router.GetRoute('/test')
  @parameter.getter
  @render.register(HomePageView)
  test () {
    return {
      title: 'welcome',
      prefix: '你好',
      name: '张三'
    };
  }
}
