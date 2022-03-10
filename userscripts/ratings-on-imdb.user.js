// ==UserScript==
// @name               Ratings on IMDb
// @name:de            Bewertungen auf IMDb
// @name:es            Calificaciones en IMDb
// @name:fr            Évaluations sur IMDb
// @name:it            Valutazioni su IMDb
// @name:ru            Рейтинги на IMDb
// @name:zh-CN         IMDb上的评分
// @author             Davide <iFelix18@protonmail.com>
// @namespace          https://github.com/iFelix18
// @icon               https://www.google.com/s2/favicons?sz=32&domain=https://imdb.com
// @description        Adds ratings from Rotten Tomatoes, Metacritic and MyAnimeList to IMDb
// @description:de     Fügt Bewertungen von Rotten Tomatoes, Metacritic und MyAnimeList zu IMDb hinzu
// @description:es     Agrega las calificaciones de Rotten Tomatoes, Metacritic y MyAnimeList a IMDb
// @description:fr     Ajout des évaluations de Rotten Tomatoes, Metacritic et MyAnimeList à IMDb
// @description:it     Aggiunge valutazioni da Rotten Tomatoes, Metacritic e MyAnimeList a IMDb
// @description:ru     Добавляет рейтинги от Rotten Tomatoes, Metacritic и MyAnimeList на IMDb
// @description:zh-CN  将烂番茄、Metacritic和MyAnimeList的评级添加到IMDb中。
// @copyright          2021, Davide (https://github.com/iFelix18)
// @license            MIT
// @version            2.3.5
// @homepage           https://github.com/iFelix18/Userscripts#readme
// @homepageURL        https://github.com/iFelix18/Userscripts#readme
// @supportURL         https://github.com/iFelix18/Userscripts/issues
// @updateURL          https://raw.githubusercontent.com/iFelix18/Userscripts/master/userscripts/meta/ratings-on-imdb.meta.js
// @downloadURL        https://raw.githubusercontent.com/iFelix18/Userscripts/master/userscripts/ratings-on-imdb.user.js
// @require            https://cdn.jsdelivr.net/gh/sizzlemctwizzle/GM_config@43fd0fe4de1166f343883511e53546e87840aeaf/gm_config.min.js
// @require            https://cdn.jsdelivr.net/npm/@ifelix18/utils@5.1.1/lib/index.min.js
// @require            https://cdn.jsdelivr.net/npm/@ifelix18/omdb@2.0.0/lib/index.min.js
// @require            https://cdn.jsdelivr.net/npm/@ifelix18/rottentomatoes@2.0.0/lib/index.min.js
// @require            https://cdn.jsdelivr.net/npm/@ifelix18/jikan@2.0.0/lib/index.min.js
// @require            https://cdn.jsdelivr.net/npm/@ifelix18/ratings@4.0.0/lib/index.min.js
// @require            https://cdn.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.min.js
// @require            https://cdn.jsdelivr.net/npm/handlebars@4.7.7/dist/handlebars.min.js
// @match              *://www.imdb.com/*
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

/* global $, GM_configStruct, Handlebars, Ratings, UserscriptUtils */

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

        config.close()
      }
    }
  }
  const title = `${GM.info.script.name} v${GM.info.script.version} Settings`
  UserscriptUtils.migrateConfig('config', id) // migrate to the new config ID

  if (document.location.pathname === '/settings/') {
    document.title = title
    config.init({
      frame: $('body').empty().get(0),
      id,
      title,
      fields,
      css: '#ratings-on-imdb *{font-family:Roboto,Helvetica,Arial,sans-serif!important}#ratings-on-imdb{background-color:transparent!important;border:1px solid transparent!important;box-sizing:border-box!important;height:auto!important;list-style-type:none!important;margin-bottom:0!important;margin-left:auto!important;margin-right:auto!important;margin-top:0!important;max-height:none!important;max-width:1200px!important;padding:0 1em 1em!important;position:static!important;width:auto!important}#ratings-on-imdb .config_header{display:block!important;font-size:1.5em!important;font-weight:700!important;margin-bottom:.83em!important;margin-left:0!important;margin-right:0!important;margin-top:.83em!important}#ratings-on-imdb .section_desc,#ratings-on-imdb .section_header{background-color:#e2b616!important;background-image:none!important;border:1px solid transparent!important;color:#000!important}#ratings-on-imdb .config_var{align-items:center!important;display:flex!important}#ratings-on-imdb .field_label{font-size:.85em!important;font-weight:600!important;margin-left:6px!important}#ratings-on-imdb_field_OMDbApiKey{flex:1!important}#ratings-on-imdb_buttons_holder{color:inherit!important}#ratings-on-imdb button,#ratings-on-imdb input[type=button]{font-size:.85em!important;font-weight:600!important}#ratings-on-imdb_closeBtn{display:none!important}#ratings-on-imdb .reset{color:inherit!important}',
      events: {
        init: () => {
          config.open()
        },
        save: () => {
          if (config.get('OMDbApiKey') === '') {
            window.alert(`${GM.info.script.name}: check your settings and save`)
          } else {
            window.alert(`${GM.info.script.name}: settings saved`)
            if ('referrer' in document && document.referrer !== '') {
              window.location = document.referrer
            } else {
              window.history.back()
            }
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
    const menu = `<div class="${id}_settings dAMWXo"><a aria-disabled=false class="ipc-button ipc-button--center-align-content ipc-button--core-baseAlt ipc-button--default-height ipc-button--on-textPrimary ipc-button--single-padding ipc-button--theme-baseAlt ipc-text-button"href=/settings/ role=button tabindex=0><div class=ipc-button__text>${GM.info.script.name}</div></a></div>`

    $('.dtcBHE .navbar__inner > .Root__Separator-sc-7p0yen-1').after(menu)
  }

  /**
   * Returns IMDb ID
   *
   * @returns {string} ID
   */
  const getID = () => {
    return $('meta[property="imdb:pageConst"]').first().attr('content')
  }

  /**
   * Add template
   *
   * @param {object} target HTML target for template
   */
  const addTemplate = (target) => {
    /* cspell: disable-next-line */
    const template = '<div class="external-ratings idYUsR" style=margin-right:.5rem></div><script id=external-ratings-template type=text/x-handlebars-template>{{#each ratings}} {{#ifEqual this.rating "N/A"}} {{else}}<div class="jQXoLQ rating-bar__base-button {{this.source}}-rating"><div class="bufoWn external-rating-title" style=text-transform:uppercase>{{this.source}}</div><a class="external-rating-link ipc-button ipc-button--core-baseAlt ipc-button--on-textPrimary ipc-text-button" href={{this.url}}><div class=ipc-button__text><div class=jodtvN><div class="dwhzFZ external-rating-logo"><img alt=logo src={{this.logo}} width=24></div><div class=hmJkIS><div class=bmbYRW><span class="external-rating-vote iTLWoV">{{this.rating}} </span>{{#ifEqual this.rating "N/A"}} {{else}} <span class=external-rating-symbol>{{this.symbol}} </span>{{/ifEqual}}</div><div class=fKXaGo></div>{{#ifEqual this.rating "N/A"}} {{else}} {{#ifEqual this.source "metascore"}}<div class="external-rating-votes jkCVKJ" style="display:flex;align-items:center;align-content:center;justify-content:center;background:linear-gradient(to top,transparent 0,transparent 25%,{{this.votes}} 25%,{{this.votes}} 75%,transparent 75%,transparent 100%);color:transparent;width:100%">{{this.rating}}</div>{{else}}<div class="external-rating-votes jkCVKJ">{{this.votes}}</div>{{/ifEqual}} {{/ifEqual}}</div></div></div></a></div>{{/ifEqual}} {{/each}}</script>'

    $(template).insertAfter(target)
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

  //* Script
  $(document).ready(async () => {
    addSettings() // add settings
    clearOldCache() // clear old cache

    const target = $('.hglRHk div[class^="RatingBar__ButtonContainer"] div[class^="RatingBarButtonBase__ContentWrap"]:nth-child(1)')
    if (target.length === 0) return // check if it is on the main page

    const id = getID() // IMDb ID
    if (!id) return // check if an ID exists
    UU.log(`ID is '${id}'`)

    addTemplate(target) // add template

    // get ratings
    const ratings = await rating.get({ id }).then().catch(error => console.error(error))
    const elaboratedRatings = await rating.elaborate(ratings).then().catch(error => console.error(error))
    for (const key of Object.keys(elaboratedRatings).filter(key => new Set(['imdb']).has(key))) { // delete IMDb from data
      delete elaboratedRatings[key]
    }

    // compile template
    const template = Handlebars.compile($('#external-ratings-template').html())
    const context = { ratings: elaboratedRatings }
    const compile = template(context)
    $('.external-ratings').html(compile)
  })
})()
