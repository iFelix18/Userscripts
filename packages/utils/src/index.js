// ==UserScript==
// @author       Davide <iFelix18@protonmail.com>
// @namespace    https://github.com/iFelix18
// @exclude      *
// ==UserLibrary==
// @name         @ifelix18/utils
// @description  Utils for my userscripts
// @copyright    2019, Davide (https://github.com/iFelix18)
// @license      MIT
// @version      6.4.0
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

let id = name.toLowerCase().replace(/\s/g, '-')
let logging = false

const callsCallback = async (selector, element) => {
  const onlyVisible = observed[selector].onlyVisible ? await intersectionObserver(element) : true

  if (!$(element).data(id) && onlyVisible) {
    $(element).data(id, 1)
    observed[selector].callback.call(element, element)

    if (observed[selector].onlyFirstMatch) { delete observed[selector] }
  }
}

const intersectionObserver = (element) => {
  return new Promise(resolve => {
    new IntersectionObserver((entries) => {
      $.each(entries, (index, entry) => {
        resolve(entry.intersectionRatio > 0)
      })
    }, { rootMargin: '0px', threshold: 1 }).observe(element)
  })
}

const mutationObserver = () => {
  new MutationObserver(() => {
    $.each(observed, (selector) => {
      $(selector).each((index, element) => {
        const onlyFirstMatch = observed[selector].onlyFirstMatch ? !observed[selector].onlyFirstMatch : true

        callsCallback(selector, element)
        return onlyFirstMatch
      })
    })
  }).observe(document, { attributes: true, childList: true, subtree: true })
}

export default {
  /**
   * Initialize the userscript.
   * Logs userscript header and,
   * if an ID is provided and logging is true, the script config values
   *
   * @param {object} config Utils configuration
   */
  init: async (config = {}) => {
    id = config.id
    logging = typeof config.logging !== 'boolean' ? false : config.logging

    // logs userscript header
    const style = 'color:red;font-weight:700;font-size:18px;text-transform:uppercase'
    console.info(`%c${name}\n` + `%cv${version}${author ? ` by ${author}` : ''} is running!`, style, '')
  },
  /**
   * Log, if logging is true
   *
   * @param {string} message Message
   */
  log: (message) => {
    if (logging) {
      console.log(`${name}:`, message)
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
   * Observe
   */
  observe: {
    /**
     * Observe the creation of new elements
     *
     * @param {string} selector Selector
     * @param {Function} callback callback
     * @param {object} options Options
     * @param {boolean} options.onlyVisible Only visible elements on screen
     * @param {boolean} options.onlyFirstMatch Only the first matched element
     */
    creation: (selector, callback, options = {}) => {
      $.extend(observed, { [selector]: { callback, onlyVisible: typeof options.onlyVisible !== 'boolean' ? false : options.onlyVisible, onlyFirstMatch: typeof options.onlyFirstMatch !== 'boolean' ? false : options.onlyFirstMatch } })
      mutationObserver()
    }
  }
}
