// ==UserScript==
// @author       Davide <iFelix18@protonmail.com>
// @namespace    https://github.com/iFelix18
// @exclude      *
// ==UserLibrary==
// @name         @ifelix18/rottentomatoes
// @description  Rotten Tomatoes API for my userscripts
// @copyright    2022, Davide (https://github.com/iFelix18)
// @license      MIT
// @version      1.2.0
// @homepage     https://github.com/iFelix18/Userscripts/tree/master/packages/rottentomatoes#readme
// @homepageURL  https://github.com/iFelix18/Userscripts/tree/master/packages/rottentomatoes#readme
// @supportURL   https://github.com/iFelix18/Userscripts/issues
// ==/UserLibrary==
// @connect      rottentomatoes.com
// @grant        GM.xmlHttpRequest
// ==/UserScript==

this.RottenTomatoes = (function () {
  /**
   * Rotten Tomatoes API
   *
   * @see https://www.rottentomatoes.com/
   * @class
   */
  class RottenTomatoes {
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
     * @param {string} research.query Item title to search for
     * @param {string} [research.type=''] Type of result to return (movie or series)
     * @param {string} [research.limit=25] Limit
     * @returns {object} Search results
     */
    search (research = {}) {
      if (!research.query) throw new Error('A search query is required.')

      const search = {
        query: research.query,
        type: ['movie', 'series'].includes(research.type) ? (research.type === 'series' ? 'tvseries' : research.type) : '',
        limit: research.limit || 25
      }

      return new Promise((resolve, reject) => {
        GM.xmlHttpRequest({
          method: 'GET',
          url: `${this._config.url}/api/private/v2.0/search/?q=${encodeURIComponent(search.query)}&t=${search.type}&limit=${search.limit}`,
          headers: this._headers,
          timeout: 15_000,
          onload: (response) => {
            this._debug(response)
            const data = JSON.parse(response.responseText)
            if (Object.keys(data).length > 0 && (data.movieCount > 0 || data.tvCount > 0) && response.readyState === 4 && response.responseText !== '[]') {
              if (data.movieCount > 0 && data.tvCount > 0) {
                resolve([...data.movies, ...data.tvSeries])
              } else if (data.movieCount > 0) {
                resolve(data.movies)
              } else if (data.tvCount > 0) {
                resolve(data.tvSeries)
              }
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

  return RottenTomatoes
})()
