// ==UserScript==
// @author       Davide <iFelix18@protonmail.com>
// @namespace    https://github.com/iFelix18
// @exclude      *
// ==UserLibrary==
// @name         @ifelix18/omdb
// @description  OMDb API for my userscripts
// @copyright    2019, Davide (https://github.com/iFelix18)
// @license      MIT
// @version      2.0.0
// @homepage     https://github.com/iFelix18/Userscripts/tree/master/packages/omdb#readme
// @homepageURL  https://github.com/iFelix18/Userscripts/tree/master/packages/omdb#readme
// @supportURL   https://github.com/iFelix18/Userscripts/issues
// ==/UserLibrary==
// @connect      omdbapi.com
// @grant        GM.xmlHttpRequest
// ==/UserScript==

/**
 * API methods
 */
const methods = {
  '/id': {
    method: 'GET',
    url: '/?i={id}&type={type}&y={year}&plot={plot}&tomatoes={tomatoes}'
  },
  '/search': {
    method: 'GET',
    url: '/?s={search}&type={type}&y={year}&page={page}'
  },
  '/title': {
    method: 'GET',
    url: '/?t={title}&type={type}&y={year}&plot={plot}&tomatoes={tomatoes}'
  }
}

/**
 * OMDb API
 *
 * @see https://www.omdbapi.com/
 * @class
 */
export default class OMDb { // eslint-disable-line unicorn/prevent-abbreviations
  /**
   * API configuration
   *
   * @param {object} config Configuration
   * @param {string} config.api_key OMDb API Key
   * @param {string} [config.api_url='https://www.omdbapi.com'] OMDb API URL
   * @param {boolean} [config.debug=false] Debug
   */
  constructor (config = {}) {
    if (!config.api_key) throw new Error('OMDb API Key is required')

    /**
     * @private
     */
    this._config = {
      api_key: config.api_key,
      api_url: config.api_url || 'https://www.omdbapi.com',
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
    if (!parameters) throw new Error('Parameters is required')

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
          if (data.Response === 'True' && response.readyState === 4 && response.status === 200) {
            resolve(data)
          } else {
            if (data.Error) {
              reject(new Error(data.Error))
            } else {
              reject(new Error('No results'))
            }
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
        const regex = new RegExp(Object.keys(parameters).map(key => `{${key}}`).join('|'), 'gi')

        if (regex.test(query)) {
          queryString.push(query.replace(regex, (matched) => parameters[matched.replace(/[{}]/g, '')]))
        }
      }
    }
    queryString.push(`apikey=${this._config.api_key}`, 'r=json') // api key and return json

    // return final URL
    return `${url}${pathParameters.join('')}?${queryString.join('&')}`
  }
}
