// ==UserScript==
// @author       Davide <iFelix18@protonmail.com>
// @namespace    https://github.com/iFelix18
// @exclude      *
// ==UserLibrary==
// @name         @ifelix18/trakt
// @description  Trakt API for my userscripts
// @copyright    2020, Davide (https://github.com/iFelix18)
// @license      MIT
// @version      2.2.0
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
    extended: [
      'full'
    ],
    method: 'GET',
    url: '/shows/{id}/seasons/{season}/episodes/{episode}'
  },
  '/episodes/translations': {
    method: 'GET',
    optional: [
      'language'
    ],
    url: '/shows/{id}/seasons/{season}/episodes/{episode}/translations/{language}'
  },
  '/movies/summary': {
    extended: [
      'full'
    ],
    method: 'GET',
    url: '/movies/{id}'
  },
  '/movies/translations': {
    method: 'GET',
    optional: [
      'language'
    ],
    url: '/movies/{id}/translations/{language}'
  },
  '/search/id': {
    extended: [
      'full'
    ],
    method: 'GET',
    optional: [
      'type'
    ],
    url: '/search/{id_type}/{id}?type'
  },
  '/search/query': {
    extended: [
      'full'
    ],
    method: 'GET',
    optional: [
      'fields'
    ],
    url: '/search/{type}?query&fields'
  },
  '/seasons/season': {
    extended: [
      'full'
    ],
    method: 'GET',
    optional: [
      'translations'
    ],
    url: '/shows/{id}/seasons/{season}?translations'
  },
  '/seasons/summary': {
    extended: [
      'full',
      'episodes'
    ],
    method: 'GET',
    url: '/shows/{id}/seasons'
  },
  '/shows/summary': {
    extended: [
      'full'
    ],
    method: 'GET',
    url: '/shows/{id}'
  },
  '/shows/translations': {
    method: 'GET',
    optional: [
      'language'
    ],
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

    this._this = this
    this._methods()
  }

  /**
   * @param {object} response GM.xmlHttpRequest response
   * @private
   */
  _debug (response) {
    if (this._config.debug || response.status !== 200) console.log(`${response.status}: ${response.finalUrl}`)
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
          const data = response.status === 200 ? JSON.parse(response.responseText) : {}
          if (data.length > 0 && response.readyState === 4 && response.status === 200) {
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
    const url = method.url.split('?')
    const providedParameters = new Set(Object.keys(parameters).map(key => `${key}`))

    const Parameters = []
    const Queries = []

    // Parameters
    if (parameters && url[0]) {
      for (let parameter of url[0].split('/')) {
        if (!/\{.+?\}/.test(parameter)) { // eslint-disable-line unicorn/better-regex
          Parameters.push(parameter)
        } else {
          parameter = parameter.replace(/[{}]/g, '')
          if (providedParameters.has(parameter)) {
            Parameters.push(encodeURIComponent(parameters[parameter]))
          } else {
            if (!method.optional.includes(parameter)) throw new Error(`Missing parameter: ${parameter}`)
          }
        }
      }
    }

    // Queries
    if (parameters && url[1]) {
      for (const query of url[1].split('&')) {
        if (providedParameters.has(query)) {
          Queries.push(`${query}=${encodeURIComponent(parameters[query])}`)
        } else {
          if (!method.optional.includes(query)) throw new Error(`Missing parameter: ${query}`)
        }
      }
    }

    // Extended
    if (parameters && method.extended && parameters.extended && method.extended.includes(parameters.extended)) {
      Queries.push(`extended=${parameters.extended}`)
    }

    // return final URL
    const finalURL = `${this._config.api_url}${Parameters.join('/')}${Queries.length > 0 ? `?${Queries.join('&')}` : ''}`
    return finalURL
  }
}
