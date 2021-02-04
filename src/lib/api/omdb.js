// ==UserScript==
// @author          Davide
// @namespace       https://github.com/iFelix18
// @exclude         *
// ==UserLibrary==
// @name            OMDb API
// @description     OMDb API for my userscripts
// @copyright       2019, Davide (https://github.com/iFelix18)
// @license         MIT
// @version         1.0.1
// @homepageURL     https://github.com/iFelix18/Userscripts
// @supportURL      https://github.com/iFelix18/Userscripts/issues
// ==/UserLibrary==
// @require         https://cdn.jsdelivr.net/gh/greasemonkey/gm4-polyfill@master/gm4-polyfill.min.js
// @include         *
// @connect         omdbapi.com
// @grant           GM.xmlHttpRequest
// @grant           GM_xmlhttpRequest
// ==/UserScript==

(() => {
  'use strict'

  this.OMDb = class {
    constructor (config = {}) {
      if (!config.apikey) throw new Error('OMDb API Key is required')

      this.config = {
        apikey: config.apikey,
        url: config.url || 'https://www.omdbapi.com', //* optional
        debug: config.debug || false //* optional
      }

      this._headers = {
        'User-Agent': 'Mozilla/5.0',
        'Content-Type': 'application/json;charset=utf-8'
      }
    }

    get (research = {}) {
      const query = {
        id: research.id || '',
        title: research.title || '',
        type: research.type || null, //* optional
        year: research.year || null, //* optional
        plot: research.plot || 'short' //* optional
      }

      return new Promise((resolve, reject) => {
        const url = query.id
          ? `${this.config.url}/?apikey=${this.config.apikey}&i=${query.id}&type=${query.type}&y=${query.year}&plot=${query.plot}`
          : `${this.config.url}/?apikey=${this.config.apikey}&t=${query.title}&type=${query.type}&y=${query.year}&plot=${query.plot}`

        GM.xmlHttpRequest({
          method: 'GET',
          url: url,
          headers: this._headers,
          onload: (response) => {
            if (this.config.debug === true) console.log(response)

            const data = JSON.parse(response.responseText)
            if ((query.id !== '' || query.title !== '') && response.readyState === 4 && response.responseText !== '[]' && data.Response !== 'False') {
              resolve(data)
            } else {
              (query.id === '' && query.title === '')
                ? reject(new Error('A search query (IMDb ID or Title) is required.'))
                : data.Response === 'False'
                  ? reject(new Error(data.Error))
                  : reject(new Error(response))
            }
          }
        })
      })
    }

    search (research = {}) {
      const query = {
        search: research.search || '',
        type: research.type || null, //* optional
        year: research.year || null, //* optional
        page: research.page || '1' //* optional
      }

      return new Promise((resolve, reject) => {
        GM.xmlHttpRequest({
          method: 'GET',
          url: `${this.config.url}/?apikey=${this.config.apikey}&s=${query.search}&type=${query.type}&y=${query.year}&page=${query.page}`,
          headers: this._headers,
          onload: (response) => {
            if (this.config.debug === true) console.log(response)

            const data = JSON.parse(response.responseText)
            if (query.search !== '' && response.readyState === 4 && response.responseText !== '[]' && data.Response !== 'False') {
              resolve(data.Search)
            } else {
              query.search === ''
                ? reject(new Error('A search query is required.'))
                : data.Response === 'False'
                  ? reject(new Error(data.Error))
                  : reject(new Error(response))
            }
          }
        })
      })
    }
  }
})()
