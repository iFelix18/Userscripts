// ==UserScript==
// @author          Davide <iFelix18@protonmail.com>
// @namespace       https://github.com/iFelix18
// @exclude         *
// ==UserLibrary==
// @name            Jikan API
// @description     Jikan API for my userscripts
// @copyright       2022, Davide (https://github.com/iFelix18)
// @license         MIT
// @version         1.0.1
// @homepageURL     https://github.com/iFelix18/Userscripts
// @supportURL      https://github.com/iFelix18/Userscripts/issues
// ==/UserLibrary==
// @connect         api.jikan.moe
// @grant           GM.xmlHttpRequest
// ==/UserScript==

(() => {
  /**
   * Jikan API
   *
   * @see https://jikan.moe/
   * @class
   */
  this.Jikan = class {
    /**
     * API configuration
     *
     * @param {object} config Configuration
     * @param {string} [config.url='https://api.jikan.moe'] Jikan API URL
     * @param {boolean} [config.debug=false] Debug
     */
    constructor (config = {}) {
      /**
       * @private
       */
      this._config = {
        url: config.url || 'https://api.jikan.moe',
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
     * @param {string} [research.search=''] Anime title to search for
     * @param {string} [research.type=undefined] Type of result to return
     * @param {number} [research.limit=25] Limit
     * @param {number} [research.page=1] Page number to return
     * @returns {object} Search results
     */
    search (research = {}) {
      const search = {
        query: research.query || '',
        type: research.type === 'series' ? 'tv' : research.type || undefined,
        limit: research.limit || 25,
        page: research.page || 1
      }

      return new Promise((resolve, reject) => {
        GM.xmlHttpRequest({
          method: 'GET',
          url: `${this._config.url}/v4/anime?q=${encodeURIComponent(search.query)}&type=${search.type}&order_by=popularity&sfw=true&limit=${search.limit}&page=${search.page}`,
          headers: this._headers,
          onload: (response) => {
            this._debug(response)
            const data = JSON.parse(response.responseText).data
            if (search.query !== '' && response.readyState === 4 && response.responseText !== '[]') {
              resolve(data)
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
