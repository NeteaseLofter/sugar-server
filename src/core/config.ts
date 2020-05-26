export default class Config {
  _configs: any;

  constructor () {
    this._configs = {};
  }

  get (path: string) {
    return this._configs[path];
  }

  add (json: any) {
    if (!json) return;
    Object.assign(this._configs, this.flat(json));
  }

  flat (json: any, path?: string) {
    return Object.keys(json).reduce((flattened, key) => {
      let data = json[key];
      let childPath = path ? `${path}.${key}` : key;
      if (typeof data === 'string' || typeof data === 'number' || Array.isArray(data)) {
        flattened[childPath] = data;
      } else {
        Object.assign(flattened, this.flat(data, childPath))
      }
      return flattened;
    }, {} as any)
  }
}

// export default new Config();
