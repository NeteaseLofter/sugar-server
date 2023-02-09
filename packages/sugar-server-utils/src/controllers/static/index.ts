import send from 'koa-send';

import {
  router,
  parameter,
  Controller
} from 'sugar-server';

const { GetRoute } = router;

export function createStaticController ({
  staticResourcesPath,
  prefix = '/'
}: {
  staticResourcesPath: string,
  prefix?: string;
}): typeof Controller {
  class StaticController extends Controller {
    static prefix = prefix;

    @GetRoute('*')
    @parameter.getter
    async status (
      @parameter.Context ctx: any
    ) {
      const routerPath = ctx.routerPath || ctx.path || ctx.originalUrl;
      const filePath = routerPath.substr(prefix.length);

      if (filePath) {
        await send(
          ctx,
          filePath,
          {
            root: staticResourcesPath,
            maxAge: 86400000
          });
      }
    }
  }

  return StaticController;
}
