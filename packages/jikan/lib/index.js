// ==UserScript==
// @author       Davide <iFelix18@protonmail.com>
// @namespace    https://github.com/iFelix18
// @exclude      *
// ==UserLibrary==
// @name         @ifelix18/jikan
// @description  Jikan API for my userscripts
// @copyright    2022, Davide (https://github.com/iFelix18)
// @license      MIT
// @version      3.0.0
// @homepage     https://github.com/iFelix18/Userscripts/tree/master/packages/jikan#readme
// @homepageURL  https://github.com/iFelix18/Userscripts/tree/master/packages/jikan#readme
// @supportURL   https://github.com/iFelix18/Userscripts/issues
// ==/UserLibrary==
// @connect      api.jikan.moe
// @grant        GM.getValue
// @grant        GM.setValue
// @grant        GM.xmlHttpRequest
// ==/UserScript==
this.Jikan = (function () {
  const methods = {
    '/anime/search': {
      method: 'GET',
      optional: ['end_date', 'genres_exclude', 'genres', 'letter', 'max_score', 'min_score', 'order_by', 'page', 'producers', 'query', 'rating', 'score', 'sfw', 'sort', 'start_date', 'status', 'type'],
      url: '/anime?end_date={end_date}&genres_exclude={genres_exclude}&genres={genres}&letter={letter}&max_score={max_score}&min_score={min_score}&order_by={order_by}&page={page}&producers={producers}&q={query}&rating={rating}&score={score}&sfw={sfw}&sort={sort}&start_date={start_date}&status={status}&type={type}'
    }
  }
  class Jikan {
    constructor (config = {}, cache = config.cache || {}) {
      this._config = {
        api_url: config.api_url || 'https://api.jikan.moe/v4',
        limit: config.limit || 25,
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
      if (this._config.debug) console.log(`${response.status} - ${response.finalURL}`)
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
      if (!parameters) throw new Error('Parameters is required')
      const finalURL = this._resolve(method, parameters)
      const hash = await this._crypto(finalURL).then().catch(error => new Error(error))
      const cache = await GM.getValue(hash)
      return new Promise((resolve, reject) => {
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
              const data = JSON.parse(response.responseText)
              if (data.pagination.items.total > 0) {
                if (this._cache.active) {
                  GM.setValue(hash, {
                    data,
                    time: Date.now()
                  })
                }
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
            if (!method.optional.includes(key)) {
              throw new Error(`Missing parameter => ${key}`)
            }
          }
        }
      }
      if (this._config.limit) {
        Queries.push(`limit=${this._config.limit}`)
      }
      const finalURL = `${this._config.api_url}${Parameters.join('/')}${Queries.length > 0 ? `?${Queries.join('&')}` : ''}`
      return finalURL
    }
  }
  return Jikan
}())
