// ==UserScript==
// @author       Davide <iFelix18@protonmail.com>
// @namespace    https://github.com/iFelix18
// @exclude      *
// ==UserLibrary==
// @name         @ifelix18/trakt
// @description  Trakt API for my userscripts
// @copyright    2020, Davide (https://github.com/iFelix18)
// @license      MIT
// @version      2.1.1
// @homepage     https://github.com/iFelix18/Userscripts/tree/master/packages/trakt#readme
// @homepageURL  https://github.com/iFelix18/Userscripts/tree/master/packages/trakt#readme
// @supportURL   https://github.com/iFelix18/Userscripts/issues
// ==/UserLibrary==
// @connect      api.trakt.tv
// @grant        GM.xmlHttpRequest
// ==/UserScript==

/**
 * API methods
 */
const methods = {
  '/episodes/summary': {
    method: 'GET',
    url: '/shows/{id}/seasons/{season}/episodes/{episode}?extended'
  },
  '/episodes/translations': {
    method: 'GET',
    url: '/shows/{id}/seasons/{season}/episodes/{episode}/translations/{language}'
  },
  '/movies/summary': {
    method: 'GET',
    url: '/movies/{id}?extended'
  },
  '/movies/translations': {
    method: 'GET',
    url: '/movies/{id}/translations/{language}'
  },
  '/search/id': {
    method: 'GET',
    url: '/search/{id_type}/{id}?type'
  },
  '/search/query': {
    method: 'GET',
    url: '/search/{type}?query&extended'
  },
  '/seasons/season': {
    method: 'GET',
    url: '/shows/{id}/seasons/{season}?translations&extended'
  },
  '/seasons/summary': {
    method: 'GET',
    url: '/shows/{id}/seasons?extended'
  },
  '/shows/summary': {
    method: 'GET',
    url: '/shows/{id}?extended'
  },
  '/shows/translations': {
    method: 'GET',
    url: '/shows/{id}/translations/{language}'
  }
}

/**
 * Trakt.tv API
 *
 * @see https://trakt.docs.apiary.io/
 * @class
 */
export default class Trakt {
  /**
   * API configuration
   *
   * @param {object} config Configuration
   * @param {string} config.client_id Trakt Client ID
   * @param {string} [config.api_url='https://api.trakt.tv'] Trakt API URL
   * @param {boolean} [config.debug=false] Debug
   */
  constructor (config = {}) {
    if (!config.client_id) throw new Error('Trakt Client ID is required')

    /**
     * @private
     */
    this._config = {
      client_id: config.client_id,
      api_url: config.api_url || 'https://api.trakt.tv',
      debug: config.debug || false
    }

    /**
     * @private
     */
    this._headers = {
      'User-Agent': 'Mozilla/5.0',
      'Content-Type': 'application/json;charset=utf-8',
      'trakt-api-key': this._config.client_id,
      'trakt-api-version': 2
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
            if (data.status_message) {
              reject(new Error(data.status_message))
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
      if (parameters) {
        const regex = new RegExp(Object.keys(parameters).map(key => `{${key}}`).join('|'), 'gi')
        pathParameters.push(path[0].replace(regex, (matched) => parameters[matched.replace(/[{}]/g, '')]))
      } else {
        pathParameters.push(path[0])
      }
    }

    // Query String
    if (path[1]) {
      for (const query of path[1].split('&')) {
        const regex = new RegExp(Object.keys(parameters).map(key => `${key}`).join('|'), 'gi')

        if (regex.test(query)) {
          queryString.push(`${query}=${parameters[query]}`)
        }
      }
    }

    // return final URL
    return `${url}${pathParameters.join('')} ${queryString.length > 0 ? `?${queryString.join(' & ')}` : ''}`
  }
}
