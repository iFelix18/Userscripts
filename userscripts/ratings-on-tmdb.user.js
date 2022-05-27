// ==UserScript==
// @name               Ratings on TMDb
// @name:de            Bewertungen auf TMDb
// @name:es            Calificaciones en TMDb
// @name:fr            Évaluations sur TMDb
// @name:it            Valutazioni su TMDb
// @name:ru            Рейтинги на TMDb
// @name:zh-CN         TMDb上的评分
// @author             Davide <iFelix18@protonmail.com>
// @namespace          https://github.com/iFelix18
// @icon               https://www.google.com/s2/favicons?sz=64&domain=https://themoviedb.org
// @description        Adds ratings from IMDb, Rotten Tomatoes, Metacritic and MyAnimeList to TMDb
// @description:de     Fügt Bewertungen von IMDb, Rotten Tomatoes, Metacritic und MyAnimeList zu TMDb hinzu
// @description:es     Agrega las calificaciones de IMDb, Rotten Tomatoes, Metacritic y MyAnimeList a TMDb
// @description:fr     Ajoute des évaluations d'IMDb, Rotten Tomatoes, Metacritic et MyAnimeList à TMDb.
// @description:it     Aggiunge le valutazioni di IMDb, Rotten Tomatoes, Metacritic e MyAnimeList a TMDb
// @description:ru     Добавляет рейтинги IMDb, Rotten Tomatoes, Metacritic и MyAnimeList в TMDb
// @description:zh-CN  在TMDb中添加来自IMDb、烂番茄、Metacritic和MyAnimeList的评分。
// @copyright          2021, Davide (https://github.com/iFelix18)
// @license            MIT
// @version            3.0.1
// @homepage           https://github.com/iFelix18/Userscripts#readme
// @homepageURL        https://github.com/iFelix18/Userscripts#readme
// @supportURL         https://github.com/iFelix18/Userscripts/issues
// @updateURL          https://raw.githubusercontent.com/iFelix18/Userscripts/master/userscripts/meta/ratings-on-tmdb.meta.js
// @downloadURL        https://raw.githubusercontent.com/iFelix18/Userscripts/master/userscripts/ratings-on-tmdb.user.js
// @require            https://cdn.jsdelivr.net/gh/sizzlemctwizzle/GM_config@43fd0fe4de1166f343883511e53546e87840aeaf/gm_config.min.js
// @require            https://cdn.jsdelivr.net/npm/@ifelix18/utils@6.6.1/lib/index.min.js
// @require            https://cdn.jsdelivr.net/npm/@ifelix18/tmdb@2.0.0/lib/index.min.js
// @require            https://cdn.jsdelivr.net/npm/@ifelix18/omdb@2.0.0/lib/index.min.js
// @require            https://cdn.jsdelivr.net/npm/@ifelix18/rottentomatoes@2.0.0/lib/index.min.js
// @require            https://cdn.jsdelivr.net/npm/@ifelix18/jikan@2.0.0/lib/index.min.js
// @require            https://cdn.jsdelivr.net/npm/@ifelix18/ratings@4.0.0/lib/index.min.js
// @require            https://cdn.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.min.js
// @require            https://cdn.jsdelivr.net/npm/handlebars@4.7.7/dist/handlebars.min.js
// @require            https://cdn.jsdelivr.net/npm/tooltipster@4.2.8/dist/js/tooltipster.bundle.min.js
// @require            https://cdn.jsdelivr.net/npm/tooltipster-follower@0.1.5/dist/js/tooltipster-follower.min.js
// @resource           tooltipster https://cdn.jsdelivr.net/npm/tooltipster@4.2.8/dist/css/tooltipster.bundle.min.css
// @resource           follower    https://cdn.jsdelivr.net/npm/tooltipster-follower@0.1.5/dist/css/tooltipster-follower.min.css
// @match              *://www.themoviedb.org/*
// @connect            api.jikan.moe
// @connect            api.themoviedb.org
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

/* global $, GM_config, Handlebars, Ratings, TMDb, UU */

(() => {
  //* Constants
  const id = GM.info.script.name.toLowerCase().replace(/\s/g, '-')
  const title = `${GM.info.script.name} v${GM.info.script.version} Settings`
  const cachePeriod = 3_600_000
  const fields = {
    TMDbApiKey: {
      label: 'TMDb API Key',
      section: ['Enter your TMDb API Key', 'Get one at: https://developers.themoviedb.org/3/'],
      type: 'text',
      title: 'Your TMDb API Key',
      size: 50,
      default: ''
    },
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
    css: ':root{--accent:rgb(3, 37, 65);--background:rgb(24, 26, 27);--black:rgb(0, 0, 0);--font:"Source Sans Pro",Arial,sans-serif;--white:rgb(255, 255, 255)}#ratings-on-tmdb *{color:var(--white)!important;font-family:var(--font)!important;font-size:14px!important;font-weight:400!important}#ratings-on-tmdb{background:var(--background)!important}#ratings-on-tmdb .config_header{font-size:20pt!important;line-height:1.1!important}#ratings-on-tmdb .section_desc,#ratings-on-tmdb .section_header{background-color:var(--accent)!important;border:1px solid transparent!important;color:var(--white)!important}#ratings-on-tmdb .config_var{align-items:center!important;display:flex!important}#ratings-on-tmdb_field_OMDbApiKey,#ratings-on-tmdb_field_TMDbApiKey{background-color:var(--white)!important;border:1px solid var(--black)!important;color:var(--black)!important;flex:1!important}#ratings-on-tmdb input[type=checkbox]{appearance:none!important;background-color:var(--white)!important;border:1px solid var(--black)!important;cursor:pointer!important;height:15px!important;width:15px!important}#ratings-on-tmdb input[type=checkbox]:checked{appearance:checkbox!important;background-color:var(--accent)!important}#ratings-on-tmdb button,#ratings-on-tmdb input[type=button]{background:var(--white)!important;border:1px solid var(--black)!important;color:var(--black)!important}#ratings-on-tmdb button:hover,#ratings-on-tmdb input[type=button]:hover{filter:brightness(85%)!important}#ratings-on-tmdb .reset{margin-right:10px!important}',
    events: {
      init: () => {
        // initial configuration if OMDb API Key is missing
        if (!GM_config.isOpen && (GM_config.get('TMDbApiKey') === '' || GM_config.get('OMDbApiKey') === '')) {
          GM_config.open()
        }

        //! Userscripts Safari: GM.registerMenuCommand is missing
        if (GM.info.scriptHandler !== 'Userscripts') GM.registerMenuCommand('Configure', () => GM_config.open())
      },
      save: () => {
        if (GM_config.isOpen) {
          if (GM_config.get('TMDbApiKey') === '' || GM_config.get('OMDbApiKey') === '') {
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

  //* TMDb API
  const tmdb = new TMDb({
    api_key: GM_config.get('TMDbApiKey'),
    debug: GM_config.get('debugging')
  })

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
   * Adds various resources to the head
   */
  const addResources = () => {
    // add tooltipster resources
    UU.resource.add('tooltipster', 'stylesheet')
    UU.resource.add('follower', 'stylesheet')
    // add tooltipster customized style
    UU.addStyle('.tooltipster-follower.tooltipster-light.tooltipster-light-customized { height: fit-content !important; } .tooltipster-follower.tooltipster-light.tooltipster-light-customized .tooltipster-box { border-radius: 8px !important; } .tooltipster-follower.tooltipster-light.tooltipster-light-customized .tooltipster-content { padding: 8px 20px !important; padding-right: 0px !important; }')
  }

  /**
   * Adds a link to the menu to access the script configuration
   */
  const addSettings = () => {
    const menu = `<li class="${id} k-item k-menu-item k-state-default"role=menuitem style=z-index:auto><a class="k-link k-menu-link"href=""onclick=return!1>${GM.info.script.name}</a>`

    $('header div.nav_wrapper > .k-menu:not(.k-context-menu) > .k-item').last().after(menu)
    $(`.${id}`).click(() => GM_config.open())
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
   * Get item data
   *
   * @param {*} item Item
   * @returns {object} Data
   */
  const getData = (item) => {
    switch (typeof item) {
      case 'undefined': {
        const id = /(\d+)/.exec(window.location.pathname.split('/')[2])[0]
        const type = window.location.pathname.split('/')[1]

        return { id, type }
      }
      case 'object': {
        const data = $(item).find('.options').data()
        const id = data.id
        const type = data.mediaType

        return { id, type }
      }
      default:
        break
    }
  }

  /**
   * Add template
   *
   * @param {object} target HTML target for template
   */
  const addTemplate = (target) => {
    const template = '<li class=external-ratings style=display:flex;margin-right:0></li><script id=external-ratings-template type=text/x-handlebars-template>{{#each ratings}} {{#ifEqual this.rating "N/A"}} {{else}} <a class=external-rating-link href={{this.url}} target=_blank><div class={{this.source}}-rating style=display:inline-flex;align-items:center;margin-right:20px><div class=logo style=display:inline-flex><img alt=logo src={{this.logo}} width=46></div><div class=text style=font-weight:700;margin-left:6px;display:inline-flex;flex-direction:column;align-items:flex-start><div class=vote style=display:flex;align-items:center;align-content:center;justify-content:center>{{this.rating}} {{#ifEqual this.rating "N/A"}} {{else}} <span style=font-weight:400;font-size:80%;opacity:.8>{{this.symbol}} </span>{{/ifEqual}}</div>{{#ifEqual this.votes "N/A"}} {{else}} {{#ifEqual this.source "metascore"}}<div class=votes style="display:flex;align-items:center;align-content:center;justify-content:center;background:linear-gradient(to top,transparent 0,transparent 25%,{{this.votes}} 25%,{{this.votes}} 75%,transparent 75%,transparent 100%);color:transparent">{{this.rating}}</div>{{else}}<div class=votes style=font-weight:400;opacity:.8>{{this.votes}}</div>{{/ifEqual}} {{/ifEqual}}</div></div></a>{{/ifEqual}} {{/each}}</script>'

    $(template).insertAfter(target)
  }

  //* Script
  $(async () => {
    addResources() // add resources
    addSettings() // add settings
    clearOldCache() // clear old cache

    // check if it is on the main page
    const target = $('section.inner_content section.header ul.actions li.chart')
    if (target.length === 0) return

    // get item data
    const data = getData()
    let id = data.id // TMDb ID
    const type = data.type // TMDB type
    if (!id) return // check if an ID exists

    id = type === 'movie'
      ? await tmdb.movie.external_ids({ movie_id: id }).then(ids => ids.imdb_id).catch(error => console.error(error))
      : (type === 'tv'
          ? await tmdb.tv.external_ids({ tv_id: id }).then(ids => ids.imdb_id).catch(error => console.error(error))
          : undefined)
    if (!id) return // check if an ID exists
    UU.log(`ID is '${id}'`)

    // get ratings
    const ratings = await rating.get({ id }).then().catch(error => console.error(error))
    const elaboratedRatings = await rating.elaborate(ratings).then().catch(error => console.error(error))

    // add template
    addTemplate(target)

    // compile template
    const template = Handlebars.compile($('#external-ratings-template').html())
    $('.external-ratings').html(template({ ratings: elaboratedRatings }))
  })

  UU.observe.creation('div.media.discover div.card.style_1', (item) => { // tooltipster
    $(item).tooltipster({
      content: '<span class=loading style=padding-right:20px>Loading...</span>',
      contentAsHTML: true,
      plugins: ['follower'],
      theme: ['tooltipster-light', 'tooltipster-light-customized'],
      updateAnimation: false,
      functionBefore: async (instance, helper) => {
        const $origin = $(helper.origin)

        $(item).find('*').contents().removeAttr('title') // ? fix double tooltip

        // get item data
        const data = getData(item)
        let id = data.id // TMDb ID
        const type = data.type // TMDB type
        if (!id) return // check if an ID exists

        id = type === 'movie'
          ? await tmdb.movie.external_ids({ movie_id: id }).then(ids => ids.imdb_id).catch(error => console.error(error))
          : (type === 'tv'
              ? await tmdb.tv.external_ids({ tv_id: id }).then(ids => ids.imdb_id).catch(error => console.error(error))
              : undefined)
        if (!id) return // check if an ID exists
        UU.log(`ID is '${id}'`)

        // tooltipster data has not been loaded yet
        if ($origin.data('loaded') !== true) {
          // get ratings
          const ratings = await rating.get({ id }).then().catch(error => console.error(error))
          const elaboratedRatings = await rating.elaborate(ratings).then().catch(error => console.error(error))
          for (const key of Object.keys(elaboratedRatings)) { // delete empty from data
            if (elaboratedRatings[key].rating === 'N/A') delete elaboratedRatings[key]
          }

          // compile template
          if ($.isEmptyObject(elaboratedRatings)) { // ratings unavailable
            instance.content('<span class=ratings-unavailable style=padding-right:20px>Ratings not available</span>')
          } else {
            const template = Handlebars.compile('{{#each ratings}} <a class=external-rating-link href={{this.url}} target=_blank><div class={{this.source}}-rating style=display:inline-flex;align-items:center;margin-right:20px><div class=logo style=display:inline-flex><img alt=logo src={{this.logo}} width=46></div><div class=text style=font-weight:700;margin-left:6px;display:inline-flex;flex-direction:column;align-items:flex-start><div class=vote style=display:flex;align-items:center;align-content:center;justify-content:center>{{this.rating}} <span style=font-weight:400;font-size:80%;opacity:.8>{{this.symbol}}</span></div>{{#ifEqual this.votes "N/A"}} {{else}} {{#ifEqual this.source "metascore"}}<div class=votes style="display:flex;align-items:center;align-content:center;justify-content:center;background:linear-gradient(to top,transparent 0,transparent 25%,{{this.votes}} 25%,{{this.votes}} 75%,transparent 75%,transparent 100%);color:transparent">{{this.rating}}</div>{{else}}<div class=votes style=font-weight:400;opacity:.8>{{this.votes}}</div>{{/ifEqual}} {{/ifEqual}}</div></div></a>{{/each}}')
            instance.content(template({ ratings: elaboratedRatings }))
          }

          // now tooltipster data has been loaded
          $origin.data('loaded', true)
        }
      }
    })
  })
})()
