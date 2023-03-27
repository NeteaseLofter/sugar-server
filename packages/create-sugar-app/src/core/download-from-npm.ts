import http from 'http';
import https from 'https';
import packageJson from 'package-json';
import tar from 'tar';

import * as logger from '../shared/logger';


export async function getPackageZipUrl (packageName: string) {
  const packageInfo = await packageJson(packageName);
  return (packageInfo as any).dist.tarball;
}


export async function downloadFromNpm (
  targetDir: string,
  packageName: string,
) {
  const url = await getPackageZipUrl(packageName)

  const urlObj = new URL(url);
  logger.log(`will download ${url}`);
  return new Promise<void>((resolve, reject) => {
    const req = https.request(
      {
        method: 'GET',
        host: urlObj.host,
        hostname: urlObj.hostname,
        path: urlObj.pathname,
      },
      (res) => {
        res.pipe(
          tar.extract(
            {
              strip: 1,
              C: targetDir,
            },
            [],
            (error) => {
              if (error) {
                logger.error(error);
                reject(error)
              } else {
                logger.log('download success');
                resolve();
              }
            }
          )
        );
      }
    );

    req.end();
  })
}
