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
  if (process.env.SUGAR_PROJECT_RENDER) {
    try {
      currentRender = require(process.env.SUGAR_PROJECT_RENDER).default;
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
      let oldResult;
      if (oldValue) {
        oldResult = await oldValue.call(this, ...args);
      }
      const appEntries: {
        [entryKey: string]: string[]
      } = (ctx.app as any).entries || {};
      let entries: string[] | {[key: string]: string[]};
      if (typeof filePath === 'string') {
        entries = appEntries[filePath];
      } else {
        entries = Object.keys(filePath).reduce((
          currentEntries,
          filePathKey
          ) => {
            const oneFilePath = filePath[filePathKey];
            currentEntries[filePathKey] = appEntries[oneFilePath];
            return currentEntries;
          }, {} as {[key: string]: string[]})
      }

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
  controller: Controller
) {
  return (controller as EntriesController)[ENTRIES_KEY] || [];
}

export function getEntriesFromControllers (
  controllers: {
    [key: string]: Controller
  },
  root: string
) {
  const entries: {
    [key: string]: string
  } = {};
  Object.values(controllers).forEach(
    (controller) => {
      getEntriesFromController(controller).forEach(({ filePath }) => {
        entries[filePath] = path.join(
          root,
          filePath
        )
      })
    }
  )
  return entries;
}


// export function getEntriesFromControllerClass (
//   ControllerClass: typeof Controller
// ) {
//   new Application([], [])
// }
