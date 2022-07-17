import {
  Application
} from 'sugar-server';

import {
  appUtils
} from 'sugar-scripts'

import Client1App from '@clients/client-1';

class Client2App extends Application {
  constructor (...args: ConstructorParameters<typeof Application>) {
    super(...args)
    this.useApplication(
      Client1App
    )

    this.useController(
      appUtils.createStaticController({
        staticResourcesPath: '../../resources',
        prefix: '/static'
      })
    )
  }
}

export default Client2App;
