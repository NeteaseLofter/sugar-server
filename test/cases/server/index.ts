import chai from 'chai';

import {
  createApplication,
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
  })
}
