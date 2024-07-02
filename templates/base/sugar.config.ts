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
    entry: './server/index.ts',
    render: './server/render.ts',
    browserEntryKey: process.env.BUILD_ENV !== 'development'
      ? 'browser_{basename}_{hash:16}'
      : undefined
  }
}

export const browserWebpackConfig: SugarScriptsProject.BrowserWebpackConfig = (
  webpackChainConfig
) => {
  webpackChainConfig.output.publicPath('/static')
}
