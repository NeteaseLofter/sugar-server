import {
  Controller,
  logger
} from 'sugar-server';

export type RenderEntries = string | string[] | {[key: string]: string | string[]};

type FilePath = string;

// discuss：需要string[] 吗？
export type RegisterFilePath = FilePath | {[key: string]: FilePath}


export type EntryHTML = {
  [htmlType: string]: string;
};

export type EntriesHTML = {
  [key: string]: EntryHTML;
  main: EntryHTML;
};

export type CustomRender<C = any> = (
  this: Controller,
  data: {
    entries: RenderEntries,
    entriesHTML: EntriesHTML,
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
  return `<!DOCTYPE html><head><title>${custom?.title || ''}</title>${custom?.head || ''}${data.entriesHTML.main.styleHTML}</head><body>${custom?.body || ''}${data.entriesHTML.main.scriptHTML}</body></html>`;
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

const SCRIPT_TEMPLATE = '<script src={url}></script>';
const STYLE_TEMPLATE = '<link rel="stylesheet" type="text/css" href="{url}" />';


export function transformEntryToHTML (
  entries: string | string[],
) {
  let styleHTML: string[] = [];
  let scriptHTML: string[] = [];
  if (typeof entries === 'string') {
    if (entries.endsWith('.css')) {
      styleHTML.push(STYLE_TEMPLATE.replace('{url}', entries));
    }

    if (entries.endsWith('.js')) {
      scriptHTML.push(SCRIPT_TEMPLATE.replace('{url}', entries));
    }
  } else {
    entries
      .forEach((url) => {
        if (url.endsWith('.css')) {
          styleHTML.push(STYLE_TEMPLATE.replace('{url}', url));
        }

        if (url.endsWith('.js')) {
          scriptHTML.push(SCRIPT_TEMPLATE.replace('{url}', url));
        }
      });
  }

  return {
    styleHTML: styleHTML.join(''),
    scriptHTML: scriptHTML.join('')
  };
}


export function resolveHTML (
  entries: RenderEntries
) {
  let entriesHTML: EntriesHTML = {
    main: {}
  };
  if (
    typeof entries === 'string'
    || Array.isArray(entries)
  ) {
      entriesHTML.main = transformEntryToHTML(
        entries
      );
  } else {
    Object.keys(entries).forEach((entry) => {
      entriesHTML[entry] = transformEntryToHTML(
        entries[entry]
      );
    })
  }

  return entriesHTML;
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
          entriesHTML: resolveHTML(
            entries
          ),
        },
        oldResult
      );
    }
  }
}

