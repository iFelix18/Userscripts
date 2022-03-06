// ==UserScript==
// @author       Davide <iFelix18@protonmail.com>
// @namespace    https://github.com/iFelix18
// @exclude      *
// ==UserLibrary==
// @name         @ifelix18/tmdb
// @description  TMDb API for my userscripts
// @copyright    2020, Davide (https://github.com/iFelix18)
// @license      MIT
// @version      2.0.0
// @homepage     https://github.com/iFelix18/Userscripts/tree/master/packages/tmdb#readme
// @homepageURL  https://github.com/iFelix18/Userscripts/tree/master/packages/tmdb#readme
// @supportURL   https://github.com/iFelix18/Userscripts/issues
// ==/UserLibrary==
// @connect      api.themoviedb.org
// @grant        GM.xmlHttpRequest
// ==/UserScript==

this.TMDb = (function () {
  /**
   * API methods
   */
  const methods = {
    '/configuration/primary_translations': {
      method: 'GET',
      url: '/configuration/primary_translations'
    },
    '/find': {
      method: 'GET',
      url: '/find/{external_id}?external_source'
    },
    '/movie/details': {
      method: 'GET',
      url: '/movie/{movie_id}'
    },
    '/movie/external_ids': {
      method: 'GET',
      url: '/movie/{movie_id}/external_ids'
    },
    '/movie/images': {
      method: 'GET',
      url: '/movie/{movie_id}/images'
    },
    '/tv/details': {
      method: 'GET',
      url: '/tv/{tv_id}'
    },
    '/tv/episode/details': {
      method: 'GET',
      url: '/tv/{tv_id}/season/{season_number}/episode/{episode_number}'
    },
    '/tv/episode/external_ids': {
      method: 'GET',
      url: '/tv/{tv_id}/season/{season_number}/episode/{episode_number}/external_ids'
    },
    '/tv/episode/images': {
      method: 'GET',
      url: '/tv/{tv_id}/season/{season_number}/episode/{episode_number}/images'
    },
    '/tv/external_ids': {
      method: 'GET',
      url: '/tv/{tv_id}/external_ids'
    },
    '/tv/images': {
      method: 'GET',
      url: '/tv/{tv_id}/images'
    },
    '/tv/season/details': {
      method: 'GET',
      url: '/tv/{tv_id}/season/{season_number}'
    },
    '/tv/season/external_ids': {
      method: 'GET',
      url: '/tv/{tv_id}/season/{season_number}/external_ids'
    },
    '/tv/season/images': {
      method: 'GET',
      url: '/tv/{tv_id}/season/{season_number}/images'
    }
  }

  /**
   * TMDb API
   *
   * @see https://developers.themoviedb.org/3/
   * @class
   */
  class TMDb { // eslint-disable-line unicorn/prevent-abbreviations
    /**
     * API configuration
     *
     * @param {object} config Configuration
     * @param {string} config.api_key TMDb API Key
     * @param {string} [config.api_url='https://api.themoviedb.org/3'] TMDb API URL
     * @param {string} [config.language='en-US'] TMDb API language
     * @param {boolean} [config.debug=false] Debug
     */
    constructor (config = {}) {
      if (!config.api_key) throw new Error('TMDb API Key is required')

      /**
       * @private
       */
      this._config = {
        api_key: config.api_key,
        api_url: config.api_url || 'https://api.themoviedb.org/3',
        language: config.language || 'en-US',
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
          queryString.push(`${query}=${parameters[query]}`)
        }
      }
      if (this._config.language) { // language
        queryString.push(`language=${this._config.language}`)
      }
      queryString.push(`api_key=${this._config.api_key}`) // api key

      // return final URL
      return `${url}${pathParameters.join('')}?${queryString.join('&')}`
    }
  }

  return TMDb
})()
