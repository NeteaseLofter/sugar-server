import path from 'path';
import {
  Application,
  Controller,
  ControllerContext
} from 'sugar-server';

export type CustomRender<C = any> = (
  this: Controller,
  entries: string[] | {[key: string]: string[]},
  custom: C
) => string;

export const ENTRIES_KEY = Symbol('_sugar_entries');
export const ENTRIES_CONFIG_KEY = Symbol('_sugar_entries_config');

export interface EntryConfig {
  filePath: string
}

export interface EntriesController extends Controller {
  [ENTRIES_KEY]: EntryConfig[]
}

const defaultRender: CustomRender = function (
  this: Controller,
  entries,
  custom
) {
  return entries.toString();
}

const render: CustomRender = (() => {
  let currentRender = defaultRender;
  console.log('SUGAR_PROJECT_RENDER', process.env.SUGAR_PROJECT_RENDER)
  if (process.env.SUGAR_PROJECT_RENDER) {
    try {
      currentRender = require(process.env.SUGAR_PROJECT_RENDER).default;
      console.log('load custom render success');
    } catch (e) {}
  }
  return currentRender;
})()

// discuss：需要string[] 吗？
export type RegisterFilePath = string | {[key: string]: string}

export function register (
  filePath: RegisterFilePath
) {
  return function (
    target: Controller,
    key: string,
    descriptor: PropertyDescriptor
  ) {
    if (!Object.getOwnPropertyDescriptor(target, ENTRIES_KEY)) {
      Object.defineProperty(target, ENTRIES_KEY, {
        configurable: true,
        enumerable: false,
        writable: true,
        value: []
      })
    }

    if (typeof filePath === 'string') {
      (target as EntriesController)[ENTRIES_KEY].push({
        filePath
      })
    } else {
      Object.keys(filePath).forEach((filePathKey) => {
        const oneFilePath = filePath[filePathKey];
        (target as EntriesController)[ENTRIES_KEY].push({
          filePath: oneFilePath
        })
      })
    }

    const oldValue = descriptor.value;
    descriptor.value = async function (
      this: Controller,
      ...args: any
    ) {
      const ctx: ControllerContext = this.context;
      // ctx.app
      let oldResult;
      if (oldValue) {
        oldResult = await oldValue.call(this, ...args);
      }

      let envEntries = ENV_ENTRIES;
      if (
        (ctx.app.constructor as any).ENTRIES
      ) {
        envEntries = (ctx.app.constructor as any).ENTRIES;
      }
      console.log('envEntries', envEntries, ENV_ENTRIES )

      let entries: string[] | {[key: string]: string[]} = [];
      if (typeof filePath === 'string') {
        entries = envEntries[filePath] || [];
      } else {
        entries = Object.keys(filePath).reduce((
          currentEntries,
          filePathKey
          ) => {
            const oneFilePath = filePath[filePathKey];
            currentEntries[filePathKey] = envEntries[oneFilePath];
            return currentEntries;
          }, {} as {[key: string]: string[]})
      }

      console.log(
        'will search file',
        envEntries,
        filePath,
        entries
      )

      return render.call(
        this,
        entries,
        oldResult
      );
    }
  }
}

export const ENV_ENTRIES = (process.env.SUGAR_PROJECT_ENTRIES || {}) as {
  [entryKey: string]: string[]
};
