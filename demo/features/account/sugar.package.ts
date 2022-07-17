import {
  SugarScriptsProject
} from 'sugar-scripts';

export const packageConfig: SugarScriptsProject.PackageConfig = {
  browser: {
    dll: true,
    entry: {
      "a": ["./browser/a"],
      "b": ["./browser/b"]
    },
    output: '../../resources/features/account'
  }
}

export const browserWebpackConfig: SugarScriptsProject.BrowserWebpackConfig = (
  webpackChainConfig
) => {
  webpackChainConfig.output.publicPath('/static/features/account')
}