// ==UserScript==
// @name            Ratings on TMDb
// @name:it         Valutazioni su TMDb
// @author          Davide <iFelix18@protonmail.com>
// @namespace       https://github.com/iFelix18
// @icon            https://www.google.com/s2/favicons?sz=64&domain=https://themoviedb.org
// @description     Adds ratings from IMDb, Rotten Tomatoes, Metacritic and MyAnimeList to TMDb
// @description:it  Aggiunge valutazioni da IMDb, Rotten Tomatoes, Metacritic e MyAnimeList a TMDb
// @copyright       2021, Davide (https://github.com/iFelix18)
// @license         MIT
// @version         2.1.3
// @homepage        https://github.com/iFelix18/Userscripts#readme
// @homepageURL     https://github.com/iFelix18/Userscripts#readme
// @supportURL      https://github.com/iFelix18/Userscripts/issues
// @updateURL       https://raw.githubusercontent.com/iFelix18/Userscripts/master/userscripts/meta/ratings-on-tmdb.meta.js
// @downloadURL     https://raw.githubusercontent.com/iFelix18/Userscripts/master/userscripts/ratings-on-tmdb.user.js
// @require         https://cdn.jsdelivr.net/gh/sizzlemctwizzle/GM_config@43fd0fe4de1166f343883511e53546e87840aeaf/gm_config.min.js
// @require         https://cdn.jsdelivr.net/gh/iFelix18/Userscripts@utils-2.3.4/lib/utils/utils.min.js
// @require         https://cdn.jsdelivr.net/gh/iFelix18/Userscripts@tmdb-1.5.3/lib/api/tmdb.min.js
// @require         https://cdn.jsdelivr.net/gh/iFelix18/Userscripts@omdb-1.2.4/lib/api/omdb.min.js
// @require         https://cdn.jsdelivr.net/gh/iFelix18/Userscripts@rottentomatoes-1.1.3/lib/api/rottentomatoes.min.js
// @require         https://cdn.jsdelivr.net/gh/iFelix18/Userscripts@jikan-1.0.0/lib/api/jikan.min.js
// @require         https://cdn.jsdelivr.net/gh/iFelix18/Userscripts@ratings-2.0.0/lib/utils/ratings.min.js
// @require         https://cdn.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.min.js
// @require         https://cdn.jsdelivr.net/npm/handlebars@4.7.7/dist/handlebars.min.js
// @match           *://www.themoviedb.org/movie/*
// @match           *://www.themoviedb.org/tv/*
// @connect         api.jikan.moe
// @connect         api.themoviedb.org
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

/* global $, GM_config, Handlebars, MonkeyUtils, Ratings, TMDb */

(() => {
  //* GM_config
  GM_config.init({
    id: 'config',
    title: `${GM.info.script.name} v${GM.info.script.version} Settings`,
    fields: {
      TMDbApiKey: {
        label: 'TMDb API Key',
        section: ['Enter your TMDb API Key', 'Get one at: https://developers.themoviedb.org/3/'],
        type: 'text',
        title: 'Your TMDb API Key',
        size: 70,
        default: ''
      },
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
        if (!GM_config.isOpen && (GM_config.get('TMDbApiKey') === '' | GM_config.get('OMDbApiKey') === '')) {
          window.addEventListener('load', () => GM_config.open())
        }
      },
      save: () => {
        if (!GM_config.isOpen && (GM_config.get('TMDbApiKey') === '' | GM_config.get('OMDbApiKey') === '')) {
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

  //* TMDb API
  const tmdb = new TMDb({
    apikey: GM_config.get('TMDbApiKey'),
    debug: GM_config.get('debugging')
  })

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
   * Returns TMDb ID
   * @returns {string}
   */
  const getID = () => {
    return /(\d+)/.exec(window.location.pathname.split('/')[2])[0]
  }

  /**
   * Returns TMDb type
   * @returns {string}
   */
  const getType = () => {
    return window.location.pathname.split('/')[1]
  }

  /**
   * Add template
   */
  const addTemplate = () => {
    const template = '<li class=external-ratings style=display:flex;margin-right:0></li><script id=external-ratings-template type=text/x-handlebars-template>{{#each ratings}} {{#ifEqual this.rating "N/A"}} {{else}} <a class=external-rating-link href={{this.url}} target=_blank><div class={{this.source}}-rating style=display:inline-flex;align-items:center;margin-right:20px><div class=logo style=display:inline-flex><img alt=logo src={{this.logo}} width=46></div><div class=text style=font-weight:700;margin-left:6px;display:inline-flex;flex-direction:column;align-items:flex-start><div class=vote style=display:flex;align-items:center;align-content:center;justify-content:center>{{this.rating}} {{#ifEqual this.rating "N/A"}} {{else}} <span style=font-weight:400;font-size:80%;opacity:.8>{{this.symbol}} </span>{{/ifEqual}}</div>{{#ifEqual this.votes "N/A"}} {{else}} {{#ifEqual this.source "metascore"}}<div class=votes style="display:flex;align-items:center;align-content:center;justify-content:center;background:linear-gradient(to top,transparent 0,transparent 25%,{{this.votes}} 25%,{{this.votes}} 75%,transparent 75%,transparent 100%);color:transparent">{{this.rating}}</div>{{else}}<div class=votes style=font-weight:400;opacity:.8>{{this.votes}}</div>{{/ifEqual}} {{/ifEqual}}</div></div></a>{{/ifEqual}} {{/each}}</script>'
    const target = 'section.inner_content section.header ul.actions li.chart'

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

    if ($('section.inner_content section.header ul.actions li.chart').length === 0) return // check if it is on the main page

    const id = getID() // TMDb ID
    const type = getType() // TMDB type

    if (!id) return // check if an ID exists

    tmdb.externalIDs(type, id).then((response) => {
      const id = response.imdb_id // IMDb ID

      if (!id) return // check if an ID exists

      MU.log(`ID is '${id}'`)

      addTemplate()

      rating.get(id).then((data) => {
        rating.elaborate(data).then((data) => {
          const template = Handlebars.compile($('#external-ratings-template').html())
          const context = { ratings: data }
          const compile = template(context)

          $('.external-ratings').html(compile)
        }).catch((error) => console.error(error))
      }).catch((error) => console.error(error))
    }).catch((error) => MU.error(error))
  })
})()
