// ==UserScript==
// @author       Davide <iFelix18@protonmail.com>
// @namespace    https://github.com/iFelix18
// @exclude      *
// ==UserLibrary==
// @name         @ifelix18/utils
// @description  Utils for my userscripts
// @copyright    2019, Davide (https://github.com/iFelix18)
// @license      MIT
// @version      6.2.1
// @homepage     https://github.com/iFelix18/Userscripts/tree/master/packages/utils#readme
// @homepageURL  https://github.com/iFelix18/Userscripts/tree/master/packages/utils#readme
// @supportURL   https://github.com/iFelix18/Userscripts/issues
// ==/UserLibrary==
// @grant        GM.deleteValue
// @grant        GM.getValue
// @grant        GM.setValue
// ==/UserScript==
this.UU = (function () {
  /* global $ */
  const observed = {}
  const name = GM.info.script.name
  const version = GM.info.script.version
  const matches = /^(.*?)\s<\S[^\s@]*@\S[^\s.]*\.\S+>$/.exec(GM.info.script.author)
  const author = matches ? matches[1] : GM.info.script.author
  let id = name.toLowerCase().replace(/\s/g, '-')
  let logging = false
  const callsCallback = (selector, element) => {
    if (!$(element).data(id) && $(element).data('visible')) {
      $(element).data(id, 1)
      observed[selector].callback.call(element, element)
    }
  }
  const intersectionObserver = (selector, element) => {
    new IntersectionObserver(entries => {
      for (const entry of entries) {
        const element = $(entry.target)
        $(element).data('visible', observed[selector].onlyVisible ? entry.intersectionRatio > 0 : true)
        callsCallback(selector, element)
      }
    }, {
      rootMargin: '0px',
      threshold: 1
    }).observe(element)
  }
  const mutationObserver = () => {
    new MutationObserver(() => {
      $.each(observed, selector => {
        $(selector).each((index, element) => {
          intersectionObserver(selector, element)
        })
      })
    }).observe(document, {
      attributes: true,
      childList: true,
      subtree: true
    })
  }
  const index = {
    init: async (config = {}) => {
      id = config.id
      logging = typeof config.logging !== 'boolean' ? false : config.logging
      const style = 'color:red;font-weight:700;font-size:18px;text-transform:uppercase'
      console.info(`%c${name}\n` + `%cv${version}${author ? ` by ${author}` : ''} is running!`, style, '')
      if (config.id && config.logging) {
        let data = await GM.getValue(id)
        data = JSON.parse(data)
        for (const key in data) {
          if (Object.hasOwnProperty.call(data, key)) {
            console.info(`${name}:`, `${key} is "${data[key]}"`)
          }
        }
      }
    },
    log: message => {
      if (logging) {
        console.info(`${name}:`, message)
      }
    },
    error: message => {
      console.error(`${name}:`, message)
    },
    warn: message => {
      console.warn(`${name}:`, message)
    },
    alert: message => {
      window.alert(`${name}: ${message}`)
    },
    short: (message, length) => message.split(' ').length > Number(length) ? `${message.split(' ', Number(length)).join(' ')} [...]` : message,
    migrateConfig: async (oldID, newID) => {
      if (!oldID) throw new Error('An old config ID is required')
      if (!newID) throw new Error('An new config ID is required')
      const oldConfig = await GM.getValue(oldID)
      if (oldConfig) {
        GM.setValue(newID, oldConfig)
        GM.deleteValue(oldID)
        window.location.reload(false)
      }
    },
    observe: {
      creation: (selector, callback, onlyVisible) => {
        $.extend(observed, {
          [selector]: {
            callback,
            onlyVisible: typeof onlyVisible !== 'boolean' ? false : onlyVisible
          }
        })
        mutationObserver()
      }
    }
  }
  return index
}())
