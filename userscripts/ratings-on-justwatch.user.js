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
// @version            1.3.0
// @homepage           https://github.com/iFelix18/Userscripts#readme
// @homepageURL        https://github.com/iFelix18/Userscripts#readme
// @supportURL         https://github.com/iFelix18/Userscripts/issues
// @updateURL          https://raw.githubusercontent.com/iFelix18/Userscripts/master/userscripts/meta/ratings-on-justwatch.meta.js
// @downloadURL        https://raw.githubusercontent.com/iFelix18/Userscripts/master/userscripts/ratings-on-justwatch.user.js
// @require            https://cdn.jsdelivr.net/gh/sizzlemctwizzle/GM_config@43fd0fe4de1166f343883511e53546e87840aeaf/gm_config.min.js
// @require            https://cdn.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.min.js
// @require            https://cdn.jsdelivr.net/npm/@ifelix18/utils@6.4.0/lib/index.min.js
// @require            https://cdn.jsdelivr.net/npm/@ifelix18/omdb@2.0.0/lib/index.min.js
// @require            https://cdn.jsdelivr.net/npm/@ifelix18/rottentomatoes@2.0.0/lib/index.min.js
// @require            https://cdn.jsdelivr.net/npm/@ifelix18/jikan@2.0.0/lib/index.min.js
// @require            https://cdn.jsdelivr.net/npm/@ifelix18/ratings@4.0.0/lib/index.min.js
// @require            https://cdn.jsdelivr.net/npm/handlebars@4.7.7/dist/handlebars.min.js
// @match              *://www.justwatch.com/*
// @connect            api.jikan.moe
// @connect            imdb.com
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

        UU.log('cache cleared')
        GM_config.close()
      }
    }
  }

  //* GM_config
  GM_config.init({
    id,
    title,
    fields,
    css: '#ratings-on-justwatch *{font-family:Lato,Lato-fallback,Arial,sans-serif!important}#ratings-on-justwatch{background:#121212!important}#ratings-on-justwatch .section_desc,#ratings-on-justwatch .section_header{background-color:#fbc500!important;border:1px solid transparent!important;color:#000!important}#ratings-on-justwatch .config_var{display:flex!important}#ratings-on-justwatch_field_OMDbApiKey{background:#fff!important;color:#000!important;flex:1!important}#ratings-on-justwatch button,#ratings-on-justwatch input[type=button]{background:#fff!important;border:1px solid transparent!important;color:#000!important}#ratings-on-justwatch button:hover,#ratings-on-justwatch input[type=button]:hover{filter:brightness(85%)!important}#ratings-on-justwatch .reset{margin-right:10px!important}',
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
  const addSettings = () => {
    const menu = `<a class="${id} navbar__button__link"href=""onclick=return!1 title=Settings><span class=navbar__button__link__item>${GM.info.script.name}</span></a>`

    $('.navbar__wrapper > .navbar__button__link').last().after(menu)
    $(`.${id}`).click(() => GM_config.open())
  }

  /**
   * Returns IMDb ID
   *
   * @returns {string} ID
   */
  const getID = () => {
    let link = $('.title-info:not(.visible-xs) a[href^="https://www.imdb.com/"]').attr('href') // IMDb link
    if (!link) return // check if the link exists

    return new Promise((resolve, reject) => { // load last IMDb link
      GM.xmlHttpRequest({
        method: 'GET',
        url: link,
        onload: (response) => {
          link = GM.info.scriptHandler === 'Userscripts' ? response.responseURL : response.finalUrl //! Userscripts Safari: response.finalUrl is missing
          resolve(/\/title\/(tt\d*)/i.exec(link)[1]) // IMDb ID
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
  const addRatings = () => {
    UU.observe.creation('.title-block', async (element) => {
      clearOldCache() // clear old cache

      const id = await getID() // IMDb ID
      if (!id) return // check if the ID exists
      UU.log(`ID is '${id}'`)

      addTemplate(element) // add template

      // get ratings
      const ratings = await rating.get({ id }).then().catch(error => console.error(error))
      const elaboratedRatings = await rating.elaborate(ratings).then().catch(error => console.error(error))

      // compile template
      const template = Handlebars.compile($('#external-ratings-template').html())
      const context = { ratings: elaboratedRatings }
      const compile = template(context)
      $('.external-ratings').html(compile)
    }, { onlyFirstMatch: true })
  }

  //* Script
  $(document).ready(() => {
    UU.observe.creation('.searchbar-input-container.sc-ion-searchbar-md', () => {
      addSettings() // add settings
    }, { onlyFirstMatch: true })
    UU.observe.creation('.title-info:not(.visible-xs) a[href^="https://www.imdb.com/"]', () => {
      $('.external-ratings, #external-ratings-template').remove() // remove old ratings
      addRatings() // add ratings
    })
  })
})()
