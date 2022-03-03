// ==UserScript==
// @author       Davide <iFelix18@protonmail.com>
// @namespace    https://github.com/iFelix18
// @exclude      *
// ==UserLibrary==
// @name         @ifelix18/omdb
// @description  OMDb API for my userscripts
// @copyright    2019, Davide (https://github.com/iFelix18)
// @license      MIT
// @version      1.3.0
// @homepage     https://github.com/iFelix18/Userscripts/tree/master/packages/omdb#readme
// @homepageURL  https://github.com/iFelix18/Userscripts/tree/master/packages/omdb#readme
// @supportURL   https://github.com/iFelix18/Userscripts/issues
// ==/UserLibrary==
// @connect      omdbapi.com
// @grant        GM.xmlHttpRequest
// ==/UserScript==

this.OMDb = (function () {
  /**
   * OMDb API
   *
   * @see https://www.omdbapi.com/
   * @class
   */
  class OMDb { // eslint-disable-line unicorn/prevent-abbreviations
    /**
     * API configuration
     *
     * @param {object} config Configuration
     * @param {string} config.apikey OMDb API Key
     * @param {string} [config.url='https://www.omdbapi.com'] OMDb API URL
     * @param {boolean} [config.debug=false] Debug
     */
    constructor (config = {}) {
      if (!config.apikey) throw new Error('OMDb API Key is required')

      /**
       * @private
       */
      this._config = {
        apikey: config.apikey,
        url: config.url || 'https://www.omdbapi.com',
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
     * Returns the results of a search by id or title
     *
     * @param {object} research Research object
     * @param {string} research.id A valid IMDb ID (e.g. tt1285016)
     * @param {string} research.title Movie title to search for
     * @param {string} [research.type=''] Type of result to return (movie, series, episode)
     * @param {number} [research.year=''] Year of release
     * @param {string} [research.plot='short'] Return short or full plot (short, full)
     * @returns {object} Search results
     */
    get (research = {}) {
      if (!research.id && !research.title) throw new Error('A search query, IMDb ID or title, is required.')

      const query = {
        id: research.id || '',
        title: research.title || '',
        type: ['movie', 'series', 'episode'].includes(research.type) ? research.type : '',
        year: research.year || '',
        plot: ['short', 'full'].includes(research.plot) ? research.plot : 'short'
      }

      return new Promise((resolve, reject) => {
        const url = query.id
          ? `${this._config.url}/?apikey=${this._config.apikey}&i=${encodeURIComponent(query.id)}&type=${query.type}&y=${query.year}&plot=${query.plot}&r=json&tomatoes=true`
          : `${this._config.url}/?apikey=${this._config.apikey}&t=${encodeURIComponent(query.title)}&type=${query.type}&y=${query.year}&plot=${query.plot}&r=json&tomatoes=true`

        GM.xmlHttpRequest({
          method: 'GET',
          url,
          headers: this._headers,
          timeout: 15_000,
          onload: (response) => {
            this._debug(response)
            const data = JSON.parse(response.responseText)
            if (Object.keys(data).length > 0 && response.readyState === 4 && response.responseText !== '[]' && data.Response !== 'False') {
              resolve(data)
            } else {
              data.Response === 'False' ? reject(new Error(data.Error)) : reject(new Error('No results'))
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

    /**
     * Returns the results of a search
     *
     * @param {object} research Research object
     * @param {string} research.search Movie title to search for
     * @param {string} [research.type=''] Type of result to return (movie, series, episode)
     * @param {number} [research.year=''] Year of release
     * @param {number} [research.page=1] Page number to return (1-100)
     * @returns {object} Search results
     */
    search (research = {}) {
      if (!research.search) throw new Error('A search query is required.')

      const query = {
        search: research.search || '',
        type: ['movie', 'series', 'episode'].includes(research.type) ? research.type : '',
        year: research.year || '',
        page: research.page >= 1 && research.page <= 100 ? research.page : 1
      }

      return new Promise((resolve, reject) => {
        GM.xmlHttpRequest({
          method: 'GET',
          url: `${this._config.url}/?apikey=${this._config.apikey}&s=${encodeURIComponent(query.search)}&type=${query.type}&y=${query.year}&r=json&page=${query.page}`,
          headers: this._headers,
          timeout: 15_000,
          onload: (response) => {
            this._debug(response)
            const data = JSON.parse(response.responseText)
            if (Object.keys(data).length > 0 && response.readyState === 4 && response.responseText !== '[]' && data.Response !== 'False') {
              resolve(data.Search)
            } else {
              data.Response === 'False' ? reject(new Error(data.Error)) : reject(new Error('No results'))
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

  return OMDb
})()
