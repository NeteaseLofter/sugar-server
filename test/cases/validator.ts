import chai from 'chai';
import { request } from '../helpers/request';

export default function () {
  return describe('validator', () => {
    it ('should throw error', async () => {
      const { res, body } = await request({
        hostname: '127.0.0.1',
        port: 9527,
        path: '/test/post-validate',
        method: 'GET'
      })
      chai.expect(res.statusCode).to.equal(200);
    })

    it ('should pass', async () => {
      const { res, body } = await request({
        hostname: '127.0.0.1',
        port: 9527,
        path: '/test/post-validate?id=1',
        method: 'GET'
      })
      chai.expect(res.statusCode).to.equal(200);
      chai.expect(body).to.equal('1');
    })
  })
}