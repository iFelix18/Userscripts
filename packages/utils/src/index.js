// ==UserScript==
// @author       Davide <iFelix18@protonmail.com>
// @namespace    https://github.com/iFelix18
// @exclude      *
// ==UserLibrary==
// @name         @ifelix18/utils
// @description  Utils for my userscripts
// @copyright    2019, Davide (https://github.com/iFelix18)
// @license      MIT
// @version      6.0.0
// @homepage     https://github.com/iFelix18/Userscripts/tree/master/packages/utils#readme
// @homepageURL  https://github.com/iFelix18/Userscripts/tree/master/packages/utils#readme
// @supportURL   https://github.com/iFelix18/Userscripts/issues
// ==/UserLibrary==
// @grant        GM.deleteValue
// @grant        GM.getValue
// @grant        GM.setValue
// ==/UserScript==

const _name = GM.info.script.name
const _version = GM.info.script.version
const matches = /^(.*?)\s<\S[^\s@]*@\S[^\s.]*\.\S+>$/.exec(GM.info.script.author)
const author = matches ? matches[1] : GM.info.script.author
let _id
let _logging

export default {
  /**
   * Initialize the userscript.
   * Logs userscript header and, if logging is true, the script config values
   *
   * @param {string} id Config ID
   * @param {boolean} logging Logging
   */
  init: async (id, logging) => {
    if (!id) throw new Error('A config ID is required')

    _id = id
    _logging = typeof logging !== 'boolean' ? false : logging

    // get config data
    let data = await GM.getValue(_id)
    if (!data) throw new Error('Wrong config ID')
    data = JSON.parse(data)

    // logs userscript header
    const style = 'color:red;font-weight:700;font-size:18px;text-transform:uppercase'
    console.info(`%c${_name}\n` + `%cv${_version}${author ? ` by ${author}` : ''} is running!`, style, '')

    // if logging is true, logs script config values
    if (_logging) {
      for (const key in data) {
        if (Object.hasOwnProperty.call(data, key)) {
          console.info(`${_name}:`, `${key} is "${data[key]}"`)
        }
      }
    }
  },
  /**
   * Log, if logging is true
   *
   * @param {string} message Message
   */
  log: (message) => {
    if (_logging) {
      console.info(`${_name}:`, message)
    }
  },
  /**
   * Error
   *
   * @param {string} message Message
   */
  error: (message) => {
    console.error(`${_name}:`, message)
  },
  /**
   * Warn
   *
   * @param {string} message Message
   */
  warn: (message) => {
    console.warn(`${_name}:`, message)
  },
  /**
   * Alert
   *
   * @param {string} message Message
   */
  alert: (message) => {
    window.alert(`${_name}: ${message}`)
  },
  /**
   * Returns shortened version of a message
   *
   * @param {string} message Message
   * @param {number} length Message length
   * @returns {string} Shortened message
   */
  short: (message, length) => {
    return message.split(' ').length > Number(length) ? `${message.split(' ', Number(length)).join(' ')} [...]` : message
  },
  /**
   * Migrate configuration
   *
   * @param {string} oldID Old config ID
   * @param {string} newID New config ID
   */
  migrateConfig: async (oldID, newID) => {
    if (!oldID) throw new Error('An old config ID is required')
    if (!newID) throw new Error('An new config ID is required')

    const oldConfig = await GM.getValue(oldID) // get old config
    if (oldConfig) {
      GM.setValue(newID, oldConfig) // set new config
      GM.deleteValue(oldID) // delete old config
      window.location.reload(false) // reload the page to apply the new configuration
    }
  }
}
