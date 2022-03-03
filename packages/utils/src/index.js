// ==UserScript==
// @author       Davide <iFelix18@protonmail.com>
// @namespace    https://github.com/iFelix18
// @exclude      *
// ==UserLibrary==
// @name         @ifelix18/utils
// @description  Utils for my userscripts
// @copyright    2019, Davide (https://github.com/iFelix18)
// @license      MIT
// @version      5.1.1
// @homepage     https://github.com/iFelix18/Userscripts/tree/master/packages/utils#readme
// @homepageURL  https://github.com/iFelix18/Userscripts/tree/master/packages/utils#readme
// @supportURL   https://github.com/iFelix18/Userscripts/issues
// ==/UserLibrary==
// @grant        GM.deleteValue
// @grant        GM.getValue
// @grant        GM.setValue
// ==/UserScript==

/**
 * Utils for my userscripts
 *
 * @class
 */
export default class UserscriptUtils {
  /**
   * Utils configuration
   *
   * @param {object} config Configuration
   * @param {string} config.name Userscript name
   * @param {string} config.version Userscript version
   * @param {string} config.author Userscript author
   * @param {string} [config.color='red'] Userscript header color
   * @param {string} [config.logging=false] Logging
   */
  constructor (config = {}) {
    if (!config.name) throw new Error('Userscript name is required')
    if (!config.author) throw new Error('Userscript author is required')

    const matches = /^(.*?)\s<\S[^\s@]*@\S[^\s.]*\.\S+>$/.exec(config.author)

    /**
     * @private
     */
    this._config = {
      name: config.name.toUpperCase(),
      version: config.version || undefined,
      author: matches ? matches[1] : config.author,
      color: config.color || 'red',
      logging: config.logging || false
    }
  }

  /**
   * Initialize utils
   * log userscript header
   * and, if logging is true, script config values
   *
   * @param {string} id Config ID
   */
  async init (id) {
    console.log(`%c${this._config.name}\n` + `${!this._config.version ? '%c' : `%cv${this._config.version} `}by ${this._config.author} is running!`, `color:${this._config.color};font-weight:bold;font-size:18px;`, '')

    if (id && this._config.logging === true) {
      const data = JSON.parse(await GM.getValue(id))
      for (const key of Object.keys(data)) {
        console.log(`${this._config.name}:`, `${key} is "${data[key]}"`)
      }
    }
  }

  /**
   * Log, if logging is true
   *
   * @param {string} message Message
   */
  log (message) {
    if (this._config.logging === true) {
      console.log(`${this._config.name}:`, message)
    }
  }

  /**
   * Error
   *
   * @param {string} message Message
   */
  error (message) {
    console.error(`${this._config.name}:`, message)
  }

  /**
   * Alert
   *
   * @param {string} message Message
   */
  alert (message) {
    window.alert(`${this._config.name}: ${message}`)
  }

  /**
   * Returns shortened version of a message
   *
   * @param {string} message Message
   * @param {number} length Message length
   * @returns {string} Shortened message
   */
  short (message, length) {
    return message.split(' ').length > length ? `${message.split(' ', length).join(' ')} [...]` : message
  }
}

/**
 * Migrate configuration
 *
 * @param {string} oldID Old config ID
 * @param {string} newID New config ID
 */
UserscriptUtils.migrateConfig = async (oldID, newID) => {
  if (!oldID) throw new Error('An old config ID is required')
  if (!newID) throw new Error('An new config ID is required')

  const oldConfig = await GM.getValue(oldID) // get old config
  if (oldConfig) {
    GM.setValue(newID, oldConfig) // set new config
    GM.deleteValue(oldID) // delete old config
    window.location.reload(false)
  }
}
