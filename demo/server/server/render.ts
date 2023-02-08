import {
  EntryDecorator
} from 'sugar-server-utils'

const render: EntryDecorator.CustomRender = function (
  entries,
  custom
) {
  console.log('custom render', this.context.url);
  console.log(entries, custom);
  let scripts = '';
  if (typeof entries === 'string') {
    scripts = `<script src=${entries}></script>`
  } else if (Array.isArray(entries)) {
    scripts = entries.map((url) => `<script src=${url}></script>`).join('')
  }
  return `
    <h1>Hello, entries:</h1>
    ${scripts}
  `
}

export default render;