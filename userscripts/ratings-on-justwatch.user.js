// ==UserScript==
// @name            Ratings on JustWatch
// @name:it         Valutazioni su JustWatch
// @author          Davide <iFelix18@protonmail.com>
// @namespace       https://github.com/iFelix18
// @icon            https://www.google.com/s2/favicons?sz=64&domain=https://www.justwatch.com/
// @description     Adds ratings from IMDb, Rotten Tomatoes, Metacritic and MyAnimeList to JustWatch
// @description:it  Aggiunge valutazioni da IMDb, Rotten Tomatoes, Metacritic e MyAnimeList a JustWatch
// @copyright       2022, Davide (https://github.com/iFelix18)
// @license         MIT
// @version         1.0.0
// @homepage        https://github.com/iFelix18/Userscripts#readme
// @homepageURL     https://github.com/iFelix18/Userscripts#readme
// @supportURL      https://github.com/iFelix18/Userscripts/issues
// @updateURL       https://raw.githubusercontent.com/iFelix18/Userscripts/master/userscripts/meta/ratings-on-justwatch.meta.js
// @downloadURL     https://raw.githubusercontent.com/iFelix18/Userscripts/master/userscripts/ratings-on-justwatch.user.js
// @require         https://cdn.jsdelivr.net/gh/sizzlemctwizzle/GM_config@43fd0fe4de1166f343883511e53546e87840aeaf/gm_config.min.js
// @require         https://cdn.jsdelivr.net/gh/iFelix18/Userscripts@utils-2.3.4/lib/utils/utils.min.js
// @require         https://cdn.jsdelivr.net/gh/iFelix18/Userscripts@omdb-1.2.4/lib/api/omdb.min.js
// @require         https://cdn.jsdelivr.net/gh/iFelix18/Userscripts@rottentomatoes-1.1.3/lib/api/rottentomatoes.min.js
// @require         https://cdn.jsdelivr.net/gh/iFelix18/Userscripts@jikan-1.0.0/lib/api/jikan.min.js
// @require         https://cdn.jsdelivr.net/gh/iFelix18/Userscripts@ratings-2.0.0/lib/utils/ratings.min.js
// @require         https://cdn.jsdelivr.net/npm/@violentmonkey/dom@2.1.0/dist/index.min.js
// @require         https://cdn.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.min.js
// @require         https://cdn.jsdelivr.net/npm/handlebars@4.7.7/dist/handlebars.min.js
// @match           *://www.justwatch.com/*
// @connect         api.jikan.moe
// @connect         omdbapi.com
// @connect         rottentomatoes.com
// @grant           GM_getValue
// @grant           GM_setValue
// @grant           GM.deleteValue
// @grant           GM.getValue
// @grant           GM.listValues
// @grant           GM.registerMenuCommand
// @grant           GM.setValue
// @grant           GM.xmlHttpRequest
// @run-at          document-start
// @inject-into     page
// ==/UserScript==

/* global $, GM_config, Handlebars, MonkeyUtils, Ratings, VM */

(() => {
  //* GM_config
  GM_config.init({
    id: 'config',
    title: `${GM.info.script.name} v${GM.info.script.version} Settings`,
    fields: {
      OMDbApiKey: {
        label: 'OMDb API Key',
        section: ['You can request a free OMDb API Key at:', 'https://www.omdbapi.com/apikey.aspx'],
        type: 'text',
        title: 'Your OMDb API Key',
        size: 70,
        default: ''
      },
      logging: {
        label: 'Logging',
        section: ['Develop'],
        labelPos: 'right',
        type: 'checkbox',
        default: false
      },
      debugging: {
        label: 'Debugging',
        labelPos: 'right',
        type: 'checkbox',
        default: false
      },
      clearCache: {
        label: 'Clear the cache',
        type: 'button',
        click: async () => {
          const values = await GM.listValues()

          for (const value of values) {
            const cache = await GM.getValue(value) // get cache
            if (cache.time) { GM.deleteValue(value) } // delete cache
          }

          MU.log('cache cleared')
          GM_config.close()
        }
      }
    },
    css: ':root{--mainBackground:#343433;--background:#282828;--text:#fff}#config{background-color:var(--mainBackground);color:var(--text)}#config .section_header{background-color:var(--background);border-bottom:none;border:1px solid var(--background);color:var(--text)}#config .section_desc{background-color:var(--background);border-top:none;border:1px solid var(--background);color:var(--text)}#config .reset{color:var(--text)}',
    events: {
      init: () => {
        if (!GM_config.isOpen && GM_config.get('OMDbApiKey') === '') {
          window.addEventListener('load', () => GM_config.open())
        }
      },
      save: () => {
        if (!GM_config.isOpen && GM_config.get('OMDbApiKey') === '') {
          window.alert(`${GM.info.script.name}: check your settings and save`)
        } else {
          window.alert(`${GM.info.script.name}: settings saved`)
          GM_config.close()
          window.location.reload(false)
        }
      }
    }
  })
  GM.registerMenuCommand('Configure', () => GM_config.open())

  //* MonkeyUtils
  const MU = new MonkeyUtils({
    name: GM.info.script.name,
    version: GM.info.script.version,
    author: GM.info.script.author,
    color: '#ff0000',
    logging: GM_config.get('logging')
  })
  MU.init('config')

  //* Ratings
  const rating = new Ratings({
    omdb_apikey: GM_config.get('OMDbApiKey'),
    cache_period: 3_600_000,
    debug: GM_config.get('debugging')
  })

  //* Handlebars
  Handlebars.registerHelper('ifEqual', function (a, b, options) {
    if (a === b) return options.fn(this)
    return options.inverse(this)
  })

  //* Functions
  /**
   * Returns IMDb ID
   * @returns {string}
   */
  const getID = () => {
    const link = $('.title-info:not(.visible-xs) a[href^="https://www.imdb.com/"]').attr('href') // IMDb link
    if (!link) return // check if the link exists

    return new Promise((resolve, reject) => { // load last IMDb link
      GM.xmlHttpRequest({
        method: 'GET',
        url: link,
        onload: (response) => {
          resolve(/\/title\/(tt\d*)/i.exec(response.finalUrl)[1]) // IMDb ID
        }
      })
    })
  }

  /**
   * Add template
   */
  const addTemplate = () => {
    const template = '<li class=external-ratings style=display:flex;margin-right:0></li><script id=external-ratings-template type=text/x-handlebars-template>{{#each ratings}} {{#ifEqual this.rating "N/A"}} {{else}} <a class=external-rating-link href={{this.url}} target=_blank><div class={{this.source}}-rating style=display:inline-flex;align-items:center;margin-right:20px><div class=logo style=display:inline-flex><img alt=logo src={{this.logo}} width=40></div><div class=text style=font-weight:700;margin-left:6px;display:inline-flex;flex-direction:column;align-items:flex-start;color:#fff><div class=vote style=display:flex;align-items:center;align-content:center;justify-content:center>{{this.rating}} {{#ifEqual this.rating "N/A"}} {{else}} <span style=font-weight:400;font-size:80%;color:#8a8d98>{{this.symbol}} </span>{{/ifEqual}}</div>{{#ifEqual this.votes "N/A"}} {{else}} {{#ifEqual this.source "metascore"}}<div class=votes style="display:flex;align-items:center;align-content:center;justify-content:center;background:linear-gradient(to top,transparent 0,transparent 25%,{{this.votes}} 25%,{{this.votes}} 75%,transparent 75%,transparent 100%);color:transparent">{{this.rating}}</div>{{else}}<div class=votes style=font-weight:400;color:#8a8d98>{{this.votes}}</div>{{/ifEqual}} {{/ifEqual}}</div></div></a>{{/ifEqual}} {{/each}}</script>'
    const target = '.title-block'

    $(template).appendTo(target)
  }

  /**
   * Clear old data from the cache
   */
  const clearOldCache = async () => {
    const values = await GM.listValues()

    for (const value of values) {
      const cache = await GM.getValue(value) // get cache
      if ((Date.now() - cache.time) > 3_600_000) { GM.deleteValue(value) } // delete old cache
    }
  }

  /**
   * Add ratings
   * @returns
   */
  const addRatings = async () => {
    clearOldCache() // clear old cache

    const id = await getID() // IMDb ID
    if (!id) return // check if the ID exists
    MU.log(`ID is '${id}'`)

    if ($('.title-block').length === 0) return // check if the target exists
    addTemplate() // add template

    rating.get(id).then((data) => { // get data
      rating.elaborate(data).then((data) => { // elaborate data
        const template = Handlebars.compile($('#external-ratings-template').html()) // compile template
        const context = { ratings: data }
        const compile = template(context)
        $('.external-ratings').html(compile)
      }).catch((error) => console.error(error))
    }).catch((error) => console.error(error))
  }

  //* Script
  $(document).ready(() => {
    let old = window.location.href // old page

    VM.observe(document.documentElement || document.body, () => { // observe
      if ($('.title-info:not(.visible-xs) a[href^="https://www.imdb.com/"]').length > 0) { // if a IMDb link exists
        const current = window.location.href // current page

        if (current !== old) { // check if I'm on a new page
          old = current// new old page

          $('.external-ratings, #external-ratings-template').remove() // remove old ratings
          addRatings() // add new ratings
        }
      }
    })

    addRatings() // add ratings
  })
})()
