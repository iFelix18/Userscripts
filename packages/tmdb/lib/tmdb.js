// ==UserScript==
// @author       Davide <iFelix18@protonmail.com>
// @namespace    https://github.com/iFelix18
// @exclude      *
// ==UserLibrary==
// @name         TMDb API
// @description  TMDb API for my userscripts
// @copyright    2020, Davide (https://github.com/iFelix18)
// @license      MIT
// @version      1.5.8
// @homepage     https://github.com/iFelix18/Userscripts
// @homepageURL  https://github.com/iFelix18/Userscripts
// @supportURL   https://github.com/iFelix18/Userscripts/issues
// ==/UserLibrary==
// @connect      api.themoviedb.org
// @grant        GM.xmlHttpRequest
// ==/UserScript==

(() => {
  /**
   * TMDb API
   *
   * @see https://developers.themoviedb.org/3/
   * @class
   */
  this.TMDb = class {
    /**
     * API configuration
     *
     * @param {object} config Configuration
     * @param {string} config.apikey TMDb API Key
     * @param {string} [config.language='en'] TMDb API language
     * @param {string} [config.url='https://api.themoviedb.org/3'] TMDb API URL
     * @param {boolean} [config.debug=false] Debug
     */
    constructor (config = {}) {
      if (!config.apikey) throw new Error('TMDb API Key is required')

      /**
       * @private
       */
      this._config = {
        apikey: config.apikey,
        language: config.language || 'en',
        url: config.url || 'https://api.themoviedb.org/3',
        debug: config.debug || false
      }

      /**
       * @private
       */
      this._headers = {
        'User-Agent': 'Mozilla/5.0',
        'Content-Type': 'application/json;charset=utf-8'
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
     * Returns the primary details about a TV episode
     *
     * @param {number} id TV show TMDb ID
     * @param {number} season TV show season number
     * @param {number} episode TV show episode number
     * @returns {object} TV episode details
     */
    episodeDetails (id, season, episode) {
      return new Promise((resolve, reject) => {
        GM.xmlHttpRequest({
          method: 'GET',
          url: `${this._config.url}/tv/${id}/season/${season}/episode/${episode}?api_key=${this._config.apikey}&language=${this._config.language}`,
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
     * Returns external IDs
     *
     * @param {string} type Type. For example: movie
     * @param {number} id TMDb ID
     * @returns {object} External IDs
     */
    externalIDs (type, id) {
      return new Promise((resolve, reject) => {
        GM.xmlHttpRequest({
          method: 'GET',
          url: `${this._config.url}/${type}/${id}/external_ids?api_key=${this._config.apikey}`,
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
     * Returns images
     *
     * @param {string} type Image type. For example: movie
     * @param {number} id TMDb ID
     * @returns {object} Images
     */
    images (type, id) {
      return new Promise((resolve, reject) => {
        GM.xmlHttpRequest({
          method: 'GET',
          url: `${this._config.url}/${type}/${id}/images?api_key=${this._config.apikey}&language=${this._config.language}`,
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
     * Returns the primary details about a movie
     *
     * @param {number} id Movie TMDb ID
     * @returns {object} Movie details
     */
    moviesDetails (id) {
      return new Promise((resolve, reject) => {
        GM.xmlHttpRequest({
          method: 'GET',
          url: `${this._config.url}/movie/${id}?api_key=${this._config.apikey}&language=${this._config.language}`,
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
     * Returns the primary details about a TV season
     *
     * @param {number} id TV show TMDb ID
     * @param {number} season TV show season number
     * @returns {object} TV season details
     */
    seasonDetails (id, season) {
      return new Promise((resolve, reject) => {
        GM.xmlHttpRequest({
          method: 'GET',
          url: `${this._config.url}/tv/${id}/season/${season}?api_key=${this._config.apikey}&language=${this._config.language}`,
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
     * Returns the primary details about a TV show
     *
     * @param {number} id TV show TMDb ID
     * @returns {object} TV show details
     */
    tvDetails (id) {
      return new Promise((resolve, reject) => {
        GM.xmlHttpRequest({
          method: 'GET',
          url: `${this._config.url}/tv/${id}?api_key=${this._config.apikey}&language=${this._config.language}`,
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
