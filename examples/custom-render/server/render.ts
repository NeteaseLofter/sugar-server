import {
  render
} from 'sugar-server-utils'

const htmlRender: render.CustomRender = function (
  data,
  custom
) {
  return `<!DOCTYPE html>
  <head>
    <title>${custom.title}</title>
  </head>
  <body>
    <h1>${custom.prefix || 'Welcome'}, <span id="name">${custom.name}</span></h1>
    <button id="btn">换个名字</button>
    ${data.scriptHTML.main}
  </body>
  </html>`;
}

export default htmlRender;