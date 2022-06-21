declare module 'babel-loader' {}

declare module 'webpack-manifest-plugin' {
  export class WebpackManifestPlugin {
    constructor (options: any);
    apply: any
  }
}
