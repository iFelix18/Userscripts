// ==UserScript==
// @author       Davide <iFelix18@protonmail.com>
// @namespace    https://github.com/iFelix18
// @exclude      *
// ==UserLibrary==
// @name         Wikidata
// @description  Wikidata for my userscripts
// @copyright    2022, Davide (https://github.com/iFelix18)
// @license      MIT
// @version      1.0.1
// @homepage     https://github.com/iFelix18/Userscripts
// @homepageURL  https://github.com/iFelix18/Userscripts
// @supportURL   https://github.com/iFelix18/Userscripts/issues
// ==/UserLibrary==
// @connect      query.wikidata.org
// @grant        GM.xmlHttpRequest
// ==/UserScript==

(() => {
  /**
   * Wikidata
   *
   * @see https://www.wikidata.org/wiki/Special:MyLanguage/Wikidata:SPARQL_query_service/Wikidata_Query_Help
   * @class
   */
  this.Wikidata = class {
    /**
     * Configuration
     *
     * @param {object} config Configuration
     * @param {string} [config.endpoint='https://query.wikidata.org'] Wikidata endpoint
     * @param {boolean} [config.debug=false] Debug
     */
    constructor (config = {}) {
      /**
       * @private
       */
      this._config = {
        endpoint: config.endpoint || 'https://query.wikidata.org',
        debug: config.debug || false
      }

      /**
       * @private
       */
      this._headers = {
        Accept: 'application/sparql-results+json'
      }

      /**
       * @param {object} response GM.xmlHttpRequest response
       * @private
       */
      this._debug = (response) => {
        if (this._config.debug || response.status !== 200) console.log(`${response.status}: ${response.finalUrl}`)
      }

      /**
       *
       * @private
       * @param {string} source ID source
       * @returns {string} Wikidata code
       */
      this._source = (source) => {
        switch (source) {
          case 'IMDb':
            return 'P345'
          case 'TMDb_movie':
            return 'P4947'
          case 'TMDb_tv':
            return 'P4983'
          case 'TVDB':
            return 'P4835'
          case 'Trakt':
            return 'P8013'
          case 'Rotten Tomatoes':
            return 'P1258'
          case 'Metacritic':
            return 'P1712'
          case 'MyAnimeList':
            return 'P4086'
          case 'AniDB':
            return 'P5646'
          case 'AniList':
            return 'P8729'
          default:
            throw new Error('An ID source is required')
        }
      }

      /**
       *
       * @private
       * @param {string} type ID type
       * @returns {string} Wikidata code
       */
      this._type = (type) => {
        switch (type) {
          case 'movie':
            return 'Q11424'
          case 'tv':
            return 'Q5398426'
          default:
            throw new Error('An ID type is required')
        }
      }
    }

    /**
     *
     * @param {string} id ID
     * @param {string} source ID source
     * @param {string} type ID type
     * @returns {object} IDs
     */
    ids (id, source, type) {
      if (!id) throw new Error('An ID is required')

      source = this._source(source)
      type = this._type(type)

      const query = `
      SELECT DISTINCT ?item ?itemLabel ?IMDb_ID ?TMDb_ID ?TVDb_ID ?Trakt_ID ?RottenTomatoes_ID ?Metacritic_ID ?MyAnimeList_ID ?AniDB_ID ?AniList_ID WHERE {
        ?item p:${source} ?statement0.
        ?statement0 ps:${source} "${id}".
        ?item p:P31 ?statement1.
        ?statement1 (ps:P31/(wdt:P279*)) wd:${type}.
        MINUS {
          ?item p:P31 ?statement2.
          ?statement2 (ps:P31/(wdt:P279*)) wd:Q3464665.
        }
        MINUS {
          ?item p:P31 ?statement3.
          ?statement3 (ps:P31/(wdt:P279*)) wd:Q21191270.
        }
        OPTIONAL { ?item wdt:P345 ?IMDb_ID. }
        OPTIONAL { ?item wdt:P4947 ?TMDb_ID. }
        OPTIONAL { ?item wdt:P4983 ?TMDb_ID. }
        OPTIONAL { ?item wdt:P4835 ?TVDb_ID. }
        OPTIONAL { ?item wdt:P8013 ?Trakt_ID. }
        OPTIONAL { ?item wdt:P1258 ?RottenTomatoes_ID. }
        OPTIONAL { ?item wdt:P1712 ?Metacritic_ID. }
        OPTIONAL { ?item wdt:P4086 ?MyAnimeList_ID. }
        OPTIONAL { ?item wdt:P5646 ?AniDB_ID. }
        OPTIONAL { ?item wdt:P8729 ?AniList_ID. }
        SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
      }
      LIMIT 100
      `

      return new Promise((resolve, reject) => {
        GM.xmlHttpRequest({
          method: 'GET',
          url: `${this._config.endpoint}/sparql?query=${encodeURIComponent(query)}`,
          headers: this._headers,
          // eslint-disable-next-line unicorn/numeric-separators-style
          timeout: 15000,
          onload: (response) => {
            this._debug(response)
            const json = JSON.parse(response.responseText)
            const results = json.results.bindings

            if (results.length > 0) {
              resolve(results.map((result) => {
                return {
                  title: result.itemLabel ? result.itemLabel.value : undefined,
                  ids: {
                    IMDb: result.IMDb_ID ? result.IMDb_ID.value : undefined,
                    TMDb: result.TMDb_ID ? result.TMDb_ID.value : undefined,
                    TVDB: result.TVDb_ID ? result.TVDb_ID.value : undefined,
                    Trakt: result.Trakt_ID ? result.Trakt_ID.value : undefined,
                    'Rotten Tomatoes': result.RottenTomatoes_ID ? result.RottenTomatoes_ID.value : undefined,
                    Metacritic: result.Metacritic_ID ? result.Metacritic_ID.value : undefined,
                    MyAnimeList: result.MyAnimeList_ID ? result.MyAnimeList_ID.value : undefined,
                    AniDB: result.AniDB_ID ? result.AniDB_ID.value : undefined,
                    AniList: result.AniList_ID ? result.AniList_ID.value : undefined
                  },
                  item: result.item.value
                }
              }))
            } else {
              reject(new Error('No results'))
            }
          },
          onerror: (response) => {
            reject(new Error('An error occurs while processing the request'))
          },
          ontimeout: (response) => {
            reject(new Error('Request times out'))
          }
        })
      })
    }
  }
})()
