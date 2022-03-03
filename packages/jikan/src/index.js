// ==UserScript==
// @author       Davide <iFelix18@protonmail.com>
// @namespace    https://github.com/iFelix18
// @exclude      *
// ==UserLibrary==
// @name         Jikan API
// @description  Jikan API for my userscripts
// @copyright    2022, Davide (https://github.com/iFelix18)
// @license      MIT
// @version      1.1.0
// @homepage     https://github.com/iFelix18/Userscripts/tree/master/packages/jikan#readme
// @homepageURL  https://github.com/iFelix18/Userscripts/tree/master/packages/jikan#readme
// @supportURL   https://github.com/iFelix18/Userscripts/issues
// ==/UserLibrary==
// @connect      api.jikan.moe
// @grant        GM.xmlHttpRequest
// ==/UserScript==

/**
 * Jikan API
 *
 * @see https://jikan.moe/
 * @class
 */
export default class Jikan {
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
    if (!research.query) throw new Error('A search query is required.')

    const search = {
      query: research.query,
      type: research.type === 'series' ? 'tv' : research.type || undefined,
      limit: research.limit || 25,
      page: research.page || 1
    }

    return new Promise((resolve, reject) => {
      GM.xmlHttpRequest({
        method: 'GET',
        url: `${this._config.url}/v4/anime?q=${encodeURIComponent(search.query)}&type=${search.type}&order_by=popularity&sfw=true&limit=${search.limit}&page=${search.page}`,
        headers: this._headers,
        timeout: 15_000,
        onload: (response) => {
          this._debug(response)
          const data = JSON.parse(response.responseText).data
          if (data.length > 0 && response.readyState === 4 && response.responseText !== '[]') {
            resolve(data)
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
