import send from 'koa-send';

import {
  router,
  parameter,
  Controller,
  createApplication
} from 'sugar-server';

const { GetRoute } = router;

export function createStaticApplication ({
  staticResourcesPath
}: {
  staticResourcesPath: string
}) {
  class StaticController extends Controller {
    static prefix = '/';

    @GetRoute('*')
    @parameter.getter
    async status (
      @parameter.Context ctx: any
    ) {
      const routerPath = ctx.routerPath || ctx.path;
      const filePath = routerPath.substr(1);

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

  const staticApplication = createApplication(
    [],
    {
      StaticController
    }
  );

  staticApplication.createApply();

  return staticApplication;
}
