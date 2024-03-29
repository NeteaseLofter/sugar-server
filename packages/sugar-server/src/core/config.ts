export class Config {
  _configs: any;

  constructor () {
    this._configs = {};
  }

  get (path: string) {
    let result = this._configs[path];
    // if (!result) {
    //   let objResult;
    //   let configs = this._configs;
    //   let childPath = path + '.';
    //   Object.keys(this._configs).forEach((configKey) => {
    //     if (configKey.indexOf(childPath) === 0) {

    //     }
    //   })
    // }
    return result;
  }

  add (json: any) {
    if (!json) return;
    Object.assign(this._configs, this.flat(json));
  }

  flat (json: any, path?: string) {
    return Object.keys(json).reduce((flattened, key) => {
      let data = json[key];
      let childPath = path ? `${path}.${key}` : key;
      if (
        typeof data === 'object'
        && !Array.isArray(data)
        && data !== null
      ) {
        Object.assign(flattened, this.flat(data, childPath))
      } else  {
        flattened[childPath] = data;
      }
      return flattened;
    }, {} as any)
  }
}

// export default new Config();
