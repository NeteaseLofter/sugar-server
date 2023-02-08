import {
  SugarScriptsProject
} from 'sugar-scripts';


export const packageConfig: SugarScriptsProject.PackageConfig = {
  browser: {
    output: '../resources/clients/client-1'
  },
  server: {
    output: './dist',
    entry: './server/index.ts',
    render: './server/render.ts',
  }
}

export const browserWebpackConfig: SugarScriptsProject.BrowserWebpackConfig = (
  webpackChainConfig
) => {
  webpackChainConfig.output.publicPath('/static/clients/client-1')
}
