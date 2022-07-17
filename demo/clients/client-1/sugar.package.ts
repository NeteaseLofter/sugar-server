import {
  SugarScriptsProject
} from 'sugar-scripts';


export const packageConfig: SugarScriptsProject.PackageConfig = {
  browser: {
    input: './server/index.ts',
    output: '../../resources/client-1'
  },
  server: {
    dll: true,
    output: './dist',
    entry: './server/index.ts'
  }
}

export const browserWebpackConfig: SugarScriptsProject.BrowserWebpackConfig = (
  webpackChainConfig
) => {
  webpackChainConfig.output.publicPath('/static/clients/client-1')
}
