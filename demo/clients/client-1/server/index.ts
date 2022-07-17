import {
  Application
} from 'sugar-server';

import * as Controllers from './controllers';


class Client1App extends Application {
  static path = '/client-1';

  constructor (...args: ConstructorParameters<typeof Application>) {
    super(...args)

    Object.keys(Controllers).forEach((controllerKey) => {
      this.useController(
        (Controllers as any)[controllerKey]
      )
    })
  }
}

export default Client1App;
