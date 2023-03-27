import {
  Controller,
  router,
  parameter
} from 'sugar-server';
import {
  render
} from 'sugar-server-utils';

import HomePageView from 'sugar?browser-entry/../../browser/home';


export class HomeController extends Controller {
  @router.GetRoute('/')
  @parameter.getter
  @render.register(HomePageView)
  home () {
    return {
      title: 'welcome',
    };
  }
}
