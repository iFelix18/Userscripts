// ==UserScript==
// @author       Davide <iFelix18@protonmail.com>
// @namespace    https://github.com/iFelix18
// @exclude      *
// ==UserLibrary==
// @name         Trakt API
// @description  Trakt API for my userscripts
// @copyright    2020, Davide (https://github.com/iFelix18)
// @license      MIT
// @version      1.5.5
// @homepage     https://github.com/iFelix18/Userscripts
// @homepageURL  https://github.com/iFelix18/Userscripts
// @supportURL   https://github.com/iFelix18/Userscripts/issues
// ==/UserLibrary==
// @connect      api.trakt.tv
// @grant        GM.xmlHttpRequest
// ==/UserScript==

(() => {
  /**
   * Trakt.tv API
   *
   * @see https://trakt.docs.apiary.io/
   * @class
   */
  this.Trakt = class {
    /**
     * API configuration
     *
     * @param {object} config Configuration
     * @param {string} config.clientID Trakt Client ID
     * @param {string} [config.url='https://api.trakt.tv'] Trakt API URL
     * @param {boolean} [config.debug=false] Debug
     */
    constructor (config = {}) {
      if (!config.clientID) throw new Error('Trakt Client ID is required')

      /**
       * @private
       */
      this._config = {
        clientID: config.clientID,
        url: config.url || 'https://api.trakt.tv',
        debug: config.debug || false
      }

      /**
       * @private
       */
      this._headers = {
        'User-Agent': 'Mozilla/5.0',
        'Content-Type': 'application/json;charset=utf-8',
        'trakt-api-key': this._config.clientID,
        'trakt-api-version': 2
      }

      /**
       * @param {object} response GM.xmlHttpRequest response
       * @private
       */
      this._debug = (response) => {
        if (this._config.debug || response.status !== 200) console.log(`${response.status}: ${response.finalUrl}`)
      }
    }

    /**
     * Returns a single episode's details
     *
     * @see https://trakt.docs.apiary.io/#reference/episodes/summary/get-a-single-episode-for-a-show
     * @param {string|number} id Trakt ID, Trakt slug, or IMDB ID Example: game-of-thrones
     * @param {number} season Season number Example: 1
     * @param {number} episode Episode number Example: 12
     * @returns {object} Episode details
     */
    episodeSummary (id, season, episode) {
      return new Promise((resolve, reject) => {
        GM.xmlHttpRequest({
          method: 'GET',
          url: `${this._config.url}/shows/${encodeURIComponent(id)}/seasons/${encodeURIComponent(season)}/episodes/${encodeURIComponent(episode)}?extended=full`,
          headers: this._headers,
          onload: (response) => {
            this._debug(response)
            if (response.readyState === 4) {
              resolve(JSON.parse(response.responseText))
            } else {
              reject(response)
            }
          }
        })
      })
    }

    /**
     * Search all text fields that a media object contain
     *
     * @see https://trakt.docs.apiary.io/#reference/search/get-text-query-results
     * @param {string} type Search type. Example: movie
     * @param {string} query Search all text based fields. Example: tron
     * @param {string} fields Text fields
     * @returns {object} Search results
     */
    search (type, query, fields) {
      return new Promise((resolve, reject) => {
        GM.xmlHttpRequest({
          method: 'GET',
          url: `${this._config.url}/search/${encodeURIComponent(type)}?query=${encodeURIComponent(query)}&fields=${encodeURIComponent(fields)}`,
          headers: this._headers,
          onload: (response) => {
            this._debug(response)
            if (response.readyState === 4) {
              resolve(JSON.parse(response.responseText))
            } else {
              reject(response)
            }
          }
        })
      })
    }

    /**
     * Lookup items by their Trakt, IMDB, TMDB, or TVDB ID
     *
     * @see https://trakt.docs.apiary.io/#reference/search/id-lookup/get-id-lookup-results
     * @param {string} idType Type of ID to lookup. Example: imdb
     * @param {string} id ID that matches with the type. Example: tt0848228
     * @param {string} type Search type. Example: movie
     * @returns {object} Search results
     */
    searchID (idType, id, type) {
      return new Promise((resolve, reject) => {
        GM.xmlHttpRequest({
          method: 'GET',
          url: `${this._config.url}/search/${encodeURIComponent(idType)}/${encodeURIComponent(id)}?type=${encodeURIComponent(type)}`,
          headers: this._headers,
          onload: (response) => {
            this._debug(response)
            if (response.readyState === 4) {
              resolve(JSON.parse(response.responseText))
            } else {
              reject(response)
            }
          }
        })
      })
    }

    /**
     * Returns all episodes for a specific season of a show
     *
     * @see https://trakt.docs.apiary.io/#reference/seasons/season/get-single-season-for-a-show
     * @param {string|number} id Trakt ID, Trakt slug, or IMDB ID Example: game-of-thrones
     * @param {number} season Season number Example: 1
     * @returns {object} Episodes
     */
    seasonsSeason (id, season) {
      return new Promise((resolve, reject) => {
        GM.xmlHttpRequest({
          method: 'GET',
          url: `${this._config.url}/shows/${encodeURIComponent(id)}/seasons/${encodeURIComponent(season)}`,
          headers: this._headers,
          onload: (response) => {
            this._debug(response)
            if (response.readyState === 4) {
              resolve(JSON.parse(response.responseText))
            } else {
              reject(response)
            }
          }
        })
      })
    }

    /**
     * Returns all seasons for a show including the number of episodes in each season
     *
     * @see https://trakt.docs.apiary.io/#reference/seasons/summary/get-all-seasons-for-a-show
     * @param {string|number} id Trakt ID, Trakt slug, or IMDB ID Example: game-of-thrones
     * @returns {object} Seasons
     */
    seasonSummary (id) {
      return new Promise((resolve, reject) => {
        GM.xmlHttpRequest({
          method: 'GET',
          url: `${this._config.url}/shows/${encodeURIComponent(id)}/seasons?extended=full`,
          headers: this._headers,
          onload: (response) => {
            this._debug(response)
            if (response.readyState === 4) {
              resolve(JSON.parse(response.responseText))
            } else {
              reject(response)
            }
          }
        })
      })
    }

    /**
     * Returns a single shows's details
     *
     * @see https://trakt.docs.apiary.io/#reference/shows/summary/get-a-single-show
     * @param {string|number} id Trakt ID, Trakt slug, or IMDB ID Example: game-of-thrones
     * @returns {object} Show details
     */
    showSummary (id) {
      return new Promise((resolve, reject) => {
        GM.xmlHttpRequest({
          method: 'GET',
          url: `${this._config.url}/shows/${encodeURIComponent(id)}?extended=full`,
          headers: this._headers,
          onload: (response) => {
            this._debug(response)
            if (response.readyState === 4) {
              resolve(JSON.parse(response.responseText))
            } else {
              reject(response)
            }
          }
        })
      })
    }
  }
})()
