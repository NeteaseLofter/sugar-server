import {
  Controller,
  logger
} from 'sugar-server';

export type RenderEntries = string | string[] | {[key: string]: string | string[]};
export type ScriptHTML = {
  [key: string]: string;
  main: string;
};
type FilePath = string;

// discuss：需要string[] 吗？
export type RegisterFilePath = FilePath | {[key: string]: FilePath}

export type CustomRender<C = any> = (
  this: Controller,
  data: {
    entries: RenderEntries,
    scriptHTML: ScriptHTML
  },
  custom: C
) => string;


export const ENV_ENTRIES = (process.env.SUGAR_PROJECT_ENTRIES || {}) as {
  [entryKey: string]: string[] | string;
};

const defaultRender: CustomRender = function (
  this: Controller,
  data,
  custom
) {
  return `<!DOCTYPE html><head><title>${custom?.title || ''}</title>${custom?.head || ''}</head><body>${custom?.body || ''}${data.scriptHTML.main}</body></html>`;
}

const render: CustomRender = (() => {
  let currentRender = defaultRender;
  if (process.env.SUGAR_PROJECT_RENDER) {
    try {
      currentRender = require(process.env.SUGAR_PROJECT_RENDER).default;
    } catch (e: any) {
      logger.error(e);
    }
    if (!currentRender) {
      logger.warn('load custom render failure.')
      logger.warn('use default render instead.')
      currentRender = defaultRender;
    }
  }
  return currentRender;
})()


export function transformEntryToScriptHTML (
  entries: string | string[]
) {
  let scriptHTML = '';
  if (typeof entries === 'string') {
    scriptHTML = `<script src=${entries}></script>`;
  } else {
    scriptHTML = entries.map((url) => `<script src=${url}></script>`).join('')
  }

  return scriptHTML;
}

export function resolveScriptHTML (
  entries: RenderEntries
) {
  let scripts: {
    main: string,
    [key: string]: string
  } = {
    main: ''
  };
  if (
    typeof entries === 'string'
    || Array.isArray(entries)
  ) {
    scripts.main = transformEntryToScriptHTML(entries);
  } else {
    Object.keys(entries).forEach((entry) => {
      scripts[entry] = transformEntryToScriptHTML(entries[entry]);
    })
  }

  return scripts;
}

export function register (
  filePath?: RegisterFilePath
) {
  return function (
    target: Controller,
    key: string,
    descriptor: PropertyDescriptor
  ) {
    const oldValue = descriptor.value;
    descriptor.value = async function (
      this: Controller,
      ...args: any
    ) {
      let oldResult;
      if (oldValue) {
        oldResult = await oldValue.call(this, ...args);
      }

      let envEntries = ENV_ENTRIES;

      let entries: string | string[] | {[key: string]: string | string[]} = [];
      if (typeof filePath === 'string') {
        entries = envEntries[filePath] || [];
      } else if (filePath) {
        entries = Object.keys(filePath)
          .reduce(
            (
              currentEntries,
              filePathKey
            ) => {
              const oneFilePath = filePath[filePathKey];
              currentEntries[filePathKey] = envEntries[oneFilePath];
              return currentEntries;
            },
            {} as {[key: string]: string | string[]}
          )
      }

      return render.call(
        this,
        {
          entries,
          scriptHTML: resolveScriptHTML(entries)
        },
        oldResult
      );
    }
  }
}

