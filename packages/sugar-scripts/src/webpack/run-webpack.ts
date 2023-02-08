import webpack from 'webpack';
import WebpackChainConfig from 'webpack-chain';


export const runWebpack = (
  chainConfig: WebpackChainConfig
) => {
  const compiler = webpack(
    chainConfig.toConfig()
  );

  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err || stats && stats.hasErrors()) {
        reject(err || stats?.toString())
        console.log(stats?.toString())
        return;
      }
      console.log(stats?.toString())
      resolve(stats)
    })
  })
}