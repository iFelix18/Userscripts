// ==UserScript==
// @author       Davide <iFelix18@protonmail.com>
// @namespace    https://github.com/iFelix18
// @exclude      *
// ==UserLibrary==
// @name         @ifelix18/omdb
// @description  OMDb API for my userscripts
// @copyright    2019, Davide (https://github.com/iFelix18)
// @license      MIT
// @version      3.0.0
// @homepage     https://github.com/iFelix18/Userscripts/tree/master/packages/omdb#readme
// @homepageURL  https://github.com/iFelix18/Userscripts/tree/master/packages/omdb#readme
// @supportURL   https://github.com/iFelix18/Userscripts/issues
// ==/UserLibrary==
// ==/UserScript==

/**
 * API methods
 */
const methods = {
  '/id': {
    method: 'GET',
    optional: [
      'type',
      'year',
      'plot',
      'tomatoes'
    ],
    url: '/?i={id}&type={type}&y={year}&plot={plot}&tomatoes={tomatoes}'
  },
  '/search': {
    method: 'GET',
    optional: [
      'type',
      'year',
      'page'
    ],
    url: '/?s={search}&type={type}&y={year}&page={page}'
  },
  '/title': {
    method: 'GET',
    optional: [
      'type',
      'year',
      'plot',
      'tomatoes'
    ],
    url: '/?t={title}&type={type}&y={year}&plot={plot}&tomatoes={tomatoes}'
  }
}

/**
 * OMDb API
 *
 * @see https://www.omdbapi.com/
 * @class
 */
// eslint-disable-next-line unicorn/prevent-abbreviations
class OMDb {
  /**
   * API configuration
   *
   * @param {object} config Configuration
   * @param {string} config.api_key OMDb API Key
   * @param {string} [config.api_url='https://www.omdbapi.com'] OMDb API URL
   * @param {boolean} [config.debug=false] Debug
   * @param {object} cache Cache
   * @param {boolean} [cache.active=false] Cache status
   * @param {number} [cache.time_to_live=3600] Time yo Live cache, in seconds
   */
  constructor (config = {}, cache = config.cache || {}) {
    if (!config.api_key) throw new Error('OMDb API Key is required')

    this._config = {
      api_key: config.api_key,
      api_url: config.api_url || 'https://www.omdbapi.com',
      debug: config.debug || false
    }

    this._cache = {
      active: cache.active || false,
      TTL: (cache.time_to_live || 3600) * 1000
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
   * @param {object} response Response
   */
  _debug (response) {
    if (this._config.debug) console.log(`${response.status} - ${response.url}`)
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
   * Fetch APIs
   *
   * @private
   * @see https://developer.mozilla.org/en-US/docs/Web/API/AbortController
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage
   * @param {object} method API method
   * @param {object} parameters Function parameters
   * @returns {object} Response
   */
  async _request (method, parameters) {
    const url = this._resolve(method, parameters)
    const hash = await this._crypto(url).then().catch((error) => new Error(error))
    const cache = JSON.parse(sessionStorage.getItem(hash))

    return new Promise((resolve, reject) => {
      const controller = new AbortController()
      const timeout = setTimeout(() => {
        controller.abort()
        reject(new Error('Request times out'))
      }, 15_000)

      if (this._cache.active && cache && ((Date.now() - cache.time) < this._cache.TTL)) { // cache valid
        this._debug({ status: 'cached', url })
        resolve(cache.data)
      } else { // cache not valid
        fetch(url, {
          method: method.method,
          mode: 'cors',
          signal: controller.signal
        })
          .then((response) => {
            clearTimeout(timeout)
            this._debug(response)
            return response.json()
          })
          .then((data) => {
            if (data.Response === 'True') {
              if (this._cache.active) sessionStorage.setItem(hash, JSON.stringify({ data, time: Date.now() }))
              resolve(data)
            } else {
              reject(new Error(data.Error))
            }
          })
          .catch((error) => reject(error))
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
          if (!method.optional.includes(key)) throw new Error(`Missing parameter: ${key}`)
        }
      }
    }

    // API Key and return JSON
    Queries.push(`apikey=${this._config.api_key}`, 'r=json')

    // return final URL
    const finalURL = `${this._config.api_url}${Parameters.join('/')}${Queries.length > 0 ? `?${Queries.join('&')}` : ''}`
    return finalURL
  }
}

export default OMDb
