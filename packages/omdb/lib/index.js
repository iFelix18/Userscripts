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
this.OMDb = (function () {
  const methods = {
    '/id': {
      method: 'GET',
      optional: ['type', 'year', 'plot', 'tomatoes'],
      url: '/?i={id}&type={type}&y={year}&plot={plot}&tomatoes={tomatoes}'
    },
    '/search': {
      method: 'GET',
      optional: ['type', 'year', 'page'],
      url: '/?s={search}&type={type}&y={year}&page={page}'
    },
    '/title': {
      method: 'GET',
      optional: ['type', 'year', 'plot', 'tomatoes'],
      url: '/?t={title}&type={type}&y={year}&plot={plot}&tomatoes={tomatoes}'
    }
  }
  // eslint-disable-next-line unicorn/prevent-abbreviations
  class OMDb {
    constructor (config = {}, cache = config.cache || {}) {
      if (!config.api_key) throw new Error('OMDb API Key is required')
      this._config = {
        api_key: config.api_key,
        api_url: config.api_url || 'https://www.omdbapi.com',
        debug: config.debug || false
      }
      this._cache = {
        active: cache.active || false,
        TTL: (cache.time_to_live || 3600) * 1e3
      }
      this._methods()
    }

    _this () {
      return this
    }

    _debug (response) {
      if (this._config.debug) console.log(`${response.status} - ${response.url}`)
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
      const url = this._resolve(method, parameters)
      const hash = await this._crypto(url).then().catch(error => new Error(error))
      const cache = JSON.parse(sessionStorage.getItem(hash))
      return new Promise((resolve, reject) => {
        const controller = new AbortController()
        const timeout = setTimeout(() => {
          controller.abort()
          reject(new Error('Request times out'))
        }, 15e3)
        if (this._cache.active && cache && Date.now() - cache.time < this._cache.TTL) {
          this._debug({
            status: 'cached',
            url
          })
          resolve(cache.data)
        } else {
          fetch(url, {
            method: method.method,
            mode: 'cors',
            signal: controller.signal
          }).then(response => {
            clearTimeout(timeout)
            this._debug(response)
            return response.json()
          }).then(data => {
            if (data.Response === 'True') {
              if (this._cache.active) {
                sessionStorage.setItem(hash, JSON.stringify({
                  data,
                  time: Date.now()
                }))
              }
              resolve(data)
            } else {
              reject(new Error(data.Error))
            }
          }).catch(error => reject(error))
        }
      })
    }

    _resolve (method, parameters) {
      const url = method.url.split('?')
      const providedParameters = parameters ? new Set(Object.keys(parameters).map(key => `${key}`)) : {}
      const Parameters = []
      const Queries = []
      if (url[0]) {
        Parameters.push(url[0])
      }
      if (url[1]) {
        for (const query of url[1].split('&')) {
          const key = /{(\w+)}/g.exec(query)[1]
          const regex = new RegExp(Object.keys(parameters).map(key => `{${key}}`).join('|'), 'gi')
          if (providedParameters.has(key)) {
            Queries.push(query.replace(regex, matched => encodeURIComponent(parameters[matched.replace(/[{}]/g, '')])))
          } else {
            if (!method.optional.includes(key)) throw new Error(`Missing parameter: ${key}`)
          }
        }
      }
      Queries.push(`apikey=${this._config.api_key}`, 'r=json')
      const finalURL = `${this._config.api_url}${Parameters.join('/')}${Queries.length > 0 ? `?${Queries.join('&')}` : ''}`
      return finalURL
    }
  }
  return OMDb
}())
