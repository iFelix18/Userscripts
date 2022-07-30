// ==UserScript==
// @author       Davide <iFelix18@protonmail.com>
// @namespace    https://github.com/iFelix18
// @exclude      *
// ==UserLibrary==
// @name         @ifelix18/rottentomatoes
// @description  Rotten Tomatoes API for my userscripts
// @copyright    2022, Davide (https://github.com/iFelix18)
// @license      MIT
// @version      3.0.1
// @homepage     https://github.com/iFelix18/Userscripts/tree/master/packages/rottentomatoes#readme
// @homepageURL  https://github.com/iFelix18/Userscripts/tree/master/packages/rottentomatoes#readme
// @supportURL   https://github.com/iFelix18/Userscripts/issues
// ==/UserLibrary==
// @connect      rottentomatoes.com
// @grant        GM.getValue
// @grant        GM.setValue
// @grant        GM.xmlHttpRequest
// ==/UserScript==

/**
 * API methods
 */
const methods = {
  '/search': {
    method: 'GET',
    optional: [
      'type'
    ],
    url: '/search/?q={query}&t={type}'
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
   * @param {object} cache Cache
   * @param {boolean} [cache.active=false] Cache status
   * @param {number} [cache.time_to_live=3600] Time to Live cache, in seconds
   */
  constructor (config = {}, cache = config.cache || {}) {
    this._config = {
      api_url: config.api_url || 'https://www.rottentomatoes.com/api/private/v2.0',
      limit: config.limit || 25,
      debug: config.debug || false
    }

    this._cache = {
      active: cache.active || false,
      TTL: (cache.time_to_live || 3600) * 1000
    }

    this._headers = {
      'User-Agent': 'Mozilla/5.0',
      'Content-Type': 'application/json;charset=utf-8'
    }

    this._methods()
  }

  /**
   * This
   *
   * @private
   * @returns {object} This
   */
  _this () {
    return this
  }

  /**
   * @private
   * @param {object} response GM.xmlHttpRequest response
   */
  _debug (response) {
    if (this._config.debug) console.log(`${response.status} - ${response.finalURL}`)
  }

  /**
   * Return final URL SHA-256 hash
   *
   * @private
   * @see https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest#converting_a_digest_to_a_hex_string
   * @param {string} url Final URL
   * @returns {string} SHA-256 hash
   */
  async _crypto (url) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(url))
    const hashArray = [...new Uint8Array(hashBuffer)]
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
    return hashHex
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

      let temporary = this._this()
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
   * @see https://wiki.greasespot.net/GM.getValue
   * @see https://wiki.greasespot.net/GM.setValue
   * @see https://wiki.greasespot.net/GM.xmlHttpRequest
   * @param {object} method API method
   * @param {object} parameters Function parameters
   * @returns {object} Response
   */
  async _request (method, parameters) {
    if (!parameters) throw new Error('Parameters is required')

    const finalURL = this._resolve(method, parameters)
    const hash = await this._crypto(finalURL).then().catch((error) => new Error(error))
    const cache = await GM.getValue(hash)

    return new Promise((resolve, reject) => {
      if (this._cache.active && cache && ((Date.now() - cache.time) < this._cache.TTL)) { // cache valid
        this._debug({ status: 'cached', finalURL })
        resolve(cache.data)
      } else { // cache not valid
        GM.xmlHttpRequest({
          method: method.method,
          url: finalURL,
          headers: this._headers,
          timeout: 15_000,
          onload: (response) => {
            this._debug({ status: response.status, finalURL })

            const data = JSON.parse(response.responseText)

            if (response.readyState === 4 && response.status === 200) {
              if (this._cache.active) GM.setValue(hash, { data, time: Date.now() })
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
      }
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
    const providedParameters = parameters ? new Set(Object.keys(parameters).map((key) => `${key}`)) : {}

    const Parameters = []
    const Queries = []

    // Parameters
    if (url[0]) {
      Parameters.push(url[0])
    }

    // Queries
    if (url[1]) {
      for (const query of url[1].split('&')) {
        const key = /{(\w+)}/g.exec(query)[1]
        const regex = new RegExp(Object.keys(parameters).map((key) => `{${key}}`).join('|'), 'gi')

        if (providedParameters.has(key)) {
          Queries.push(query.replace(regex, (matched) => encodeURIComponent(parameters[matched.replace(/[{}]/g, '')])))
        } else {
          if (!method.optional.includes(key)) {
            throw new Error(`Missing parameter => ${key}`)
          }
        }
      }
    }

    // limit
    if (this._config.limit) {
      Queries.push(`limit=${this._config.limit}`)
    }

    // return final URL
    const finalURL = `${this._config.api_url}${Parameters.join('/')}${Queries.length > 0 ? `?${Queries.join('&')}` : ''}`
    return finalURL
  }
}
