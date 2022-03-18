// ==UserScript==
// @author       Davide <iFelix18@protonmail.com>
// @namespace    https://github.com/iFelix18
// @exclude      *
// ==UserLibrary==
// @name         @ifelix18/utils
// @description  Utils for my userscripts
// @copyright    2019, Davide (https://github.com/iFelix18)
// @license      MIT
// @version      6.1.0
// @homepage     https://github.com/iFelix18/Userscripts/tree/master/packages/utils#readme
// @homepageURL  https://github.com/iFelix18/Userscripts/tree/master/packages/utils#readme
// @supportURL   https://github.com/iFelix18/Userscripts/issues
// ==/UserLibrary==
// @grant        GM.deleteValue
// @grant        GM.getValue
// @grant        GM.setValue
// ==/UserScript==

/* global $ */

const observed = {}
const name = GM.info.script.name
const version = GM.info.script.version
const matches = /^(.*?)\s<\S[^\s@]*@\S[^\s.]*\.\S+>$/.exec(GM.info.script.author)
const author = matches ? matches[1] : GM.info.script.author
let _id
let _logging

const callsCallback = (selector) => {
  $(selector).each((index, element) => {
    if (!$(element).data(_id)) {
      $(element).data(_id, 1)
      observed[selector].callback.call(index, element)
    }
  })
}

const observer = () => {
  new MutationObserver(() => $.each(observed, (selector) => callsCallback(selector)))
    .observe(document, { childList: true, subtree: true })
}

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
    console.info(`%c${name}\n` + `%cv${version}${author ? ` by ${author}` : ''} is running!`, style, '')

    // if logging is true, logs script config values
    if (_logging) {
      for (const key in data) {
        if (Object.hasOwnProperty.call(data, key)) {
          console.info(`${name}:`, `${key} is "${data[key]}"`)
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
      console.info(`${name}:`, message)
    }
  },
  /**
   * Error
   *
   * @param {string} message Message
   */
  error: (message) => {
    console.error(`${name}:`, message)
  },
  /**
   * Warn
   *
   * @param {string} message Message
   */
  warn: (message) => {
    console.warn(`${name}:`, message)
  },
  /**
   * Alert
   *
   * @param {string} message Message
   */
  alert: (message) => {
    window.alert(`${name}: ${message}`)
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
  },
  /**
   * Observe the creation of new elements
   *
   * @param {string} selector Selector
   * @param {Function} callback callback
   */
  observe: (selector, callback) => {
    $.extend(observed, { [selector]: { callback } })
    observer()
  }
}
