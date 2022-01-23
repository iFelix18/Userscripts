// ==UserScript==
// @author          Davide <iFelix18@protonmail.com>
// @namespace       https://github.com/iFelix18
// @exclude         *
// ==UserLibrary==
// @name            Rotten Tomatoes API
// @description     Rotten Tomatoes API for my userscripts
// @copyright       2022, Davide (https://github.com/iFelix18)
// @license         MIT
// @version         1.0.0
// @homepageURL     https://github.com/iFelix18/Userscripts
// @supportURL      https://github.com/iFelix18/Userscripts/issues
// ==/UserLibrary==
// @include         *
// @connect         rottentomatoes.com
// @grant           GM.xmlHttpRequest
// ==/UserScript==

(() => {
  /**
   * Rotten Tomatoes API
   * https://www.rottentomatoes.com/
   * @class
   */
  this.RottenTomatoes = class {
    /**
     * API configuration
     * @param {Object} config
     * @param {string} [config.url='https://www.rottentomatoes.com']  Rotten Tomatoes API URL
     * @param {boolean} [config.debug=false]                          Debug
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
       * @private
       */
      this._debug = (response) => {
        if (this._config.debug || response.status !== 200) console.log(`${response.status}: ${response.finalUrl}`)
      }
    }

    /**
     * Returns the results of a search
     * @param {Object} research
     * @param {string} [research.search=''] Item title to search for
     * @param {string} [research.type=null] Type of result to return (movie, tvseries, franchise)
     * @param {string} [research.limit=null] Type of result to return (movie, tvseries, franchise)
     * @returns {Object}
     */
    search (research = {}) {
      const query = {
        search: research.search || '',
        type: research.type || undefined,
        limit: research.limit || 25
      }

      return new Promise((resolve, reject) => {
        GM.xmlHttpRequest({
          method: 'GET',
          url: `${this._config.url}/api/private/v2.0/search/?q=${encodeURIComponent(query.search)}&t=${query.type}&limit=${query.limit}`,
          headers: this._headers,
          onload: (response) => {
            this._debug(response)
            const data = JSON.parse(response.responseText)
            if (response.readyState === 4 && response.responseText !== '[]') {
              resolve(data)
            } else {
              query.search === ''
                ? reject(new Error('A search query is required.'))
                : reject(new Error(response))
            }
          }
        })
      })
    }
  }
})()
