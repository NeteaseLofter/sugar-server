import http from 'http';

export function request (
  options: string|http.RequestOptions,
  postDate?: any
) {
  return new Promise<{
    reqClient: http.ClientRequest,
    res: http.IncomingMessage,
    body: any
  }>((resolve, reject) => {
    const reqClient = http.request(options, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        body = body + chunk;
      });
      res.on('end', () => {
        resolve({
          reqClient: reqClient,
          res: res,
          body: body
        })
      });
    });

    reqClient.on('error', (e) => {
      reject(e);
    });

    reqClient.write(postDate||'');
    reqClient.end();
  })
}

