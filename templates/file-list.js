const fs = require('fs');
const path = require('path');
const { html, map } = require('flora-tmpl');
const streamArray = require('stream-array');
const cn = require('classnames');

const CONFIG = require('../config');
const getFileSize = require('../core/file-size');

const css = fs.readFileSync(path.join(CONFIG.PUBLIC, 'style.css'), 'utf-8') || '';
const js = fs.readFileSync(path.join(CONFIG.PUBLIC, 'script.js'), 'utf-8') || '';

function fileListTemplate(title, rootPath, fileList, viewType) {
  const list = streamArray(fileList);
  viewType = !!viewType ? viewType : 'grid';
  rootPath = rootPath === '/' ? '' : rootPath;

  return html`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <meta http-equiv="X-UA-Compatible" content="ie=edge"/>
        <link rel="icon" href="https://irroc.umd.edu/binaries/thumbnail/content/gallery/irroc/file17.png" />
        <style>${css}</style>
        <title>${title}</title>
      </head>
      <body>
        <form class="toolbar">
          <div class="container">
            <div class="toolbar__inner">
              <h1 class="toolbar__title">
                <a href="/?view=${viewType}" class="toolbar__link">File Manager</a>
              </h1>
              <label class="toolbar__item btn">
                <input class="visuallyhidden" type="file" name="file" />
                <svg width="24" height="24" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
                </svg>
                <span>add file</span>
              </label>
              ${['grid', 'list'].map(type => (`
                <button
                  class="${cn(
                    'toolbar__item',
                    'btn',
                    { 'btn_active': type === viewType }
                  )}"
                  name="view"
                  value="${type}"
                  ${type === viewType ? 'disabled' : ''}
                >
                  ${type}
                </button>
                `))}
            </div>
          </div>
        </form>
        <div class="container">
          <ul
            class="${cn(
              'list',
              { [`list_type_${viewType}`]: viewType }
            )}"
          >
            ${map(list, item => (
              html`
                <li class="list__item">
                  <div
                    class="${cn(
                      'card',
                      {
                        [`card_type_${item.isDirectory ? 'folder' : 'file'}`]: true,
                        [`card_view_${viewType}`]: viewType
                      }
                    )}"
                  >
                    <svg class="card__icon" width="42" height="54">
                      <polygon
                        transform="translate(1, 1)"
                        points="0,0 30,0 40,10 40,52 0,52"
                      />
                    </svg>
                    <h4 class="card__title">
                      <a
                        href="${rootPath}/${item.name}?view=${viewType}"
                        class="card__link"
                      >${item.name}</a>
                    </h4>
                    <div class="card__meta">${getFileSize(item.size)}</div>
                    ${!item.isDirectory
                      ? `
                        <button
                          class="card__delete"
                          title="delete file"
                          name="delete"
                          value="${rootPath}/${item.name}">
                          <svg width="24" height="24" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
                          </svg>
                        </button>
                      `
                      : null
                    }
                  </div>
                </li>
              `
            ))}
          </ul>
        </div>
        <script>${js}</script>
      </body>
    </html>
  `;
}

module.exports = fileListTemplate;