import chai from 'chai';
import { request } from './helpers/request';

export default function () {
  return describe('router', () => {
    it ('should GET Route is able', async () => {
      const { res, body } = await request('http://127.0.0.1:9527/router-test/get')
      chai.expect(res.statusCode).to.equal(200);
      chai.expect(body).to.equal('get');
    })

    it ('should POST Route is able', async () => {
      const { res, body } = await request({
        hostname: '127.0.0.1',
        port: 9527,
        path: '/router-test/post',
        method: 'POST'
      })
      chai.expect(res.statusCode).to.equal(200);
      chai.expect(body).to.equal('post');
    })

    it ('should PUT Route is able', async () => {
      const { res, body } = await request({
        hostname: '127.0.0.1',
        port: 9527,
        path: '/router-test/put',
        method: 'PUT'
      })
      chai.expect(res.statusCode).to.equal(200);
      chai.expect(body).to.equal('put');
    })

    it ('should DELETE Route is able', async () => {
      const { res, body } = await request({
        hostname: '127.0.0.1',
        port: 9527,
        path: '/router-test/del',
        method: 'DELETE'
      })
      chai.expect(res.statusCode).to.equal(200);
      chai.expect(body).to.equal('del');
    })

    it ('should All Route reply GET method is able', async () => {
      let data = await request({
        hostname: '127.0.0.1',
        port: 9527,
        path: '/router-test/all',
        method: 'GET'
      })
      chai.expect(data.res.statusCode).to.equal(200);
      chai.expect(data.body).to.equal('all:GET');
    })

    it ('should All Route reply POST method is able', async () => {
      let data = await request({
        hostname: '127.0.0.1',
        port: 9527,
        path: '/router-test/all',
        method: 'POST'
      })
      chai.expect(data.res.statusCode).to.equal(200);
      chai.expect(data.body).to.equal('all:POST');
    })
  })
}