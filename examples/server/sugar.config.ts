import {
  SugarScriptsProject
} from 'sugar-scripts';


export const packageConfig: SugarScriptsProject.PackageConfig = {
  cacheDir: './.sugar-cache',
  browser: {
    output: './build/dist'
  },
  server: {
    output: './build/server',
    entry: './server/index.ts'
  }
}

export const browserWebpackConfig: SugarScriptsProject.BrowserWebpackConfig = (
  webpackChainConfig
) => {
  webpackChainConfig.output.publicPath('/static')
}
