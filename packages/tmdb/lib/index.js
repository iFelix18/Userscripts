// ==UserScript==
// @author       Davide <iFelix18@protonmail.com>
// @namespace    https://github.com/iFelix18
// @exclude      *
// ==UserLibrary==
// @name         @ifelix18/tmdb
// @description  TMDb API for my userscripts
// @copyright    2020, Davide (https://github.com/iFelix18)
// @license      MIT
// @version      2.2.1
// @homepage     https://github.com/iFelix18/Userscripts/tree/master/packages/tmdb#readme
// @homepageURL  https://github.com/iFelix18/Userscripts/tree/master/packages/tmdb#readme
// @supportURL   https://github.com/iFelix18/Userscripts/issues
// ==/UserLibrary==
// @connect      api.themoviedb.org
// @grant        GM.getValue
// @grant        GM.setValue
// @grant        GM.xmlHttpRequest
// ==/UserScript==
this.TMDb = (function () {
  const methods = {
    '/configuration/api': {
      method: 'GET',
      optional: [],
      url: '/configuration'
    },
    '/configuration/primary_translations': {
      method: 'GET',
      optional: [],
      url: '/configuration/primary_translations'
    },
    '/find': {
      method: 'GET',
      optional: [],
      url: '/find/{external_id}?external_source'
    },
    '/movie/details': {
      append_to_response: true,
      method: 'GET',
      optional: [],
      url: '/movie/{movie_id}'
    },
    '/movie/external_ids': {
      method: 'GET',
      optional: [],
      url: '/movie/{movie_id}/external_ids'
    },
    '/movie/images': {
      method: 'GET',
      optional: ['include_image_language'],
      url: '/movie/{movie_id}/images?include_image_language'
    },
    '/tv/details': {
      append_to_response: true,
      method: 'GET',
      optional: [],
      url: '/tv/{tv_id}'
    },
    '/tv/episode/details': {
      append_to_response: true,
      method: 'GET',
      optional: [],
      url: '/tv/{tv_id}/season/{season_number}/episode/{episode_number}'
    },
    '/tv/episode/external_ids': {
      method: 'GET',
      optional: [],
      url: '/tv/{tv_id}/season/{season_number}/episode/{episode_number}/external_ids'
    },
    '/tv/episode/images': {
      method: 'GET',
      optional: ['include_image_language'],
      url: '/tv/{tv_id}/season/{season_number}/episode/{episode_number}/images?include_image_language'
    },
    '/tv/external_ids': {
      method: 'GET',
      optional: [],
      url: '/tv/{tv_id}/external_ids'
    },
    '/tv/images': {
      method: 'GET',
      optional: ['include_image_language'],
      url: '/tv/{tv_id}/images?include_image_language'
    },
    '/tv/season/details': {
      append_to_response: true,
      method: 'GET',
      optional: [],
      url: '/tv/{tv_id}/season/{season_number}'
    },
    '/tv/season/external_ids': {
      method: 'GET',
      optional: [],
      url: '/tv/{tv_id}/season/{season_number}/external_ids'
    },
    '/tv/season/images': {
      method: 'GET',
      optional: ['include_image_language'],
      url: '/tv/{tv_id}/season/{season_number}/images?include_image_language'
    }
  }
  class TMDatabase {
    constructor (config = {}, cache = config.cache || {}) {
      if (!config.api_key) throw new Error('TMDb API Key is required')
      this._config = {
        api_key: config.api_key,
        api_url: config.api_url || 'https://api.themoviedb.org/3',
        language: config.language,
        debug: config.debug || false
      }
      this._cache = {
        active: cache.active || false,
        TTL: (cache.time_to_live || 3600) * 1e3
      }
      this._headers = {
        'User-Agent': 'Mozilla/5.0',
        'Content-Type': 'application/json;charset=utf-8'
      }
      this._methods()
    }

    _this () {
      return this
    }

    _debug (response) {
      if (this._config.debug) console.log(`${GM.info.script.name}:`, response)
    }

    async _crypto (url) {
      const hashBuffer = await crypto.subtle.digest('SHA-256', (new TextEncoder()).encode(url))
      const hashArray = [...new Uint8Array(hashBuffer)]
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
      return hashHex
    }

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

    async _request (method, parameters) {
      const finalURL = this._resolve(method, parameters)
      const hash = await this._crypto(finalURL).then().catch(error => new Error(error))
      const cache = await GM.getValue(hash)
      return await new Promise((resolve, reject) => {
        if (this._cache.active && cache && Date.now() - cache.time < this._cache.TTL) {
          this._debug({
            status: 'cached',
            finalURL
          })
          resolve(cache.data)
        } else {
          GM.xmlHttpRequest({
            method: method.method,
            url: finalURL,
            headers: this._headers,
            timeout: 15e3,
            onload: response => {
              this._debug({
                status: response.status,
                finalURL
              })
              const data = response.responseText ? JSON.parse(response.responseText) : undefined
              if (data && response.readyState === 4 && response.status === 200) {
                if (this._cache.active) {
                  GM.setValue(hash, {
                    data,
                    time: Date.now()
                  })
                }
                resolve(data)
              } else {
                if (data && data.status_message) {
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
        }
      })
    }

    _resolve (method, parameters) {
      const url = method.url.split('?')
      const providedParameters = parameters ? new Set(Object.keys(parameters).map(key => `${key}`)) : {}
      const Parameters = []
      const Queries = []
      if (url[0]) {
        for (let parameter of url[0].split('/')) {
          if (!/{.+?}/.test(parameter)) {
            Parameters.push(parameter)
          } else {
            parameter = parameter.replace(/[{}]/g, '')
            if (parameters && providedParameters.has(parameter)) {
              Parameters.push(encodeURIComponent(parameters[parameter]))
            } else {
              if (!method.optional.includes(parameter)) throw new Error(`Missing parameter: ${parameter}`)
            }
          }
        }
      }
      if (url[1]) {
        for (const query of url[1].split('&')) {
          if (parameters && providedParameters.has(query)) {
            Queries.push(`${query}=${encodeURIComponent(parameters[query])}`)
          } else {
            if (!method.optional.includes(query)) throw new Error(`Missing parameter: ${query}`)
          }
        }
      }
      Queries.push(`api_key=${this._config.api_key}`)
      if (this._config.language) {
        Queries.push(`language=${this._config.language}`)
      }
      if (method.append_to_response && parameters.append_to_response) {
        Queries.push(`append_to_response=${parameters.append_to_response}`)
      }
      const finalURL = `${this._config.api_url}${Parameters.join('/')}${Queries.length > 0 ? `?${Queries.join('&')}` : ''}`
      return finalURL
    }
  }
  return TMDatabase
}())
