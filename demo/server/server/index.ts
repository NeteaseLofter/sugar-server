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
        staticResourcesPath: '../../resources',
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

export default Client1App;
