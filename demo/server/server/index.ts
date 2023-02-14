import path from 'path';
import {
  Application
} from 'sugar-server';

import {
  StaticController
} from 'sugar-server-utils';

import * as Controllers from './controllers';


class Client1App extends Application {
  constructor (...args: ConstructorParameters<typeof Application>) {
    super(...args)

    this.useController(
      StaticController.createStaticController({
        staticResourcesPath: path.resolve(
          process.env.SUGAR_PROJECT_ROOT || '',
          './resources'
        ),
        prefix: '/static'
      })
    )

    Object.keys(Controllers).forEach((controllerKey) => {
      this.useController(
        (Controllers as any)[controllerKey]
      )
    })
  }
}

const app = new Client1App();
app.listen(9000, () => {
  console.log('start server on 9000')
});

// export default Client1App;
