import chai from 'chai';
import { request } from './helpers/request';

export default function () {
  return describe('validator', () => {
    it ('should throw required error', async () => {
      const { res, body } = await request({
        hostname: '127.0.0.1',
        port: 9527,
        path: '/test/query-validate',
        method: 'GET'
      })
      chai.expect(res.statusCode).to.equal(400);
      chai.expect(body).to.equal('{"code":400,"message":"param [0] is required"}');
    })

    it ('should pass', async () => {
      const { res, body } = await request({
        hostname: '127.0.0.1',
        port: 9527,
        path: '/test/query-validate?id=1',
        method: 'GET'
      })
      chai.expect(res.statusCode).to.equal(200);
      chai.expect(body).to.equal('1');
    })

    it ('should throw number type error', async () => {
      const { res, body } = await request({
        hostname: '127.0.0.1',
        port: 9527,
        path: '/test/post-validate',
        method: 'POST',
        headers: {
          'Content-type': 'application/json'
        }
      }, JSON.stringify({
        id: 'id-aaa',
        name: 'name-Huey',
        tags: ['tag1', 'tag2']
      }))
      chai.expect(res.statusCode).to.equal(400);
      chai.expect(body).to.equal('{"code":400,"message":"param [0] id-aaa not number"}');
    })

    it ('should throw string type error', async () => {
      const { res, body } = await request({
        hostname: '127.0.0.1',
        port: 9527,
        path: '/test/post-validate',
        method: 'POST',
        headers: {
          'Content-type': 'application/json'
        }
      }, JSON.stringify({
        id: 123,
        name: 567,
        tags: ['tag1', 'tag2']
      }))
      chai.expect(res.statusCode).to.equal(400);
      chai.expect(body).to.equal('{"code":400,"message":"param [1] 567 not string"}');
    })

    it ('should throw array type error', async () => {
      const { res, body } = await request({
        hostname: '127.0.0.1',
        port: 9527,
        path: '/test/post-validate',
        method: 'POST',
        headers: {
          'Content-type': 'application/json'
        }
      }, JSON.stringify({
        id: 123,
        name: 'name-Huey',
        tags: 'tag1'
      }))
      chai.expect(res.statusCode).to.equal(400);
      chai.expect(body).to.equal('{"code":400,"message":"param [2] tag1 not array"}');
    })

    it ('should throw array value type error', async () => {
      const { res, body } = await request({
        hostname: '127.0.0.1',
        port: 9527,
        path: '/test/post-validate',
        method: 'POST',
        headers: {
          'Content-type': 'application/json'
        }
      }, JSON.stringify({
        id: 123,
        name: 'name-Huey',
        tags: ['tag1', 123]
      }))
      chai.expect(res.statusCode).to.equal(400);
      chai.expect(body).to.equal('{"code":400,"message":"param [2-1] 123 not string"}');
    })

    it ('should async validate success', async () => {
      const { res, body } = await request({
        hostname: '127.0.0.1',
        port: 9527,
        path: '/test/async-validate',
        method: 'POST',
        headers: {
          'Content-type': 'application/json'
        }
      }, JSON.stringify({
        name: 'error'
      }))
      chai.expect(res.statusCode).to.equal(400);
      chai.expect(body).to.equal('{"code":400,"message":"name must be success"}');

      const { res: res2, body: body2 } = await request({
        hostname: '127.0.0.1',
        port: 9527,
        path: '/test/async-validate',
        method: 'POST',
        headers: {
          'Content-type': 'application/json'
        }
      }, JSON.stringify({
        name: 'success'
      }))
      chai.expect(res2.statusCode).to.equal(200);
      chai.expect(body2).to.equal('success true');
    })
  })
}