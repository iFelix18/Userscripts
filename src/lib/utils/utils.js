// ==UserScript==
// @author          Felix
// @namespace       https://github.com/iFelix18
// @exclude         *
// ==UserLibrary==
// @name            Monkey Utils
// @description     Utils for my userscripts
// @copyright       2019, Felix (https://github.com/iFelix18)
// @license         MIT
// @version         2.0.0
// @homepageURL     https://github.com/iFelix18/Userscripts
// @supportURL      https://github.com/iFelix18/Userscripts/issues
// ==/UserLibrary==
// @require         https://cdn.jsdelivr.net/gh/greasemonkey/gm4-polyfill@master/gm4-polyfill.min.js
// @include         *
// @grant           GM.getValue
// @grant           GM_getValue
// ==/UserScript==

(() => {
  'use strict'

  this.MonkeyUtils = class {
    constructor (config = {}) {
      if (!config.name) throw Error('Userscript name is required')
      if (!config.version) throw Error('Userscript version is required')
      if (!config.author) throw Error('Userscript author is required')

      this.config = {
        name: config.name,
        version: config.version,
        author: config.author,
        color: config.color || 'red', //* optional
        logging: config.logging || false //* optional
      }
    }

    async init (id) {
      console.log(`%c${this.config.name} ` + `%cv${this.config.version} by ${this.config.author} is running!`, `color:${this.config.color};font-weight:bold;`, '')

      if (id && this.config.logging === true) {
        const data = JSON.parse(await GM.getValue(id))
        Object.keys(data).forEach((key) => {
          console.log(`%c${this.config.name}` + `%c: ${key} is "${data[key]}"`, `color:${this.config.color};font-weight:bold;`, '')
        })
      }
    }

    log (message) {
      if (this.config.logging === true) {
        console.log(`%c${this.config.name}` + `%c: ${message}`, `color:${this.config.color};font-weight:bold;`, '')
      }
    }

    alert (message) {
      window.alert(`${this.config.name}: ${message}`)
    }

    short (message) {
      return message.split(/\s+/).slice(0, 6).join(' ').concat(' [...]')
    }
  }
})()
