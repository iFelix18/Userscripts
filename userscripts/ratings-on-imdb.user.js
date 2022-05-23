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
// @version            2.4.1
// @homepage           https://github.com/iFelix18/Userscripts#readme
// @homepageURL        https://github.com/iFelix18/Userscripts#readme
// @supportURL         https://github.com/iFelix18/Userscripts/issues
// @updateURL          https://raw.githubusercontent.com/iFelix18/Userscripts/master/userscripts/meta/ratings-on-imdb.meta.js
// @downloadURL        https://raw.githubusercontent.com/iFelix18/Userscripts/master/userscripts/ratings-on-imdb.user.js
// @require            https://cdn.jsdelivr.net/gh/sizzlemctwizzle/GM_config@43fd0fe4de1166f343883511e53546e87840aeaf/gm_config.min.js
// @require            https://cdn.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.min.js
// @require            https://cdn.jsdelivr.net/npm/@ifelix18/utils@6.4.0/lib/index.min.js
// @require            https://cdn.jsdelivr.net/npm/@ifelix18/omdb@2.0.0/lib/index.min.js
// @require            https://cdn.jsdelivr.net/npm/@ifelix18/rottentomatoes@2.0.0/lib/index.min.js
// @require            https://cdn.jsdelivr.net/npm/@ifelix18/jikan@2.0.0/lib/index.min.js
// @require            https://cdn.jsdelivr.net/npm/@ifelix18/ratings@4.0.0/lib/index.min.js
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
// @run-at             document-start
// @inject-into        content
// ==/UserScript==

/* global $, GM_config, Handlebars, Ratings, UU */

(() => {
  //* Constants
  const id = GM.info.script.name.toLowerCase().replace(/\s/g, '-')
  const title = `${GM.info.script.name} v${GM.info.script.version} Settings`
  const cachePeriod = 3_600_000
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

        GM_config.close()
      }
    }
  }

  //* GM_config
  GM_config.init({
    id,
    title,
    fields,
    css: '#ratings-on-imdb *{color:#fff!important;font-family:Roboto,Helvetica,Arial,sans-serif!important;font-size:14px!important;font-weight:400!important}#ratings-on-imdb{background:#121212!important}#ratings-on-imdb .section_desc,#ratings-on-imdb .section_header{background-color:#e2b616!important;border:1px solid transparent!important;color:#000!important}#ratings-on-imdb .config_var{display:flex!important}#ratings-on-imdb_field_OMDbApiKey{color:#000!important;flex:1!important}#ratings-on-imdb button,#ratings-on-imdb input[type=button]{background:#fff!important;border:1px solid transparent!important;color:#000!important}#ratings-on-imdb button:hover,#ratings-on-imdb input[type=button]:hover{filter:brightness(85%)!important}#ratings-on-imdb .reset{margin-right:10px!important}',
    events: {
      init: () => {
        // initial configuration if OMDb API Key is missing
        if (!GM_config.isOpen && GM_config.get('OMDbApiKey') === '') {
          GM_config.open()
        }

        //! Userscripts Safari: GM.registerMenuCommand is missing
        if (GM.info.scriptHandler !== 'Userscripts') GM.registerMenuCommand('Configure', () => GM_config.open())
      },
      save: () => {
        if (GM_config.isOpen) {
          if (GM_config.get('OMDbApiKey') === '') {
            UU.alert('check your settings and save')
          } else {
            UU.alert('settings saved')
            GM_config.close()
            setTimeout(window.location.reload(false), 500)
          }
        }
      }
    }
  })

  //* Utils
  UU.init({ id, logging: GM_config.get('logging') })

  //* Ratings
  const rating = new Ratings({
    omdb_api_key: GM_config.get('OMDbApiKey'),
    cache_period: cachePeriod,
    debug: GM_config.get('debugging')
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
  const addSettingsToMenu = () => {
    const menu = `<div class=${id} style=order:5;white-space:nowrap;font:inherit><a href=""onclick=return!1 style=text-decoration:none;font-weight:bolder>${GM.info.script.name}</a></div>`

    $('.navbar__inner > .navbar__imdbpro').after(menu)
    $(`.${id}`).click(() => GM_config.open())
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
    const template = '<div style=display:inline-flex class=external-ratings></div><script id=external-ratings-template type=text/x-handlebars-template>{{#each ratings}} {{#ifEqual this.rating "N/A"}} {{else}}<div style=display:inline-flex;flex-direction:column;-moz-box-align:center;align-items:center;padding:.25rem;margin-right:.5rem class="rating-bar__base-button {{this.source}}-rating"><div style=text-transform:uppercase;font-family:Roboto,Helvetica,Arial,sans-serif;font-size:.75rem;font-weight:600;letter-spacing:.16667em;line-height:1rem;color:rgba(255,255,255,.7);white-space:nowrap;margin-bottom:.25rem class=external-rating-title>{{this.source}}</div><a class="external-rating-link ipc-button ipc-button--core-baseAlt ipc-button--on-textPrimary ipc-text-button" href={{this.url}}><div class=ipc-button__text><div style=display:flex;-moz-box-align:center;align-items:center><div style=display:flex;-moz-box-align:center;align-items:center;height:2rem;width:2rem;margin-right:.25rem class=external-rating-logo><img alt=logo src={{this.logo}} width=24></div><div style=display:inline-flex;flex-direction:column;align-items:flex-start;padding-right:.25rem><div style=display:flex;-moz-box-align:center;align-items:center;font-family:Roboto,Helvetica,Arial,sans-serif;font-size:1rem;font-weight:400;letter-spacing:.03125em;text-transform:none;color:rgba(255,255,255,.7);line-height:1.5rem;margin-bottom:-.125rem><span class=external-rating-vote style=font-family:Roboto,Helvetica,Arial,sans-serif;font-size:1.25rem;font-weight:600;letter-spacing:.0125em;line-height:1.5rem;text-transform:none;color:#fff;padding-right:.125rem>{{this.rating}} </span>{{#ifEqual this.rating "N/A"}} {{else}} <span class=external-rating-symbol>{{this.symbol}} </span>{{/ifEqual}}</div>{{#ifEqual this.rating "N/A"}} {{else}} {{#ifEqual this.source "metascore"}}<div style="font-family:Roboto,Helvetica,Arial,sans-serif;font-size:.75rem;font-weight:400;letter-spacing:.03333em;line-height:1rem;text-transform:none;color:transparent;width:100%;background:linear-gradient(to top,transparent 0,transparent 25%,{{this.votes}} 25%,{{this.votes}} 75%,transparent 75%,transparent 100%)" class=external-rating-votes>{{this.rating}}</div>{{else}}<div style=font-family:Roboto,Helvetica,Arial,sans-serif;font-size:.75rem;font-weight:400;letter-spacing:.03333em;line-height:1rem;text-transform:none;color:rgba(255,255,255,.7) class=external-rating-votes>{{this.votes}}</div>{{/ifEqual}} {{/ifEqual}}</div></div></div></a></div>{{/ifEqual}} {{/each}}</script>'

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
    addSettingsToMenu() // add settings
    clearOldCache() // clear old cache

    const target = $('section > div:nth-child(1) .rating-bar__base-button:nth-child(1)')
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
