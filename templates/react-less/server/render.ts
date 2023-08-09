import {
  render
} from 'sugar-server-utils'

const htmlRender: render.CustomRender = function (
  data,
  custom
) {
  console.log(data);
  return `<!DOCTYPE html>
  <head>
    <title>${custom.title}</title>
    ${data.entriesHTML.main.styleHTML}
  </head>
  <body>
    <div id="application"></div>
    ${data.entriesHTML.main.scriptHTML}
  </body>
  </html>`;
}

export default htmlRender;