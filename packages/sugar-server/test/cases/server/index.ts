import chai from 'chai';

import {
  createApplication,
  createServer,
  Controller
} from '../../../src';

export function runServerCases () {
  let stop;
  describe('sugar-server', function () {
    it('should controller can get app in constructor', () => {
      let appParam, thisApp;
      class TestAppAttr extends Controller {
        constructor (app: any) {
          super(app);

          appParam = app;
          thisApp = this.app;
        }
      }

      const testApp = createApplication(
        [],
        {
          TestAppAttr: TestAppAttr
        }
      );
      chai.expect(appParam).to.equal(testApp);
      chai.expect(thisApp).to.equal(testApp);
    })

    it('should server config can got in app', () => {
      const testApp = createApplication(
        [],
        {}
      );

      const server = createServer(
        { server: { port: 10010 }, abc: 1 },
        [
          {
            application: testApp
          }
        ]
      );

      chai.expect(
        testApp.config.get('sugarServer.abc')
      ).to.equal(1);

      server.server.close();
    })
  })
}
