import {
  SugarScriptsProject
} from 'sugar-scripts';


export const packageConfig: SugarScriptsProject.PackageConfig = {
  server: {
    output: './dist',
    entry: './server/index.ts',
    render: './server/render.ts'
  }
}

export const serverWebpackConfig: SugarScriptsProject.ServerWebpackConfig = (
  webpackChainConfig
) => {
  console.log('serverWebpackConfig run')
  // xxx
}
