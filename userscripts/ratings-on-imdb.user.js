// ==UserScript==
// @name            Ratings on IMDb
// @name:it         Valutazioni su IMDb
// @author          Davide <iFelix18@protonmail.com>
// @namespace       https://github.com/iFelix18
// @icon            https://www.google.com/s2/favicons?sz=64&domain=imdb.com
// @description     Adds ratings from Rotten Tomatoes and Metacritic to IMDb
// @description:it  Aggiunge valutazioni da Rotten Tomatoes e Metacritic a IMDb
// @copyright       2021, Davide (https://github.com/iFelix18)
// @license         MIT
// @version         1.0.6
//
// @homepageURL     https://github.com/iFelix18/Userscripts#readme
// @supportURL      https://github.com/iFelix18/Userscripts/issues
// @updateURL       https://raw.githubusercontent.com/iFelix18/Userscripts/master/userscripts/meta/ratings-on-imdb.meta.js
// @downloadURL     https://raw.githubusercontent.com/iFelix18/Userscripts/master/userscripts/ratings-on-imdb.user.js
//
// @require         https://cdn.jsdelivr.net/gh/sizzlemctwizzle/GM_config@43fd0fe4de1166f343883511e53546e87840aeaf/gm_config.min.js
// @require         https://cdn.jsdelivr.net/gh/iFelix18/Userscripts@abce8796cedbe28ac8e072d9824c4b9342985098/lib/utils/utils.min.js
// @require         https://cdn.jsdelivr.net/gh/iFelix18/Userscripts@bced30119a3304aff1c4f71c77bd1781cefde396/lib/api/omdb.min.js
// @require         https://cdn.jsdelivr.net/npm/gm4-polyfill@1.0.1/gm4-polyfill.min.js#sha256-qmLl2Ly0/+2K+HHP76Ul+Wpy1Z41iKtzptPD1Nt8gSk=
// @require         https://cdn.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.min.js#sha256-/xUj+3OJU5yExlq6GSYGSHk7tPXikynS7ogEvDej/m4=
// @require         https://cdn.jsdelivr.net/npm/handlebars@4.7.7/dist/handlebars.min.js#sha256-ZSnrWNaPzGe8v25yP0S6YaMaDLMTDHC+4mHTw0xydEk=
//
// @match           *://www.imdb.com/title/*
// @connect         omdbapi.com
//
// @grant           GM.deleteValue
// @grant           GM.getValue
// @grant           GM.info
// @grant           GM.listValues
// @grant           GM.registerMenuCommand
// @grant           GM.setValue
// @grant           GM.xmlHttpRequest
//
// @grant           GM_deleteValue
// @grant           GM_getValue
// @grant           GM_info
// @grant           GM_listValues
// @grant           GM_registerMenuCommand
// @grant           GM_setValue
// @grant           GM_xmlhttpRequest
//
// @run-at          document-start
// @inject-into     page
// ==/UserScript==

/* global $, GM_config, Handlebars, MonkeyUtils, OMDb */

(() => {
  'use strict'

  //* GM_config
  GM_config.init({
    id: 'ratings-config',
    title: `${GM.info.script.name} v${GM.info.script.version} Settings`,
    fields: {
      OMDbApiKey: {
        label: 'OMDb API Key',
        section: ['You can request a free OMDb API Key at:', 'https://www.omdbapi.com/apikey.aspx'],
        type: 'text',
        title: 'Your OMDb API Key',
        size: 70,
        default: ''
      },
      magic: {
        label: 'Remove',
        section: ['Remove old data from the cache'],
        type: 'button',
        click: async () => {
          const values = await GM.listValues()

          values.forEach(async (value) => {
            const cache = await GM.getValue(value) // get cache
            if ((Date.now() - cache.time) > cachePeriod) { GM.deleteValue(value) } // delete old cache
          })

          GM_config.close()
        }
      },
      logging: {
        label: 'Logging',
        section: ['Develop'],
        labelPos: 'above',
        type: 'checkbox',
        default: false
      },
      debugging: {
        label: 'Debugging',
        labelPos: 'above',
        type: 'checkbox',
        default: false
      }
    },
    /* cspell: disable-next-line */
    css: '#ratings-config{background-color:#343434;color:#fff}#ratings-config *{font-family:varela round,helvetica neue,Helvetica,Arial,sans-serif}#ratings-config .section_header{background-color:#282828;border:1px solid #282828;border-bottom:none;color:#fff;font-size:10pt}#ratings-config .section_desc{background-color:#282828;border:1px solid #282828;border-top:none;color:#fff;font-size:10pt}#ratings-config #ratings-config_field_magic{margin:0 auto;display:block}#ratings-config .reset{color:#fff}',
    events: {
      init: () => {
        if (!GM_config.isOpen && GM_config.get('OMDbApiKey') === '') {
          window.onload = () => GM_config.open()
        }
      },
      save: () => {
        if (!GM_config.isOpen && GM_config.get('OMDbApiKey') === '') {
          window.alert(`${GM.info.script.name}: check your settings and save`)
        } else {
          window.alert(`${GM.info.script.name}: settings saved`)
          GM_config.close()
          window.location.reload(false)
        }
      }
    }
  })
  GM.registerMenuCommand('Configure', () => GM_config.open())

  //* MonkeyUtils
  const MU = new MonkeyUtils({
    name: GM.info.script.name,
    version: GM.info.script.version,
    author: GM.info.script.author,
    color: '#ff0000',
    logging: GM_config.get('logging')
  })
  MU.init('ratings-config')

  //* OMDb API
  const omdb = new OMDb({
    apikey: GM_config.get('OMDbApiKey'),
    debug: GM_config.get('debugging')
  })

  //* Handlebars
  Handlebars.registerHelper('ifEqual', function (a, b, options) {
    if (a === b) return options.fn(this)
    return options.inverse(this)
  })

  //* Constants
  const cachePeriod = 3600000 // 1 hours
  const logos = {
    metacritic: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDIyLjAuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCAyOS40IDI5LjciIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDI5LjQgMjkuNzsiIHhtbDpzcGFjZT0icHJlc2VydmUiPgo8c3R5bGUgdHlwZT0idGV4dC9jc3MiPgoJLnN0MHtmaWxsOiNGRkNDMzQ7fQoJLnN0MXtmaWxsOiMzMzMzMzM7fQoJLnN0MntmaWxsOiNGRUZFRkU7fQoJLnN0M3tmaWxsOiNGRkZGRkY7fQo8L3N0eWxlPgo8dGl0bGU+UGFnZSAxPC90aXRsZT4KPGRlc2M+Q3JlYXRlZCB3aXRoIFNrZXRjaC48L2Rlc2M+CjxnPgoJPHBhdGggaWQ9IkZpbGwtMSIgY2xhc3M9InN0MCIgZD0iTTI5LjQsMTQuOGMwLDguMi02LjcsMTQuOS0xNC45LDE0LjlTLTAuMywyMy0wLjMsMTQuOEMtMC4zLDYuNyw2LjMsMCwxNC41LDBTMjkuNCw2LjcsMjkuNCwxNC44IgoJCS8+Cgk8cGF0aCBpZD0iRmlsbC00IiBjbGFzcz0ic3QxIiBkPSJNMjYuNSwxNC44YzAsNi42LTUuMywxMS45LTExLjksMTEuOVMyLjcsMjEuNCwyLjcsMTQuOFM4LDIuOSwxNC42LDIuOQoJCUMyMS4xLDIuOSwyNi41LDguMiwyNi41LDE0LjgiLz4KCTxwYXRoIGlkPSJGaWxsLTYiIGNsYXNzPSJzdDIiIGQ9Ik02LjgsMTguOWMtMS0xLTEuOS0xLjktMi43LTIuNmwyLjItMi4ybDEuMiwxTDcuNiwxNWMtMC4yLTAuOC0wLjMtMi4zLDEuMS0zLjcKCQljMS4xLTEuMSwyLjUtMS40LDMuNy0wLjhsMCwwYy0wLjEtMC44LTAuMS0xLjUsMC4xLTIuMWMwLjItMC43LDAuNi0xLjQsMS4yLTJjMS42LTEuNiwzLjktMS43LDYuNCwwLjhsNC45LDQuOWwtMi41LDIuNUwxOCwxMC4xCgkJYy0xLjItMS4yLTIuMy0xLjUtMy4xLTAuN2MtMC42LDAuNi0wLjYsMS40LTAuMywyLjFjMC4xLDAuMiwwLjQsMC41LDAuNiwwLjdsNC45LDQuOWwtMi41LDIuNUwxMywxNWMtMS0xLTIuMS0xLjQtMy0wLjUKCQljLTAuNywwLjctMC41LDEuNi0wLjMsMi4xYzAuMSwwLjMsMC4zLDAuNSwwLjYsMC44bDQuOCw0LjhsLTIuNSwyLjVMNi44LDE4Ljl6Ii8+CjwvZz4KPGc+Cgk8cGF0aCBpZD0iRmlsbC04IiBjbGFzcz0ic3QzIiBkPSJNMzQuOCwxMy4yYzAtMS4zLDAtMi41LTAuMS0zLjRoMi44bDAuMSwxLjVoMC4xYzAuNS0wLjcsMS40LTEuNywzLjItMS43YzEuNCwwLDIuNSwwLjcsMi45LDEuOAoJCWwwLDBjMC40LTAuNiwwLjktMSwxLjQtMS4zYzAuNi0wLjMsMS4zLTAuNSwyLTAuNWMyLjEsMCwzLjYsMS40LDMuNiw0Ljd2Ni4zaC0zLjJ2LTUuOWMwLTEuNi0wLjUtMi41LTEuNi0yLjUKCQljLTAuOCwwLTEuMywwLjUtMS42LDEuMmMtMC4xLDAuMi0wLjEsMC42LTAuMSwwLjh2Ni4zaC0zLjJ2LTZjMC0xLjMtMC41LTIuMy0xLjYtMi4zYy0wLjksMC0xLjQsMC43LTEuNiwxLjIKCQljLTAuMSwwLjMtMC4xLDAuNi0wLjEsMC45djYuMmgtMy4ydi03LjNIMzQuOHoiLz4KCTxwYXRoIGlkPSJGaWxsLTEwIiBjbGFzcz0ic3QzIiBkPSJNNjAuMiwxMy45YzAtMC44LTAuNC0yLjItMS45LTIuMmMtMS40LDAtMiwxLjMtMi4xLDIuMkg2MC4yeiBNNTYuMywxNi4yYzAuMSwxLjQsMS41LDIuMSwzLDIuMQoJCWMxLjEsMCwyLjEtMC4yLDMtMC41bDAuNCwyLjNjLTEuMSwwLjUtMi40LDAuNy0zLjksMC43Yy0zLjYsMC01LjctMi4xLTUuNy01LjVjMC0yLjcsMS43LTUuNyw1LjQtNS43YzMuNSwwLDQuOCwyLjcsNC44LDUuNAoJCWMwLDAuNi0wLjEsMS4xLTAuMSwxLjNMNTYuMywxNi4yeiIvPgoJPHBhdGggaWQ9IkZpbGwtMTIiIGNsYXNzPSJzdDMiIGQ9Ik02OSw2Ljl2Mi45aDIuNHYyLjVINjl2My45YzAsMS4zLDAuMywxLjksMS4zLDEuOWMwLjUsMCwwLjcsMCwxLTAuMXYyLjUKCQljLTAuNCwwLjItMS4yLDAuMy0yLjIsMC4zYy0xLjEsMC0yLTAuNC0yLjUtMC45Yy0wLjYtMC43LTAuOS0xLjctMC45LTMuMnYtNC40aC0xLjRWOS44aDEuNHYtMkw2OSw2Ljl6Ii8+Cgk8cGF0aCBpZD0iRmlsbC0xNCIgY2xhc3M9InN0MyIgZD0iTTc5LDE1LjVjLTEuOCwwLTMuMSwwLjQtMy4xLDEuN2MwLDAuOSwwLjYsMS4zLDEuMywxLjNjMC44LDAsMS41LTAuNSwxLjctMS4yCgkJYzAtMC4yLDAuMS0wLjQsMC4xLTAuNlYxNS41eiBNODIuMywxOGMwLDEsMCwyLDAuMiwyLjZoLTNsLTAuMi0xLjFoLTAuMWMtMC43LDAuOS0xLjgsMS4zLTMuMSwxLjNjLTIuMiwwLTMuNS0xLjYtMy41LTMuMwoJCWMwLTIuOCwyLjUtNC4xLDYuMy00LjF2LTAuMWMwLTAuNi0wLjMtMS40LTItMS40Yy0xLjEsMC0yLjMsMC40LTMsMC44bC0wLjYtMi4xYzAuNy0wLjQsMi4yLTEsNC4yLTFjMy42LDAsNC43LDIuMSw0LjcsNC42CgkJTDgyLjMsMThMODIuMywxOHoiLz4KCTxwYXRoIGlkPSJGaWxsLTE2IiBjbGFzcz0ic3QzIiBkPSJNOTMsMjAuM2MtMC42LDAuMy0xLjcsMC41LTMsMC41Yy0zLjUsMC01LjctMi4xLTUuNy01LjVjMC0zLjEsMi4yLTUuNyw2LjEtNS43CgkJYzAuOSwwLDEuOCwwLjIsMi41LDAuNGwtMC41LDIuNWMtMC40LTAuMi0xLTAuMy0xLjktMC4zYy0xLjgsMC0yLjksMS4zLTIuOSwzYzAsMiwxLjMsMywyLjksM2MwLjgsMCwxLjQtMC4xLDEuOS0wLjRMOTMsMjAuM3oiLz4KCTxwYXRoIGlkPSJGaWxsLTE4IiBjbGFzcz0ic3QzIiBkPSJNOTQuOCwxMy4zYzAtMS42LDAtMi42LTAuMS0zLjVoMi45bDAuMSwyaDAuMWMwLjUtMS42LDEuOC0yLjIsMi45LTIuMmMwLjMsMCwwLjUsMCwwLjcsMC4xdjMuMQoJCWMtMC4zLDAtMC41LTAuMS0wLjktMC4xYy0xLjIsMC0yLjEsMC42LTIuMywxLjdjMCwwLjItMC4xLDAuNS0wLjEsMC43djUuNGgtMy4zQzk0LjgsMjAuNSw5NC44LDEzLjMsOTQuOCwxMy4zeiIvPgoJPHBhdGggaWQ9IkZpbGwtMjAiIGNsYXNzPSJzdDMiIGQ9Ik0xMDMuMSwyMC41aDMuM1Y5LjhoLTMuM1YyMC41eiBNMTA0LjgsOC40Yy0xLjEsMC0xLjgtMC44LTEuOC0xLjhzMC43LTEuOCwxLjktMS44CgkJYzEuMSwwLDEuOCwwLjgsMS45LDEuOEMxMDYuNyw3LjYsMTA1LjksOC40LDEwNC44LDguNEwxMDQuOCw4LjR6Ii8+Cgk8cGF0aCBpZD0iRmlsbC0yMiIgY2xhc3M9InN0MyIgZD0iTTExMi45LDYuOXYyLjloMi40djIuNWgtMi40djMuOWMwLDEuMywwLjMsMS45LDEuMywxLjljMC41LDAsMC43LDAsMS0wLjF2Mi41CgkJYy0wLjQsMC4yLTEuMiwwLjMtMi4yLDAuM2MtMS4xLDAtMi0wLjQtMi41LTAuOWMtMC42LTAuNi0wLjktMS43LTAuOS0zLjJ2LTQuNGgtMS40VjkuOGgxLjR2LTJMMTEyLjksNi45eiIvPgoJPHBhdGggaWQ9IkZpbGwtMjMiIGNsYXNzPSJzdDMiIGQ9Ik0xMTcuMiwyMC41aDMuM1Y5LjhoLTMuM1YyMC41eiBNMTE4LjgsOC40Yy0xLjEsMC0xLjgtMC44LTEuOC0xLjhzMC43LTEuOCwxLjktMS44CgkJYzEuMSwwLDEuOCwwLjgsMS45LDEuOEMxMjAuNyw3LjYsMTIwLDguNCwxMTguOCw4LjRMMTE4LjgsOC40eiIvPgoJPHBhdGggaWQ9IkZpbGwtMjQiIGNsYXNzPSJzdDMiIGQ9Ik0xMzEuMiwyMC4zYy0wLjYsMC4zLTEuNywwLjUtMywwLjVjLTMuNSwwLTUuNy0yLjEtNS43LTUuNWMwLTMuMSwyLjItNS43LDYuMS01LjcKCQljMC45LDAsMS44LDAuMiwyLjUsMC40bC0wLjUsMi41Yy0wLjQtMC4yLTEtMC4zLTEuOS0wLjNjLTEuOCwwLTIuOSwxLjMtMi45LDNjMCwyLDEuMywzLDIuOSwzYzAuOCwwLDEuNC0wLjEsMS45LTAuNEwxMzEuMiwyMC4zeiIKCQkvPgo8L2c+Cjwvc3ZnPgo=',
    rotten: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAYAAADimHc4AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyNpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTQwIDc5LjE2MDQ1MSwgMjAxNy8wNS8wNi0wMTowODoyMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChNYWNpbnRvc2gpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOkVFOTk0RUQ0MTQyMjExRThCM0VFQjlDNTlERjBCNDFFIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOkVFOTk0RUQ1MTQyMjExRThCM0VFQjlDNTlERjBCNDFFIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6RUU5OTRFRDIxNDIyMTFFOEIzRUVCOUM1OURGMEI0MUUiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6RUU5OTRFRDMxNDIyMTFFOEIzRUVCOUM1OURGMEI0MUUiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz7OOGwLAAAJ1klEQVR42uxdC7BN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',
    fresh: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAYAAADimHc4AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyNpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTQwIDc5LjE2MDQ1MSwgMjAxNy8wNS8wNi0wMTowODoyMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChNYWNpbnRvc2gpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOkNBRTM0NDlCMTQ3ODExRThCM0VFQjlDNTlERjBCNDFFIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOkNBRTM0NDlDMTQ3ODExRThCM0VFQjlDNTlERjBCNDFFIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6Q0FFMzQ0OTkxNDc4MTFFOEIzRUVCOUM1OURGMEI0MUUiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6Q0FFMzQ0OUExNDc4MTFFOEIzRUVCOUM1OURGMEI0MUUiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz76UXYgAAAJYUlEQVR42uxdC3BU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'
  }

  //* Functions
  /**
   * Returns IMDb ID
   * @returns {string}
   */
  const getID = () => {
    return $('meta[property="imdb:pageConst"]').first().attr('content')
  }

  /**
   * Returns ratings from OMDb
   * @param {*} id IMDb ID
   * @returns {Promise}
   */
  const getRatings = async (id) => {
    const cache = await GM.getValue(id) // get cache

    return new Promise((resolve, reject) => {
      if (cache !== undefined && ((Date.now() - cache.time) < cachePeriod)) { // cache valid
        MU.log('data from cache')
        resolve(elaborateResponse(cache.response))
      } else { // cache not valid
        omdb.get({
          id: id
        }).then((response) => {
          GM.setValue(id, { response, time: Date.now() }) // set cache
          MU.log('data from OMDb')
          resolve(elaborateResponse(response))
        })
      }
    }).catch((error) => MU.error(error))
  }

  /**
   * Returns elaborated response
   * @param {Object} response
   * @returns {Object}
   */
  const elaborateResponse = (response) => {
    return ([
      {
        logo: (response.Ratings[1] !== undefined) ? ((parseFloat(response.Ratings[1].Value) < 60) ? logos.rotten : logos.fresh) : logos.fresh,
        rating: (response.Ratings[1] !== undefined) ? ((response.Ratings[1].Source === 'Rotten Tomatoes') ? response.Ratings[1].Value.replace(/%/g, '') : 'N/A') : 'N/A',
        symbol: '%',
        title: 'TOMATOMETER',
        url: response.tomatoURL,
        votes: (response.Ratings[1] !== undefined) ? ((parseFloat(response.Ratings[1].Value) < 60) ? 'Rotten' : 'Fresh') : 'N/A'
      },
      {
        logo: logos.metacritic,
        rating: response.Metascore,
        symbol: '',
        title: 'METASCORE',
        url: 'criticreviews',
        votes: (response.Metascore < 40) ? '#ff0000' : (response.Metascore >= 40 && response.Metascore <= 60) ? '#ffcc33' : '#66cc33'
      }
    ])
  }

  /**
   * Add template
   */
  const addTemplate = () => {
    /* cspell: disable-next-line */
    const template = '<div class="external-ratings idYUsR"style=margin-right:.5rem></div><script id=external-ratings-template type=text/x-handlebars-template>{{#each ratings}}<div class="jQXoLQ rating-bar__base-button"> <div class="bufoWn">{{this.title}}</div><a class="ipc-button ipc-text-button ipc-button--core-baseAlt ipc-button--on-textPrimary jjcqHZ" role="button"{{#ifEqual this.url "N/A"}}{{else}}href="{{this.url}}{{/ifEqual}}"> <div class="ipc-button__text"> <div class="jodtvN"> <div class="dwhzFZ"> <img src="{{this.logo}}" alt="logo" width="24"> </div><div class="hmJkIS"> <div class="bmbYRW"> <span class="iTLWoV">{{this.rating}}</span>{{#ifEqual this.rating "N/A"}}<span></span>{{else}}<span>{{this.symbol}}</span>{{/ifEqual}}</div><div class="fKXaGo"></div>{{#ifEqual this.rating "N/A"}}<div class="jkCVKJ"></div>{{else}}{{#ifEqual this.title "TOMATOMETER"}}<div class="jkCVKJ">{{this.votes}}</div>{{else}}<div class="jkCVKJ" style="background-color:{{this.votes}};height: 10px;width: 100%;margin-top: 3px;margin-bottom: 3px;"></div>{{/ifEqual}}{{/ifEqual}}</div></div></div></a> </div>{{/each}}</script>'
    const target = '.hglRHk div[class^="RatingBar__ButtonContainer"] div[class^="RatingBarButtonBase__ContentWrap"]:nth-child(1)'

    $(template).insertAfter(target)
  }

  //* Script
  $(document).ready(() => {
    const id = getID()

    if (!id) return

    MU.log(`ID is '${id}'`)

    addTemplate()
    getRatings(id).then((response) => {
      MU.log(response)

      const template = Handlebars.compile($('#external-ratings-template').html())
      const context = { ratings: response }
      const compile = template(context)
      $('.external-ratings').html(compile)
    }).catch((error) => MU.error(error))
  })
})()