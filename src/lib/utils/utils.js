// ==UserScript==
// @author          Davide
// @namespace       https://github.com/iFelix18
// @exclude         *
// ==UserLibrary==
// @name            Monkey Utils
// @description     Utils for my userscripts
// @copyright       2019, Davide (https://github.com/iFelix18)
// @license         MIT
// @version         2.1.1
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
        name: config.name.toUpperCase(),
        version: config.version,
        author: config.author,
        color: config.color || 'red', //* optional
        logging: config.logging || false //* optional
      }
    }

    async init (id) {
      console.log(`%c${this.config.name}\n` + `%cv${this.config.version} by ${this.config.author} is running!`, `color:${this.config.color};font-weight:bold;font-size:18px;`, '')

      if (id && this.config.logging === true) {
        const data = JSON.parse(await GM.getValue(id))
        Object.keys(data).forEach((key) => {
          console.log(`${this.config.name}:`, `${key} is "${data[key]}"`)
        })
      }
    }

    log (message) {
      if (this.config.logging === true) {
        console.log(`${this.config.name}:`, message)
      }
    }

    error (message) {
      console.error(`${this.config.name}:`, message)
    }

    alert (message) {
      window.alert(`${this.config.name}:`, message)
    }

    short (message) {
      return message.split(/\s+/).slice(0, 6).join(' ').concat(' [...]')
    }
  }
})()
