// ==UserScript==
// @name            Ratings on IMDb
// @name:it         Valutazioni su IMDb
// @author          Davide <iFelix18@protonmail.com>
// @namespace       https://github.com/iFelix18
// @icon            https://www.google.com/s2/favicons?sz=32&domain=https://imdb.com
// @description     Adds ratings from Rotten Tomatoes and Metacritic to IMDb
// @description:it  Aggiunge valutazioni da Rotten Tomatoes e Metacritic a IMDb
// @copyright       2021, Davide (https://github.com/iFelix18)
// @license         MIT
// @version         2.1.0
// @homepage        https://github.com/iFelix18/Userscripts#readme
// @homepageURL     https://github.com/iFelix18/Userscripts#readme
// @supportURL      https://github.com/iFelix18/Userscripts/issues
// @updateURL       https://raw.githubusercontent.com/iFelix18/Userscripts/master/userscripts/meta/ratings-on-imdb.meta.js
// @downloadURL     https://raw.githubusercontent.com/iFelix18/Userscripts/master/userscripts/ratings-on-imdb.user.js
// @require         https://cdn.jsdelivr.net/gh/sizzlemctwizzle/GM_config@43fd0fe4de1166f343883511e53546e87840aeaf/gm_config.min.js
// @require         https://cdn.jsdelivr.net/gh/iFelix18/Userscripts@utils-2.3.4/lib/utils/utils.min.js
// @require         https://cdn.jsdelivr.net/gh/iFelix18/Userscripts@omdb-1.2.4/lib/api/omdb.min.js
// @require         https://cdn.jsdelivr.net/gh/iFelix18/Userscripts@rottentomatoes-1.1.3/lib/api/rottentomatoes.min.js
// @require         https://cdn.jsdelivr.net/gh/iFelix18/Userscripts@jikan-1.0.0/lib/api/jikan.min.js
// @require         https://cdn.jsdelivr.net/gh/iFelix18/Userscripts@ratings-2.0.0/lib/utils/ratings.min.js
// @require         https://cdn.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.min.js
// @require         https://cdn.jsdelivr.net/npm/handlebars@4.7.7/dist/handlebars.min.js
// @match           *://www.imdb.com/title/*
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

/* global $, GM_config, Handlebars, MonkeyUtils, Ratings */

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
    return $('meta[property="imdb:pageConst"]').first().attr('content')
  }

  /**
   * Add template
   */
  const addTemplate = () => {
    /* cspell: disable-next-line */
    const template = '<div class="external-ratings idYUsR" style=margin-right:.5rem></div><script id=external-ratings-template type=text/x-handlebars-template>{{#each ratings}} {{#ifEqual this.rating "N/A"}} {{else}}<div class="jQXoLQ rating-bar__base-button {{this.source}}-rating"><div class="bufoWn external-rating-title" style=text-transform:uppercase>{{this.source}}</div><a class="external-rating-link ipc-button ipc-button--core-baseAlt ipc-button--on-textPrimary ipc-text-button" href={{this.url}}><div class=ipc-button__text><div class=jodtvN><div class="dwhzFZ external-rating-logo"><img alt=logo src={{this.logo}} width=24></div><div class=hmJkIS><div class=bmbYRW><span class="external-rating-vote iTLWoV">{{this.rating}} </span>{{#ifEqual this.rating "N/A"}} {{else}} <span class=external-rating-symbol>{{this.symbol}} </span>{{/ifEqual}}</div><div class=fKXaGo></div>{{#ifEqual this.rating "N/A"}} {{else}} {{#ifEqual this.source "metascore"}}<div class="external-rating-votes jkCVKJ" style="display:flex;align-items:center;align-content:center;justify-content:center;background:linear-gradient(to top,transparent 0,transparent 25%,{{this.votes}} 25%,{{this.votes}} 75%,transparent 75%,transparent 100%);color:transparent;width:100%">{{this.rating}}</div>{{else}}<div class="external-rating-votes jkCVKJ">{{this.votes}}</div>{{/ifEqual}} {{/ifEqual}}</div></div></div></a></div>{{/ifEqual}} {{/each}}</script>'
    const target = '.hglRHk div[class^="RatingBar__ButtonContainer"] div[class^="RatingBarButtonBase__ContentWrap"]:nth-child(1)'

    $(template).insertAfter(target)
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

  //* Script
  $(document).ready(() => {
    clearOldCache()

    if ($('.hglRHk div[class^="RatingBar__ButtonContainer"] div[class^="RatingBarButtonBase__ContentWrap"]:nth-child(1)').length === 0) return // check if it is on the main page

    const id = getID() // IMDb ID

    if (!id) return // check if an ID exists

    MU.log(`ID is '${id}'`)

    addTemplate()

    rating.get(id).then((data) => {
      rating.elaborate(data).then((data) => {
        for (const key of Object.keys(data).filter(key => new Set(['imdb']).has(key))) delete data[key] // delete IMDb from data

        const template = Handlebars.compile($('#external-ratings-template').html())
        const context = { ratings: data }
        const compile = template(context)

        $('.external-ratings').html(compile)
      }).catch((error) => console.error(error))
    }).catch((error) => console.error(error))
  })
})()
