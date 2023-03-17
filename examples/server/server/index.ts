import path from 'path';
import {
  Application
} from 'sugar-server';

import {
  StaticController
} from 'sugar-server-utils';

import * as Controllers from './controllers';


console.log(
  path.relative(
    process.env.SUGAR_SERVER_DIR || '',
    process.env.SUGAR_BROWSER_DIR || ''
  )
)
class App extends Application {
  static Controllers = [
    StaticController.createStaticController({
      staticResourcesPath: path.resolve(
        __dirname,
        path.relative(
          process.env.SUGAR_SERVER_DIR || '',
          process.env.SUGAR_BROWSER_DIR || ''
        )
      ),
      prefix: '/static'
    }),
    ...Object.keys(Controllers).map((controllerKey) => (Controllers as any)[controllerKey])
  ];
}

const app = new App();
app.listen(9000, () => {
  console.log('start server on 9000')
});

// export default Client1App;
