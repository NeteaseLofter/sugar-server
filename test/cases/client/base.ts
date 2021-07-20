import chai from 'chai';
import {
  server
} from './server';
import { request } from './helpers/request';

export default function () {
  return describe('base', () => {
    it ('should 404', async () => {
      const { res, body } = await request('http://127.0.0.1:9527/404')
      chai.expect(res.statusCode).to.equal(404);
      chai.expect(body).to.equal('Not Found');
    })

    it ('should catch server-error', async () => {
      let serverCatchErr;
      const errorListener = (err, ctx, app) => {
        serverCatchErr = err;
      };
      server.on('appError', errorListener)
      const { res, body } = await request('http://127.0.0.1:9527/server-error')
      chai.expect(res.statusCode).to.equal(500);
      chai.expect(body).to.equal(JSON.stringify({
        code: 500,
        message: 'Server Error'
      }));
      chai.expect(serverCatchErr.statusCode).to.equal(500);
      chai.expect(serverCatchErr.name).to.equal('SugarServerError');
      chai.expect(serverCatchErr.message).to.equal('Server Error');
      server.off('appError', errorListener)
    })

    it ('should custom-controller-middleware', async () => {
      const { res, body } = await request('http://127.0.0.1:9527/custom-controller-middleware')
      chai.expect(res.statusCode).to.equal(200);
      chai.expect(body).to.equal('from custom message');
    })
  })
}