import path from 'path';
import {
  Application,
  Controller,
  ControllerContext
} from 'sugar-server';

import {
  CustomRender
} from '../custom-config.type';

export const ENTRIES_KEY = Symbol('_sugar_entries');
export const ENTRIES_CONFIG_KEY = Symbol('_sugar_entries_config');

export interface EntryConfig {
  filePath: string
}

export interface EntriesController extends Controller {
  [ENTRIES_KEY]: EntryConfig[]
}

const defaultRender: CustomRender = (
  ctx,
  entries,
  custom
) => {
  return entries.toString();
}

const render: CustomRender = (
  ...args
) => {
  let currentRender = defaultRender;
  console.log('SUGAR_PROJECT_RENDER', process.env.SUGAR_PROJECT_RENDER)
  if (process.env.SUGAR_PROJECT_RENDER) {
    try {
      currentRender = require(process.env.SUGAR_PROJECT_RENDER).default;
      console.log('load custom render success');
    } catch (e) {}
  }
  return currentRender(
    ...args
  )
}

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
      ctx: ControllerContext,
      ...args: any
    ) {
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

      return render(
        ctx,
        entries,
        oldResult
      );
    }
  }
}

export const ENTRY_WEBPACK_INJECT_KEY = 'ENTRY_WEBPACK_INJECT_KEY';

export const ENV_ENTRIES = (process.env.SUGAR_PROJECT_ENTRIES || {}) as {
  [entryKey: string]: string[]
};

export function getEntryUrl (
  filePath: string
) {
  return '';
}

export function getEntries (
  dirname: string
) {
 let entries = {};

 require(
   path.resolve(
     dirname,
     ''
   )
 )
}

export function getEntriesFromController (
  ControllerClass: typeof Controller
) {
  return (ControllerClass.prototype as EntriesController)[ENTRIES_KEY] || [];
  // return (controller as EntriesController)[ENTRIES_KEY] || [];
}

export function getEntriesFromControllers (
  Controllers: (typeof Controller)[],
  root: string
) {
  const entries: {
    [key: string]: string
  } = {};
  Controllers.forEach(
    (ControllerClass) => {
      getEntriesFromController(ControllerClass).forEach(({ filePath }) => {
        entries[filePath] = path.resolve(
          root,
          filePath
        )
      })
    }
  )
  return entries;
}

export function getEntriesFromApplicationClass (
  ApplicationClass: typeof Application,
  root: string
) {
  const app = new ApplicationClass();
  return getEntriesFromControllers(
    app.Controllers,
    root
  )
}