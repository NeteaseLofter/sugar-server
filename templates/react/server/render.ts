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
    <div id="application"></div>
    ${data.scriptHTML.main}
  </body>
  </html>`;
}

export default htmlRender;