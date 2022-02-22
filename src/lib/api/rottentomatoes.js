// ==UserScript==
// @author       Davide <iFelix18@protonmail.com>
// @namespace    https://github.com/iFelix18
// @exclude      *
// ==UserLibrary==
// @name         Rotten Tomatoes API
// @description  Rotten Tomatoes API for my userscripts
// @copyright    2022, Davide (https://github.com/iFelix18)
// @license      MIT
// @version      1.1.6
// @homepage     https://github.com/iFelix18/Userscripts
// @homepageURL  https://github.com/iFelix18/Userscripts
// @supportURL   https://github.com/iFelix18/Userscripts/issues
// ==/UserLibrary==
// @connect      rottentomatoes.com
// @grant        GM.xmlHttpRequest
// ==/UserScript==

(() => {
  /**
   * Rotten Tomatoes API
   *
   * @see https://www.rottentomatoes.com/
   * @class
   */
  this.RottenTomatoes = class {
    /**
     * API configuration
     *
     * @param {object} config Configuration
     * @param {string} [config.url='https://www.rottentomatoes.com'] Rotten Tomatoes API URL
     * @param {boolean} [config.debug=false] Debug
     */
    constructor (config = {}) {
      /**
       * @private
       */
      this._config = {
        url: config.url || 'https://www.rottentomatoes.com',
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
     * Returns the results of a search
     *
     * @param {object} research Research object
     * @param {string} [research.query=''] Item title to search for
     * @param {string} [research.type=null] Type of result to return (movie or series)
     * @param {string} [research.limit=null] Limit
     * @returns {object} Search results
     */
    search (research = {}) {
      const search = {
        query: research.query || '',
        type: research.type === 'movie' ? 'movie' : (research.type === 'series' ? 'tvseries' : undefined),
        limit: research.limit || 25
      }

      return new Promise((resolve, reject) => {
        GM.xmlHttpRequest({
          method: 'GET',
          url: `${this._config.url}/api/private/v2.0/search/?q=${encodeURIComponent(search.query)}&t=${search.type}&limit=${search.limit}`,
          headers: this._headers,
          onload: (response) => {
            this._debug(response)
            const data = JSON.parse(response.responseText)
            if (response.readyState === 4 && response.responseText !== '[]') {
              resolve(research.type === 'movie' ? data.movies : (research.type === 'series' ? data.tvSeries : undefined))
            } else {
              search.query === ''
                ? reject(new Error('A search query is required.'))
                : reject(new Error(response))
            }
          }
        })
      })
    }
  }
})()
