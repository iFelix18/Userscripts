// ==UserScript==
// @author          Davide <iFelix18@protonmail.com>
// @namespace       https://github.com/iFelix18
// @exclude         *
// ==UserLibrary==
// @name            Monkey Utils
// @description     Utils for my userscripts
// @copyright       2019, Davide (https://github.com/iFelix18)
// @license         MIT
// @version         2.3.0
// @homepageURL     https://github.com/iFelix18/Userscripts
// @supportURL      https://github.com/iFelix18/Userscripts/issues
// ==/UserLibrary==
// @include         *
// @grant           GM.getValue
// ==/UserScript==

(() => {
  /**
   * Utils for my userscripts
   * @class
   */
  this.MonkeyUtils = class {
    /**
     * Utils configuration
     * @param {Object} config
     * @param {string} config.name Userscript name
     * @param {string} config.version Userscript version
     * @param {string} config.author Userscript author
     * @param {string} [config.color='red'] Userscript header color
     * @param {string} [config.logging=false] Logging
     */
    constructor (config = {}) {
      if (!config.name) throw new Error('Userscript name is required')
      if (!config.version) throw new Error('Userscript version is required')
      if (!config.author) throw new Error('Userscript author is required')

      /**
       * @private
       */
      this._config = {
        name: config.name.toUpperCase(),
        version: config.version,
        author: /^(.*?)(\s<\S+@\S+\.\S+>)/.test(config.author) ? config.author.match(/^(.*?)(\s<\S+@\S+\.\S+>)/)[1] : config.author,
        color: config.color || 'red',
        logging: config.logging || false
      }
    }

    /**
     * Initialize utils
     * log userscript header
     * and, if logging is true, script config values
     * @param {string} id Config id
     */
    async init (id) {
      console.log(`%c${this._config.name}\n` + `%cv${this._config.version} by ${this._config.author} is running!`, `color:${this._config.color};font-weight:bold;font-size:18px;`, '')

      if (id && this._config.logging === true) {
        const data = JSON.parse(await GM.getValue(id))
        for (const key of Object.keys(data)) {
          console.log(`${this._config.name}:`, `${key} is "${data[key]}"`)
        }
      }
    }

    /**
     * Log, if logging is true
     * @param {string} message
     */
    log (message) {
      if (this._config.logging === true) {
        console.log(`${this._config.name}:`, message)
      }
    }

    /**
     * Error
     * @param {string} message
     */
    error (message) {
      console.error(`${this._config.name}:`, message)
    }

    /**
     * Alert
     * @param {string} message
     */
    alert (message) {
      window.alert(`${this._config.name}: ${message}`)
    }

    /**
     * Returns shortened version of a message
     * @param {string} message
     * @returns {string}
     */
    short (message) {
      return [...message.split(/\s+/).slice(0, 6).join(' '), ' [...]']
    }
  }
})()
