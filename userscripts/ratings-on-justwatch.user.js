// ==UserScript==
// @name               Ratings on JustWatch
// @name:de            Bewertungen auf JustWatch
// @name:es            Calificaciones en JustWatch
// @name:fr            Évaluations sur JustWatch
// @name:it            Valutazioni su JustWatch
// @name:ru            Рейтинги на JustWatch
// @name:zh-CN         JustWatch上的评分
// @author             Davide <iFelix18@protonmail.com>
// @namespace          https://github.com/iFelix18
// @icon               https://www.google.com/s2/favicons?sz=64&domain=https://www.justwatch.com
// @description        Adds ratings from IMDb, Rotten Tomatoes, Metacritic and MyAnimeList to JustWatch
// @description:de     Fügt Bewertungen von IMDb, Rotten Tomatoes, Metacritic und MyAnimeList zu JustWatch hinzu
// @description:es     Agrega las calificaciones de IMDb, Rotten Tomatoes, Metacritic y MyAnimeList a JustWatch
// @description:fr     Ajoute des évaluations d'IMDb, Rotten Tomatoes, Metacritic et MyAnimeList à JustWatch.
// @description:it     Aggiunge le valutazioni di IMDb, Rotten Tomatoes, Metacritic e MyAnimeList a JustWatch
// @description:ru     Добавляет рейтинги IMDb, Rotten Tomatoes, Metacritic и MyAnimeList в JustWatch
// @description:zh-CN  在JustWatch中添加来自IMDb、烂番茄、Metacritic和MyAnimeList的评分。
// @copyright          2022, Davide (https://github.com/iFelix18)
// @license            MIT
// @version            1.2.0
// @homepage           https://github.com/iFelix18/Userscripts#readme
// @homepageURL        https://github.com/iFelix18/Userscripts#readme
// @supportURL         https://github.com/iFelix18/Userscripts/issues
// @updateURL          https://raw.githubusercontent.com/iFelix18/Userscripts/master/userscripts/meta/ratings-on-justwatch.meta.js
// @downloadURL        https://raw.githubusercontent.com/iFelix18/Userscripts/master/userscripts/ratings-on-justwatch.user.js
// @require            https://cdn.jsdelivr.net/gh/sizzlemctwizzle/GM_config@43fd0fe4de1166f343883511e53546e87840aeaf/gm_config.min.js
// @require            https://cdn.jsdelivr.net/npm/@ifelix18/utils@5.1.1/lib/index.min.js
// @require            https://cdn.jsdelivr.net/npm/@ifelix18/omdb@2.0.0/lib/index.min.js
// @require            https://cdn.jsdelivr.net/npm/@ifelix18/rottentomatoes@2.0.0/lib/index.min.js
// @require            https://cdn.jsdelivr.net/npm/@ifelix18/jikan@2.0.0/lib/index.min.js
// @require            https://cdn.jsdelivr.net/npm/@ifelix18/ratings@4.0.0/lib/index.min.js
// @require            https://cdn.jsdelivr.net/npm/node-creation-observer@1.2.0/release/node-creation-observer-latest.min.js
// @require            https://cdn.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.min.js
// @require            https://cdn.jsdelivr.net/npm/handlebars@4.7.7/dist/handlebars.min.js
// @match              *://www.justwatch.com/*
// @connect            api.jikan.moe
// @connect            omdbapi.com
// @connect            rottentomatoes.com
// @compatible         chrome
// @compatible         edge
// @compatible         firefox
// @compatible         safari
// @grant              GM_getValue
// @grant              GM_setValue
// @grant              GM.deleteValue
// @grant              GM.getValue
// @grant              GM.listValues
// @grant              GM.registerMenuCommand
// @grant              GM.setValue
// @grant              GM.xmlHttpRequest
// @run-at             document-idle
// @inject-into        content
// ==/UserScript==

/* global $, GM_configStruct, Handlebars, NodeCreationObserver, Ratings, UserscriptUtils */

(() => {
  //* Constants
  const cachePeriod = 3_600_000
  const id = GM.info.script.name.toLowerCase().replace(/\s/g, '-')

  //* GM_config
  const config = new GM_configStruct()
  const fields = {
    OMDbApiKey: {
      label: 'OMDb API Key',
      section: ['You can request a free OMDb API Key at:', 'https://www.omdbapi.com/apikey.aspx'],
      type: 'text',
      title: 'Your OMDb API Key',
      size: 20,
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

        UU.log('cache cleared')
        config.close()
      }
    }
  }
  const title = `${GM.info.script.name} v${GM.info.script.version} Settings`
  UserscriptUtils.migrateConfig('config', id) // migrate to the new config ID

  if (document.location.pathname === '/settings/') {
    document.title = title
    config.init({
      frame: $('html:not([dir]) pre').empty().get(0),
      id,
      title,
      fields,
      css: ':root{color-scheme:unset!important}#ratings-on-justwatch *{font-family:Lato,Lato-fallback,Arial,sans-serif!important;color:#000!important}#ratings-on-justwatch{background-color:transparent!important;border:1px solid transparent!important;box-sizing:border-box!important;height:auto!important;list-style-type:none!important;margin-bottom:0!important;margin-left:auto!important;margin-right:auto!important;margin-top:0!important;max-height:none!important;max-width:1200px!important;padding:0 1em 1em!important;position:static!important;width:auto!important}#ratings-on-justwatch .config_header{display:block!important;font-size:1.5em!important;font-weight:700!important;margin-bottom:.83em!important;margin-left:0!important;margin-right:0!important;margin-top:.83em!important}#ratings-on-justwatch .section_header{background-color:#fbc500!important;background-image:none!important;border:1px solid transparent!important}#ratings-on-justwatch .section_desc{background-color:transparent!important;border:1px solid transparent!important}#ratings-on-justwatch .config_var{align-items:center!important;display:flex!important}#ratings-on-justwatch .field_label{font-size:.85em!important;font-weight:600!important;margin-left:6px!important}#ratings-on-justwatch_field_OMDbApiKey{flex:1!important}#ratings-on-justwatch_closeBtn{display:none!important}',
      events: {
        init: () => {
          config.open()
        },
        save: () => {
          if (config.get('OMDbApiKey') === '') {
            window.alert(`${GM.info.script.name}: check your settings and save`)
          } else {
            window.alert(`${GM.info.script.name}: settings saved`)
            window.location = document.referrer
          }
        }
      }
    })
  } else {
    config.init({
      id,
      title,
      fields,
      events: {
        init: () => {
          if (!config.isOpen && config.get('OMDbApiKey') === '') {
            window.location = '/settings/'
          }
          if (GM.info.scriptHandler !== 'Userscripts') { //! Userscripts Safari: GM.registerMenuCommand is missing
            GM.registerMenuCommand('Configure', () => config.open())
          }
        },
        save: () => {
          if (config.get('OMDbApiKey') === '') {
            window.alert(`${GM.info.script.name}: check your settings and save`)
          } else {
            window.alert(`${GM.info.script.name}: settings saved`)
            config.close()
            setTimeout(window.location.reload(false), 500)
          }
        }
      }
    })
  }

  //* Utils
  const UU = new UserscriptUtils({
    name: GM.info.script.name,
    version: GM.info.script.version,
    author: GM.info.script.author,
    logging: config.get('logging')
  })
  UU.init(id)

  //* Ratings
  const rating = new Ratings({
    omdb_api_key: config.get('OMDbApiKey'),
    cache_period: cachePeriod,
    debug: config.get('debugging')
  })

  //* Handlebars
  Handlebars.registerHelper('ifEqual', function (a, b, options) {
    if (a === b) return options.fn(this)
    return options.inverse(this)
  })

  //* Functions
  /**
   * Adds a link to the menu to access the script configuration
   */
  const addSettings = () => {
    const menu = `<a href=/settings/ title=Settings class="${id}_settings navbar__button__link"><span class="navbar__button__link__item">${GM.info.script.name}</span></a>`
    $('.navbar__wrapper > .navbar__button__link').last().after(menu)
  }

  /**
   * Returns IMDb ID
   *
   * @returns {string} ID
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
   *
   * @param {object} target HTML target for template
   */
  const addTemplate = (target) => {
    const template = '<li class=external-ratings style=display:flex;margin-right:0></li><script id=external-ratings-template type=text/x-handlebars-template>{{#each ratings}} {{#ifEqual this.rating "N/A"}} {{else}} <a class=external-rating-link href={{this.url}} target=_blank><div class={{this.source}}-rating style=display:inline-flex;align-items:center;margin-right:20px><div class=logo style=display:inline-flex><img alt=logo src={{this.logo}} width=40></div><div class=text style=font-weight:700;margin-left:6px;display:inline-flex;flex-direction:column;align-items:flex-start;color:#fff><div class=vote style=display:flex;align-items:center;align-content:center;justify-content:center>{{this.rating}} {{#ifEqual this.rating "N/A"}} {{else}} <span style=font-weight:400;font-size:80%;color:#8a8d98>{{this.symbol}} </span>{{/ifEqual}}</div>{{#ifEqual this.votes "N/A"}} {{else}} {{#ifEqual this.source "metascore"}}<div class=votes style="display:flex;align-items:center;align-content:center;justify-content:center;background:linear-gradient(to top,transparent 0,transparent 25%,{{this.votes}} 25%,{{this.votes}} 75%,transparent 75%,transparent 100%);color:transparent">{{this.rating}}</div>{{else}}<div class=votes style=font-weight:400;color:#8a8d98>{{this.votes}}</div>{{/ifEqual}} {{/ifEqual}}</div></div></a>{{/ifEqual}} {{/each}}</script>'

    $(template).appendTo(target)
  }

  /**
   * Clear old data from the cache
   */
  const clearOldCache = async () => {
    const values = await GM.listValues()

    for (const value of values) {
      const cache = await GM.getValue(value) // get cache
      if ((Date.now() - cache.time) > cachePeriod) { GM.deleteValue(value) } // delete old cache
    }
  }

  /**
   * Add ratings
   */
  const addRatings = async () => {
    clearOldCache() // clear old cache

    const target = $('.title-block')
    if (target.length === 0) return // check if it is on the main page

    const id = await getID() // IMDb ID
    if (!id) return // check if the ID exists
    UU.log(`ID is '${id}'`)

    addTemplate(target) // add template

    // get ratings
    const ratings = await rating.get({ id }).then().catch(error => console.error(error))
    const elaboratedRatings = await rating.elaborate(ratings).then().catch(error => console.error(error))

    // compile template
    const template = Handlebars.compile($('#external-ratings-template').html())
    const context = { ratings: elaboratedRatings }
    const compile = template(context)
    $('.external-ratings').html(compile)
  }

  //* Script
  $(document).ready(() => {
    NodeCreationObserver.init(id)
    NodeCreationObserver.onCreation('.navbar__wrapper > .navbar__button__link:last-of-type', () => {
      addSettings() // add settings
    }, true)
    NodeCreationObserver.onCreation('.title-info:not(.visible-xs) a[href^="https://www.imdb.com/"]', () => {
      $('.external-ratings, #external-ratings-template').remove() // remove old ratings
      addRatings() // add ratings
    })
  })
})()
