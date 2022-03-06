// ==UserScript==
// @author       Davide <iFelix18@protonmail.com>
// @namespace    https://github.com/iFelix18
// @exclude      *
// ==UserLibrary==
// @name         @ifelix18/wikidata
// @description  Wikidata for my userscripts
// @copyright    2022, Davide (https://github.com/iFelix18)
// @license      MIT
// @version      2.1.1
// @homepage     https://github.com/iFelix18/Userscripts/tree/master/packages/wikidata#readme
// @homepageURL  https://github.com/iFelix18/Userscripts/tree/master/packages/wikidata#readme
// @supportURL   https://github.com/iFelix18/Userscripts/issues
// ==/UserLibrary==
// @connect      query.wikidata.org
// @grant        GM.xmlHttpRequest
// ==/UserScript==

/**
 * Wikidata
 *
 * @see https://www.wikidata.org/wiki/Special:MyLanguage/Wikidata:SPARQL_query_service/Wikidata_Query_Help
 * @class
 */
export default class Wikidata {
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
     * Returns Wikidata property code
     *
     * @private
     * @param {string} source Source ID name
     * @returns {string} Wikidata property code
     */
    this._property = (source) => {
      switch (source) {
        case 'IMDb':
          return 'P345'
        case 'TMDb_movie':
          return 'P4947'
        case 'TMDb_tv':
          return 'P4983'
        case 'TVDb':
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
        case 'MYmovies':
          return 'P4780'
        case 'Movieplayer_movie':
          return 'P4783'
        case 'Movieplayer_tv':
          return 'P4784'
        case 'Il mondo dei doppiatori':
          return 'P5099'
        default:
          throw new Error('An ID source is required')
      }
    }

    /**
     * Returns Wikidata item type code
     *
     * @private
     * @param {string} type ID type
     * @returns {string} Wikidata item type code
     */
    this._item = (type) => {
      switch (type) {
        case 'movie':
          return 'Q11424'
        case 'tv':
          return 'Q5398426'
        default:
          throw new Error('An ID type is required')
      }
    }

    /**
     * Returns link
     *
     * @param {string} site Item site
     * @param {string} id Item ID
     * @returns {object} Link
     */
    this._link = (site, id) => {
      switch (site) {
        case 'IMDb':
          return { value: `https://www.imdb.com/title/${id}`, country: 'worldwide' }
        case 'TMDb_movie':
          return { value: `https://www.themoviedb.org/movie/${id}`, country: 'worldwide' }
        case 'TMDb_tv':
          return { value: `https://www.themoviedb.org/tv/${id}`, country: 'worldwide' }
        case 'TVDb':
          return { value: `https://www.thetvdb.com/?tab=series&id=${id}`, country: 'worldwide' }
        case 'Trakt':
          return { value: `https://trakt.tv/${id}`, country: 'worldwide' }
        case 'Rotten Tomatoes':
          return { value: `https://www.rottentomatoes.com/${id}`, country: 'worldwide' }
        case 'Metacritic':
          return { value: `https://www.metacritic.com/${id}`, country: 'worldwide' }
        case 'MyAnimeList':
          return { value: `https://myanimelist.net/anime/${id}`, country: 'worldwide' }
        case 'AniDB':
          return { value: `https://anidb.net/anime/${id}`, country: 'worldwide' }
        case 'AniList':
          return { value: `https://anilist.co/anime/${id}`, country: 'worldwide' }
        case 'MYmovies':
          return { value: `https://www.mymovies.it/dizionario/recensione.asp?id=${id}`, country: 'italy' }
        case 'Movieplayer_movie':
          return { value: `https://movieplayer.it/film/wd_${id}/`, country: 'italy' }
        case 'Movieplayer_tv':
          return { value: `https://movieplayer.it/serietv/wd_${id}/`, country: 'italy' }
        case 'Il mondo dei doppiatori':
          return { value: `https://www.antoniogenna.net/doppiaggio/${id}.htm`, country: 'italy' }
        default:
          break
      }
    }
  }

  /**
   * Returns all links
   *
   * @param {string} id ID
   * @param {string} source ID source name
   * @param {string} type ID type
   * @returns {object} Links
   */
  links (id, source, type) {
    if (!id) throw new Error('An ID is required')

    const property = this._property(source)
    const item = this._item(type)

    const query = `
      SELECT DISTINCT ?item ?itemLabel ?IMDb ?TMDb_movie ?TMDb_tv ?TVDb ?Trakt ?RottenTomatoes ?Metacritic ?MyAnimeList ?AniDB ?AniList ?MYmovies ?Movieplayer_movie ?Movieplayer_tv ?MondoDoppiatori WHERE {
        ?item p:${property} ?statement0.
        ?statement0 ps:${property} "${id}".
        ?item p:P31 ?statement1.
        ?statement1 (ps:P31/(wdt:P279*)) wd:${item}.
        MINUS {
          ?item p:P31 ?statement2.
          ?statement2 (ps:P31/(wdt:P279*)) wd:Q3464665.
        }
        MINUS {
          ?item p:P31 ?statement3.
          ?statement3 (ps:P31/(wdt:P279*)) wd:Q21191270.
        }
        OPTIONAL { ?item wdt:P345 ?IMDb. }
        OPTIONAL { ?item wdt:P4947 ?TMDb_movie. }
        OPTIONAL { ?item wdt:P4983 ?TMDb_tv. }
        OPTIONAL { ?item wdt:P4835 ?TVDb. }
        OPTIONAL { ?item wdt:P8013 ?Trakt. }
        OPTIONAL { ?item wdt:P1258 ?RottenTomatoes. }
        OPTIONAL { ?item wdt:P1712 ?Metacritic. }
        OPTIONAL { ?item wdt:P4086 ?MyAnimeList. }
        OPTIONAL { ?item wdt:P5646 ?AniDB. }
        OPTIONAL { ?item wdt:P8729 ?AniList. }
        OPTIONAL { ?item wdt:P4780 ?MYmovies. }
        OPTIONAL { ?item wdt:P4783 ?Movieplayer_movie. }
        OPTIONAL { ?item wdt:P4784 ?Movieplayer_tv. }
        OPTIONAL { ?item wdt:P5099 ?MondoDoppiatori. }
        SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
      }
      LIMIT 100
      `

    return new Promise((resolve, reject) => {
      GM.xmlHttpRequest({
        method: 'GET',
        url: `${this._config.endpoint}/sparql?query=${encodeURIComponent(query)}`,
        headers: this._headers,
        timeout: 15_000,
        onload: (response) => {
          this._debug(response)
          const json = JSON.parse(response.responseText)
          const results = json.results.bindings
          const result = results.map((result) => result).find((result) => result[source].value === id)

          if (result && Object.keys(result).length > 0 && Object.getPrototypeOf(result) === Object.prototype) {
            resolve({
              title: result.itemLabel ? result.itemLabel.value : undefined,
              links: {
                IMDb: result.IMDb ? this._link('IMDb', result.IMDb.value) : undefined,
                TMDb: (result.TMDb_movie || result.TMDb_tv) ? (result.TMDb_movie ? this._link('TMDb_movie', result.TMDb_movie.value) : this._link('TMDb_tv', result.TMDb_tv.value)) : undefined,
                TVDb: result.TVDb ? this._link('TVDb', result.TVDb.value) : undefined,
                Trakt: result.Trakt ? this._link('Trakt', result.Trakt.value) : undefined,
                'Rotten Tomatoes': result.RottenTomatoes ? this._link('Rotten Tomatoes', result.RottenTomatoes.value) : undefined,
                Metacritic: result.Metacritic ? this._link('Metacritic', result.Metacritic.value) : undefined,
                MyAnimeList: result.MyAnimeList ? this._link('MyAnimeList', result.MyAnimeList.value) : undefined,
                AniDB: result.AniDB ? this._link('AniDB', result.AniDB.value) : undefined,
                AniList: result.AniList ? this._link('AniList', result.AniList.value) : undefined,
                MYmovies: result.MYmovies ? this._link('MYmovies', result.MYmovies.value) : undefined,
                Movieplayer: (result.Movieplayer_movie || result.Movieplayer_tv) ? (result.Movieplayer_movie ? this._link('Movieplayer_movie', result.Movieplayer_movie.value) : this._link('Movieplayer_tv', result.Movieplayer_tv.value)) : undefined,
                'Il mondo dei doppiatori': result.MondoDoppiatori ? this._link('Il mondo dei doppiatori', result.MondoDoppiatori.value) : undefined
              },
              item: result.item.value
            })
          } else {
            reject(new Error('No results'))
          }
        },
        onerror: () => {
          reject(new Error('An error occurs while processing the request'))
        },
        ontimeout: () => {
          reject(new Error('Request times out'))
        }
      })
    })
  }
}
