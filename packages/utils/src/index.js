// ==UserScript==
// @author       Davide <iFelix18@protonmail.com>
// @namespace    https://github.com/iFelix18
// @exclude      *
// ==UserLibrary==
// @name         @ifelix18/utils
// @description  Utils for my userscripts
// @copyright    2019, Davide (https://github.com/iFelix18)
// @license      MIT
// @version      6.2.0
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
let id
let logging

const callsCallback = (selector, element) => {
  if (!$(element).data(id) && $(element).data('visible')) {
    $(element).data(id, 1)
    observed[selector].callback.call(element, element)
  }
}

const intersectionObserver = (selector, element) => {
  new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const element = $(entry.target)
      $(element).data('visible', observed[selector].visible ? entry.intersectionRatio > 0 : true) // any element is "visible" if visibility is not required
      callsCallback(selector, element)
    }
  }, { rootMargin: '0px', threshold: 1 }).observe(element)
}

const mutationObserver = () => {
  new MutationObserver(() => {
    $.each(observed, (selector) => {
      $(selector).each((index, element) => {
        intersectionObserver(selector, element)
      })
    })
  }).observe(document, { attributes: true, childList: true, subtree: true })
}

export default {
  /**
   * Initialize the userscript.
   * Logs userscript header and, if logging is true, the script config values
   *
   * @param {string} _id Config ID
   * @param {boolean} _logging Logging
   */
  init: async (_id, _logging) => {
    if (!_id) throw new Error('A config ID is required')

    id = _id
    logging = typeof _logging !== 'boolean' ? false : _logging

    // get config data
    let data = await GM.getValue(id)
    if (!data) throw new Error('Wrong config ID')
    data = JSON.parse(data)

    // logs userscript header
    const style = 'color:red;font-weight:700;font-size:18px;text-transform:uppercase'
    console.info(`%c${name}\n` + `%cv${version}${author ? ` by ${author}` : ''} is running!`, style, '')

    // if logging is true, logs script config values
    if (logging) {
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
    if (logging) {
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
   * @param {boolean} visible Only visible on screen elements
   */
  observe: (selector, callback, visible) => {
    $.extend(observed, { [selector]: { callback, visible: typeof visible !== 'boolean' ? false : visible } })
    mutationObserver()
  }
}
