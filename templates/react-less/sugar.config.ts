import {
  SugarScriptsProject
} from 'sugar-scripts';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';


export const packageConfig: SugarScriptsProject.PackageConfig = {
  cacheDir: './.sugar-cache',
  browser: {
    output: './build/dist'
  },
  server: {
    output: './build/server',
    entry: './server/index.ts',
    render: './server/render.ts',
  }
}

export const browserWebpackConfig: SugarScriptsProject.BrowserWebpackConfig = (
  webpackChainConfig
) => {
  webpackChainConfig.output.publicPath('/static')

  webpackChainConfig
    .plugin('MiniCssExtractPlugin')
    .use(
      MiniCssExtractPlugin,
      [{
        filename: webpackChainConfig.get('mode') === 'development'
          ? '[name].css'
          : '[name].[contenthash].css'
      }]
    )
    .end();

  webpackChainConfig.module.rule('moduleCSS')
    .test(/^(?!(.*?extract|.*?\.global)).*?\.(css|less)/)
    .exclude
    .add(/node_modules/)
    .end()
    .use('extract-loader')
    .loader(MiniCssExtractPlugin.loader)
    .options({
      esModule: true,
    })
    .end()
    .use('css-loader')
    .loader('css-loader')
    .options({
      modules: {
        localIdentName:
          process.env.NODE_ENV === 'development'
            ? '[path][name]__[local]--[hash:base64]'
            : '[hash:base64]',
      }
    })
    .end()
    .use('less-loader')
    .loader('less-loader')
    .end();
}
