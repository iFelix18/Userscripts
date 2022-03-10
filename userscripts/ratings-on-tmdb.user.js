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
// @version            2.3.2
// @homepage           https://github.com/iFelix18/Userscripts#readme
// @homepageURL        https://github.com/iFelix18/Userscripts#readme
// @supportURL         https://github.com/iFelix18/Userscripts/issues
// @updateURL          https://raw.githubusercontent.com/iFelix18/Userscripts/master/userscripts/meta/ratings-on-tmdb.meta.js
// @downloadURL        https://raw.githubusercontent.com/iFelix18/Userscripts/master/userscripts/ratings-on-tmdb.user.js
// @require            https://cdn.jsdelivr.net/gh/sizzlemctwizzle/GM_config@43fd0fe4de1166f343883511e53546e87840aeaf/gm_config.min.js
// @require            https://cdn.jsdelivr.net/npm/@ifelix18/utils@5.1.1/lib/index.min.js
// @require            https://cdn.jsdelivr.net/npm/@ifelix18/tmdb@2.0.0/lib/index.min.js
// @require            https://cdn.jsdelivr.net/npm/@ifelix18/omdb@2.0.0/lib/index.min.js
// @require            https://cdn.jsdelivr.net/npm/@ifelix18/rottentomatoes@2.0.0/lib/index.min.js
// @require            https://cdn.jsdelivr.net/npm/@ifelix18/jikan@2.0.0/lib/index.min.js
// @require            https://cdn.jsdelivr.net/npm/@ifelix18/ratings@4.0.0/lib/index.min.js
// @require            https://cdn.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.min.js
// @require            https://cdn.jsdelivr.net/npm/handlebars@4.7.7/dist/handlebars.min.js
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

/* global $, GM_configStruct, Handlebars, Ratings, TMDb, UserscriptUtils */

(() => {
  //* Constants
  const cachePeriod = 3_600_000
  const id = GM.info.script.name.toLowerCase().replace(/\s/g, '-')

  //* GM_config
  const config = new GM_configStruct()
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
      css: '#ratings-on-tmdb *{font-family:Source Sans Pro,Arial,sans-serif!important}#ratings-on-tmdb{background-color:transparent!important;border:1px solid transparent!important;box-sizing:border-box!important;height:auto!important;list-style-type:none!important;margin-bottom:0!important;margin-left:auto!important;margin-right:auto!important;margin-top:0!important;max-height:none!important;max-width:1200px!important;padding:0 1em 1em!important;position:static!important;width:auto!important}#ratings-on-tmdb .config_header{display:block!important;font-size:1.5em!important;font-weight:700!important;margin-bottom:.83em!important;margin-left:0!important;margin-right:0!important;margin-top:.83em!important}#ratings-on-tmdb .section_desc,#ratings-on-tmdb .section_header{background-color:#032541!important;background-image:none!important;border:1px solid transparent!important;color:#fff!important}#ratings-on-tmdb .config_var{align-items:center!important;display:flex!important}#ratings-on-tmdb .field_label{font-size:.85em!important;font-weight:600!important;margin-left:6px!important}#ratings-on-tmdb_field_OMDbApiKey,#ratings-on-tmdb_field_TMDbApiKey{flex:1!important}#ratings-on-tmdb_buttons_holder{color:inherit!important}#ratings-on-tmdb button,#ratings-on-tmdb input[type=button]{font-size:.85em!important;font-weight:600!important}#ratings-on-tmdb_closeBtn{display:none!important}#ratings-on-tmdb .reset{color:inherit!important}',
      events: {
        init: () => {
          config.open()
        },
        save: () => {
          if (config.get('TMDbApiKey') === '' || config.get('OMDbApiKey') === '') {
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
          if (!config.isOpen && (config.get('TMDbApiKey') === '' || config.get('OMDbApiKey') === '')) {
            window.location = '/settings/'
          }
          if (GM.info.scriptHandler !== 'Userscripts') { //! Userscripts Safari: GM.registerMenuCommand is missing
            GM.registerMenuCommand('Configure', () => config.open())
          }
        },
        save: () => {
          if (config.get('TMDbApiKey') === '' || config.get('OMDbApiKey') === '') {
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

  //* TMDb API
  const tmdb = new TMDb({
    api_key: config.get('TMDbApiKey'),
    debug: config.get('debugging')
  })

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
    const menu = `<li class="${id}_settings k-item k-menu-item k-state-default"role=menuitem style=z-index:auto><a class="k-link k-menu-link"href=/settings/ >${GM.info.script.name}</a>`

    $('header div.nav_wrapper > .k-menu:not(.k-context-menu) > .k-item').last().after(menu)
  }

  /**
   * Returns TMDb ID
   *
   * @returns {string} ID
   */
  const getID = () => {
    return /(\d+)/.exec(window.location.pathname.split('/')[2])[0]
  }

  /**
   * Returns TMDb type
   *
   * @returns {string} Type
   */
  const getType = () => {
    return window.location.pathname.split('/')[1]
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
  $(document).ready(async () => {
    addSettings() // add settings
    clearOldCache() // clear old cache

    const target = $('section.inner_content section.header ul.actions li.chart')
    if (target.length === 0) return // check if it is on the main page

    let id = getID() // TMDb ID
    const type = getType() // TMDB type
    if (!id) return // check if an ID exists

    // get IMDb ID
    id = type === 'movie'
      ? await tmdb.movie.external_ids({ movie_id: id }).then(ids => ids.imdb_id).catch(error => console.error(error))
      : (type === 'tv'
          ? await tmdb.tv.external_ids({ tv_id: id }).then(ids => ids.imdb_id).catch(error => console.error(error))
          : undefined)
    if (!id) return // check if an ID exists
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
  })
})()
