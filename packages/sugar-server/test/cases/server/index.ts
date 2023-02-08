import chai from 'chai';

import {
  Application,
  Controller
} from '../../../src';

export function runServerCases () {
  let stop;
  describe('sugar-server', function () {
    it('should controller can get app in constructor', () => {
      class TestAppAttr extends Controller {}

      class TestApp extends Application {
        constructor () {
          super();

          this.useController(
            TestAppAttr
          )
        }
      };
      // chai.expect(appParam).to.equal(testApp);
      // chai.expect(thisApp).to.equal(testApp);
    })

    it('should server config can got in app', () => {
      class TestApp extends Application {
      };

      class Server extends Application {
      };

      // const server = createServer(
      //   { server: { port: 10010 }, abc: 1 },
      //   [
      //     {
      //       application: testApp
      //     }
      //   ]
      // );

      // // chai.expect(
      // //   testApp.config.get('sugarServer.abc')
      // // ).to.equal(1);

      // server.server.close();
    })
  })
}
