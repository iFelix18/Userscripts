// ==UserScript==
// @author       Davide <iFelix18@protonmail.com>
// @namespace    https://github.com/iFelix18
// @exclude      *
// ==UserLibrary==
// @name         @ifelix18/rottentomatoes
// @description  Rotten Tomatoes API for my userscripts
// @copyright    2022, Davide (https://github.com/iFelix18)
// @license      MIT
// @version      2.0.0
// @homepage     https://github.com/iFelix18/Userscripts/tree/master/packages/rottentomatoes#readme
// @homepageURL  https://github.com/iFelix18/Userscripts/tree/master/packages/rottentomatoes#readme
// @supportURL   https://github.com/iFelix18/Userscripts/issues
// ==/UserLibrary==
// @connect      rottentomatoes.com
// @grant        GM.xmlHttpRequest
// ==/UserScript==

/**
 * API methods
 */
const methods = {
  '/movie/search': {
    method: 'GET',
    url: '/search/?q={query}&t=movie'
  },
  '/tv/search': {
    method: 'GET',
    url: '/search/?q={query}&t=tvseries'
  }
}

/**
 * Rotten Tomatoes API
 *
 * @see https://www.rottentomatoes.com/
 * @class
 */
export default class RottenTomatoes {
  /**
   * API configuration
   *
   * @param {object} config Configuration
   * @param {string} [config.api_url='https://www.rottentomatoes.com/api/private/v2.0'] Rotten Tomatoes API URL
   * @param {number} [config.limit=25] Limit
   * @param {boolean} [config.debug=false] Debug
   */
  constructor (config = {}) {
    /**
     * @private
     */
    this._config = {
      api_url: config.api_url || 'https://www.rottentomatoes.com/api/private/v2.0',
      limit: config.limit || 25,
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

    this._this = this
    this._methods()
  }

  /**
   * Creates the various methods
   *
   * @private
   */
  _methods () {
    for (const method in methods) {
      const parts = method.split('/')
      const function_ = parts.pop()
      parts.shift()

      let temporary = this._this
      for (const part of parts) {
        temporary = temporary[part] || (temporary[part] = {})
      }

      temporary[function_] = this._request.bind(this, methods[method])
    }
  }

  /**
   * Makes a request with GM.xmlHttpRequest
   *
   * @private
   * @param {object} method API method
   * @param {object} parameters Function parameters
   * @returns {object} Response
   */
  _request (method, parameters) {
    if (!parameters.query) throw new Error('A search query is required')

    return new Promise((resolve, reject) => {
      const finalURL = this._resolve(method, parameters)

      GM.xmlHttpRequest({
        method: method.method,
        url: finalURL,
        headers: this._headers,
        timeout: 15_000,
        onload: (response) => {
          this._debug(response)
          const data = JSON.parse(response.responseText)
          if (response.readyState === 4 && response.status === 200) {
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

  /**
   * Resolve url
   *
   * @private
   * @param {object} method API method
   * @param {object} parameters Function parameters
   * @returns {string} Final URL
   */
  _resolve (method, parameters) {
    const url = this._config.api_url
    const path = method.url.split('?')
    const pathParameters = []
    const queryString = []

    // Path Params
    if (path[0]) {
      pathParameters.push(path[0])
    }

    // Query String
    if (path[1]) {
      for (const query of path[1].split('&')) {
        if (parameters) {
          const regex = new RegExp(Object.keys(parameters).map(key => `{${key}}`).join('|'), 'gi')
          queryString.push(query.replace(regex, (matched) => parameters[matched.replace(/[{}]/g, '')]))
        } else {
          queryString.push(query)
        }
      }
    }
    if (this._config.limit) { // limit
      queryString.push(`limit=${this._config.limit}`)
    }

    // return final URL
    return `${url}${pathParameters.join('')}?${queryString.join('&')}`
  }
}
