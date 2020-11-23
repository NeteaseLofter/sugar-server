import chai from 'chai';
import { request } from './helpers/request';

export default function () {
  return describe('base', () => {
    it ('should 404', async () => {
      const { res, body } = await request('http://127.0.0.1:9527/xxxx/404')
      chai.expect(res.statusCode).to.equal(404);
      chai.expect(body).to.equal('Not Found');
    })
  })
}