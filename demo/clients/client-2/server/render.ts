import {
  SugarScriptsProject
} from 'sugar-scripts'

const render: SugarScriptsProject.CustomRender = (
  ctx,
  entries,
  custom
) => {
  console.log('custom render', ctx.url);
  let scripts = '';
  if (Array.isArray(entries)) {
    scripts = entries.map((url) => `<script src=${url}></script>`).join('')
  } else {
    // scripts = Object.keys(entries).map((url) => `<script src=${url}></script>`).join('')
  }
  return `
    <h1>Hello, entries:</h1>
    ${scripts}
  `
}

export default render;