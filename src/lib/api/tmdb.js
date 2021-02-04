// ==UserScript==
// @author          Davide
// @namespace       https://github.com/iFelix18
// @exclude         *
// ==UserLibrary==
// @name            TMDb API
// @description     TMDb API for my userscripts
// @copyright       2020, Davide (https://github.com/iFelix18)
// @license         MIT
// @version         1.0.2
// @homepageURL     https://github.com/iFelix18/Userscripts
// @supportURL      https://github.com/iFelix18/Userscripts/issues
// ==/UserLibrary==
// @require         https://cdn.jsdelivr.net/gh/greasemonkey/gm4-polyfill@master/gm4-polyfill.js
// @include         *
// @connect         api.themoviedb.org
// @grant           GM.xmlHttpRequest
// @grant           GM_xmlhttpRequest
// ==/UserScript==

(() => {
  'use strict'

  this.TMDb = class {
    constructor (config = {}) {
      if (!config.apikey) throw Error('TMDb API Key is required')

      this.config = {
        apikey: config.apikey,
        language: config.language || 'en', //* optional
        url: config.url || 'https://api.themoviedb.org/3', //* optional
        debug: config.debug || false //* optional
      }

      this._headers = {
        'User-Agent': 'Mozilla/5.0',
        'Content-Type': 'application/json;charset=utf-8'
      }
    }

    //* https://developers.themoviedb.org/3/movies/get-movie-details
    moviesDetails (id) {
      return new Promise((resolve, reject) => {
        GM.xmlHttpRequest({
          method: 'GET',
          url: `${this.config.url}/movie/${id}?api_key=${this.config.apikey}&language=${this.config.language}`,
          headers: this._headers,
          onload: (response) => {
            if (response.readyState === 4 && response.responseText !== '[]') {
              if (this.config.debug === true) console.log(response)
              const data = JSON.parse(response.responseText)
              resolve(data)
            } else {
              reject(response)
            }
          }
        })
      })
    }

    //* https://developers.themoviedb.org/3/tv/get-tv-details
    tvDetails (id) {
      return new Promise((resolve, reject) => {
        GM.xmlHttpRequest({
          method: 'GET',
          url: `${this.config.url}/tv/${id}?api_key=${this.config.apikey}&language=${this.config.language}`,
          headers: this._headers,
          onload: (response) => {
            if (response.readyState === 4 && response.responseText !== '[]') {
              if (this.config.debug === true) console.log(response)
              const data = JSON.parse(response.responseText)
              resolve(data)
            } else {
              reject(response)
            }
          }
        })
      })
    }

    //* https://developers.themoviedb.org/3/tv-seasons/get-tv-season-details
    seasonDetails (id, season) {
      return new Promise((resolve, reject) => {
        GM.xmlHttpRequest({
          method: 'GET',
          url: `${this.config.url}/tv/${id}/season/${season}?api_key=${this.config.apikey}&language=${this.config.language}`,
          headers: this._headers,
          onload: (response) => {
            if (response.readyState === 4 && response.responseText !== '[]') {
              if (this.config.debug === true) console.log(response)
              const data = JSON.parse(response.responseText)
              resolve(data)
            } else {
              reject(response)
            }
          }
        })
      })
    }

    //* https://developers.themoviedb.org/3/tv-episodes/get-tv-episode-details
    episodeDetails (id, season, episode) {
      return new Promise((resolve, reject) => {
        GM.xmlHttpRequest({
          method: 'GET',
          url: `${this.config.url}/tv/${id}/season/${season}/episode/${episode}?api_key=${this.config.apikey}&language=${this.config.language}`,
          headers: this._headers,
          onload: (response) => {
            if (response.readyState === 4 && response.responseText !== '[]') {
              if (this.config.debug === true) console.log(response)
              const data = JSON.parse(response.responseText)
              resolve(data)
            } else {
              reject(response)
            }
          }
        })
      })
    }
  }
})()
