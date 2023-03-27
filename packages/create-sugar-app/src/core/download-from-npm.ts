import https from 'https';
import packageJson from 'package-json';
import tar from 'tar';


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
            }
          )
        ).on('close', () => {
          resolve();
        })
      }
    );

    req.end();
  })
}
