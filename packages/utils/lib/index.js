// ==UserScript==
// @author       Davide <iFelix18@protonmail.com>
// @namespace    https://github.com/iFelix18
// @exclude      *
// ==UserLibrary==
// @name         @ifelix18/utils
// @description  Utils for my userscripts
// @copyright    2019, Davide (https://github.com/iFelix18)
// @license      MIT
// @version      6.5.0
// @homepage     https://github.com/iFelix18/Userscripts/tree/master/packages/utils#readme
// @homepageURL  https://github.com/iFelix18/Userscripts/tree/master/packages/utils#readme
// @supportURL   https://github.com/iFelix18/Userscripts/issues
// ==/UserLibrary==
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
  const callsCallback = async (selector, element) => {
    const onlyVisible = observed[selector].onlyVisible ? await intersectionObserver(element) : true
    if (!$(element).data(id) && onlyVisible) {
      $(element).data(id, 1)
      observed[selector].callback.call(element, element)
      if (observed[selector].onlyFirstMatch) {
        delete observed[selector]
      }
    }
  }
  const intersectionObserver = element => new Promise(resolve => {
    new IntersectionObserver(entries => {
      $.each(entries, (index, entry) => {
        resolve(entry.intersectionRatio > 0)
      })
    }, {
      rootMargin: '0px',
      threshold: 1
    }).observe(element)
  })
  const mutationObserver = () => {
    new MutationObserver(() => {
      $.each(observed, selector => {
        $(selector).each((index, element) => {
          const onlyFirstMatch = observed[selector].onlyFirstMatch ? !observed[selector].onlyFirstMatch : true
          callsCallback(selector, element)
          return onlyFirstMatch
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
    },
    log: message => {
      if (logging) {
        console.log(`${name}:`, message)
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
    addStyle: css => {
      const head = $('head')
      const style = `<style type='text/css'>${css}</style>`
      if (head.length > 0) $(head).append(style)
    },
    observe: {
      creation: (selector, callback, options = {}) => {
        $.extend(observed, {
          [selector]: {
            callback,
            onlyVisible: typeof options.onlyVisible !== 'boolean' ? false : options.onlyVisible,
            onlyFirstMatch: typeof options.onlyFirstMatch !== 'boolean' ? false : options.onlyFirstMatch
          }
        })
        mutationObserver()
      }
    }
  }
  return index
}())
